
export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  amountUsd: number;
  amountBtc: number;
  priceAtTime: number;
  timestamp: Date;
}

export interface MarketData {
  time: string;
  price: number;
}

export interface WalletState {
  usdBalance: number;
  btcBalance: number;
  transactions: Transaction[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
