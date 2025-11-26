import { StressModelInput, StressModelOutput, FlexibleStressModelOutput } from "../types";

//
// ===================================================================
//  A) SINGLE-DAY STRESS MODEL (unchanged except safety guards)
// ===================================================================
//
export function calculateStressModel(input: StressModelInput): StressModelOutput {
  const unlockValue = Number(input.event.unlock_value_usd);

  const depthLevels = Object.keys(input.orderbook_depth)
    .map((level) => ({
      dropPercent: parseFloat(level) / 100,
      depthUSD: Number(input.orderbook_depth[level]),
    }))
    .sort((a, b) => a.dropPercent - b.dropPercent);

  const brokenLevels = depthLevels.map((d) => ({
    dropPercent: d.dropPercent,
    depthUSD: d.depthUSD,
    broken: unlockValue > d.depthUSD,
  }));

  const deepest = depthLevels[depthLevels.length - 1];
  const neededBeyondDeepest = unlockValue - deepest.depthUSD;

  let slopePer1pct = 1;
  if (depthLevels.length >= 2) {
    const d1 = depthLevels[depthLevels.length - 2];
    const pctDiff = (deepest.dropPercent - d1.dropPercent) * 100;
    slopePer1pct = pctDiff ? (deepest.depthUSD - d1.depthUSD) / pctDiff : 1;
  }

  let estimatedDrop = 0;

  if (neededBeyondDeepest > 0) {
    estimatedDrop = deepest.dropPercent * 100 + neededBeyondDeepest / slopePer1pct;
  } else {
    const firstUnbroken = brokenLevels.find((l) => !l.broken);
    estimatedDrop = firstUnbroken ? firstUnbroken.dropPercent * 100 : deepest.dropPercent * 100;
  }

  const worstCase = estimatedDrop * 1.5 * 0.4;

  const sigma7 = Number(input.volatility.sigma_7d);
  const eventVol = sigma7 * 5;
  const mcRange = 1.96 * eventVol;

  const obi = Number(input.market_structure.order_imbalance);
  const takerBuy = Number(input.flow_data.taker_buy_volume_24h || 0);
  const takerSell = Number(input.flow_data.taker_sell_volume_24h || 0);

  let squeezeProb = 0.3 + obi * 0.2 + (takerBuy >= takerSell ? 0.1 : -0.05);
  squeezeProb = Math.min(Math.max(squeezeProb, 0), 1);

  const cohortRiskMap: Record<string, number> = {
    private: 85,
    team: 75,
    contributors: 80,
    ecosystem: 50,
    private_and_contributors: 85,
  };

  const cohortType = input.event.cohort_type || "private";
  const cohortRisk = cohortRiskMap[cohortType] ?? 70;

  const riskScore =
    0.4 * 80 + 0.2 * 55 + 0.2 * cohortRisk + 0.2 * (60 + obi * 20);

  return {
    orderbook_impact: {
      broken_levels: brokenLevels,
      estimated_drop_percent: estimatedDrop,
    },
    worst_case_drop_percent: worstCase,
    monte_carlo_7d: {
      p50_range: `±${(eventVol * 100).toFixed(2)}%`,
      p95_range: `±${(mcRange * 100).toFixed(2)}%`,
      downside_tail: `-${((mcRange * 100) * 1.35).toFixed(2)}%`,
      upside_tail: `+${((mcRange * 100)).toFixed(2)}%`,
    },
    squeeze: {
      probability: `${(squeezeProb * 100).toFixed(1)}%`,
      potential_gain: "+10% to +20%",
    },
    risk_score: riskScore,
  };
}



//
// ===================================================================
//  B) **FIXED & IMPROVED MULTI-DAY MODEL**
// ===================================================================
//
export function calculateFlexibleStressModel(
  input: StressModelInput
): FlexibleStressModelOutput {
  const unlockTotal = Number(input.event.unlock_value_usd);

  //
  // ======================
  // SELL RATIO PARSER FIX
  // ======================
  //
  let raw: any = input.event.sell_ratio ?? 0.2;
  let sellRatio: number;

  if (typeof raw === "string") {
    const clean = raw.replace("%", "").trim();
    const parsed = parseFloat(clean);
    // If string was "20", parsed is 20. Treat >1 as percentage.
    sellRatio = parsed > 1 ? parsed / 100 : parsed;
  } else {
    // Logic Update:
    // If raw > 1 (e.g. 20), it's a percentage -> 0.2
    // If raw <= 1 (e.g. 1 or 0.2), it's a decimal -> keep as is.
    // This ensures 100% (passed as 1.0) stays 1.0, and 1% (passed as 0.01) stays 0.01.
    sellRatio = raw > 1 ? raw / 100 : raw;
  }

  // Clamp valid range
  sellRatio = Math.min(Math.max(sellRatio, 0), 1);

  const sellDays = input.event.sell_days ?? 7;

  const effectiveSell = unlockTotal * sellRatio;
  const dailySell = effectiveSell / sellDays;

  // Depth levels (do NOT remove duplicates — critical fix)
  // Sort by Percentage Drop
  const depthLevels = Object.keys(input.orderbook_depth)
    .map((level) => ({
      pct: parseFloat(level) / 100,
      depthUSD: Number(input.orderbook_depth[level]),
    }))
    .sort((a, b) => a.pct - b.pct);

  // Identify the Spread Offset
  // (The % drop at which depth is still 0. This represents the bid-ask spread or start of book)
  const zeroBucket = depthLevels.find(d => d.depthUSD === 0);
  const spreadOffset = zeroBucket ? zeroBucket.pct : 0;

  const dailyVolume = Number(input.liquidity.volume_24h);
  const orderImbalance = Number(input.market_structure.order_imbalance);

  const takerBuy = Number(input.flow_data.taker_buy_volume_24h || 0);
  const takerSell = Number(input.flow_data.taker_sell_volume_24h || 0);
  const totalFlow = takerBuy + takerSell;

  const sellFlowRatio = totalFlow > 0 ? takerSell / totalFlow : 0.5;
  const flowPressureModifier = 1 + (sellFlowRatio - 0.5) * 0.5;

  let sigma = Number(input.volatility.sigma_7d);
  let cumulativeImpact = 0;

  const dailyImpacts = [];

  //
  // DEPTH IMPACT FUNCTION
  //
  function computeDepthImpact(sellUSD: number): number {
    if (!depthLevels.length) return 0;

    if (sellUSD <= depthLevels[0].depthUSD) {
      // Safe linear interpolation from 0 to first bucket
      const ratio = sellUSD / Math.max(depthLevels[0].depthUSD, 1); // avoid div0
      return depthLevels[0].pct * 100 * ratio;
    }

    for (let i = 0; i < depthLevels.length - 1; i++) {
      const prev = depthLevels[i];
      const next = depthLevels[i + 1];

      if (
        sellUSD > prev.depthUSD &&
        sellUSD <= next.depthUSD
      ) {
        // If identical depth values, skip interpolation to avoid flat lines or NaN
        if (next.depthUSD === prev.depthUSD) continue;

        const usdRange = next.depthUSD - prev.depthUSD;
        const pctRange = next.pct - prev.pct;
        const progress = (sellUSD - prev.depthUSD) / usdRange;

        return (prev.pct + pctRange * progress) * 100;
      }
    }

    const deepest = depthLevels[depthLevels.length - 1];
    
    // Only extrapolate if we strictly exceed the deepest bucket
    if (sellUSD <= deepest.depthUSD) {
       return deepest.pct * 100;
    }

    // Extrapolation Slope
    const second = depthLevels.length > 1 ? depthLevels[depthLevels.length - 2] : null;
    let slope = 1;
    if (second) {
      const pctDiff = (deepest.pct - second.pct) * 100;
      slope = pctDiff ? (deepest.depthUSD - second.depthUSD) / pctDiff : 1;
    }

    const needed = sellUSD - deepest.depthUSD;
    return deepest.pct * 100 + needed / slope;
  }

  //
  // DAILY LOOP
  //
  for (let day = 1; day <= sellDays; day++) {
    const rawDepthDrop = computeDepthImpact(dailySell);
    
    // FIX: Subtract spread offset so we don't accumulate the spread cost every day
    // We only want the marginal impact caused by the volume
    const netDepthDrop = Math.max(0, rawDepthDrop - (spreadOffset * 100));

    let impactToday =
      netDepthDrop *
      0.4 *
      (1 + sigma) *
      (1 - orderImbalance * 0.25) *
      flowPressureModifier;

    if (impactToday > 50) impactToday = 50;

    cumulativeImpact += impactToday;

    dailyImpacts.push({
      day,
      dailySell,
      depthDrop: rawDepthDrop, // keep raw for debug/display if needed
      impactToday,
      cumulativeImpact,
    });

    // Refill logic
    for (const d of depthLevels) {
      d.depthUSD *= d.depthUSD < 20_000_000 ? 1.1 : 1.4;
    }

    // Volatility feedback (with clamp)
    sigma *= 1 + 0.3 * (dailySell / dailyVolume);
    sigma = Math.min(sigma, 0.1);
  }

  return {
    params: {
      unlockTotal,
      sellRatio,
      sellDays,
      effectiveSell,
      dailySell,
    },
    daily: dailyImpacts,
    final_cumulative_impact_percent: cumulativeImpact,
  };
}
