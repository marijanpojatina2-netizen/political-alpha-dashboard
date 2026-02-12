
export enum TradeType {
  BUY = 'KUPNJA',
  SELL = 'PRODAJA'
}

export interface Trade {
  id: string;
  transactionCode: string; // Jedinstveni kod transakcije
  politician: string;
  role: string;
  committee: string;
  ticker: string;
  type: TradeType;
  value: string;
  suspicionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  whySuspicious: string;
  newsConnection: string;
  fundamentalAnalysis?: string;
  date: string; // Točan datum transakcije (YYYY-MM-DD)
}

export interface NewsletterReport {
  date: string;
  highAlertTrades: Trade[];
  fullTable: Trade[];
  conflictAnalysis: string;
  newsRecap: string;
  sectorTrends: { name: string; value: number }[];
}
