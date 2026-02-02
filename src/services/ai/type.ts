export interface AIAnalysisParams {
  symbol: string;
}

export interface AIAnalysisResponse {
  symbol: string;
  trend: {
    direction: string;
    confidence: number;
  };
  fear_greed: {
    score: number;
    label: string;
  };
  causal_analysis: string;
}