export interface StressModelInput {
  event: {
    unlock_value_usd: number;
    cohort_type?: string;
    sell_ratio?: number | string;
    sell_days?: number;
  };
  orderbook_depth: {
    [key: string]: number;
  };
  orderbook_L1: {
    best_bid_price: number;
    best_bid_size_usd: number;
    best_ask_price: number;
    best_ask_size_usd: number;
    bid_ask_spread_percent: number;
  };
  liquidity: {
    volume_24h: number;
  };
  market_structure: {
    order_imbalance: number;
  };
  flow_data: {
    taker_buy_volume_24h?: number;
    taker_sell_volume_24h?: number;
  };
  volatility: {
    sigma_7d: number;
  };
}

export interface StressModelOutput {
  orderbook_impact: {
    broken_levels: Array<{
      dropPercent: number;
      depthUSD: number;
      broken: boolean;
    }>;
    estimated_drop_percent: number;
  };
  worst_case_drop_percent: number;
  monte_carlo_7d: {
    p50_range: string;
    p95_range: string;
    downside_tail: string;
    upside_tail: string;
  };
  squeeze: {
    probability: string;
    potential_gain: string;
  };
  risk_score: number;
}

export interface FlexibleStressModelOutput {
  params: {
    unlockTotal: number;
    sellRatio: number;
    sellDays: number;
    effectiveSell: number;
    dailySell: number;
  };
  daily: Array<{
    day: number;
    dailySell: number;
    depthDrop: number;
    impactToday: number;
    cumulativeImpact: number;
  }>;
  final_cumulative_impact_percent: number;
}
