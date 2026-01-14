
import React, { useState, useEffect, useCallback } from 'react';
import WalletCard from './components/WalletCard';
import PriceChart from './components/PriceChart';
import TradeCard from './components/TradeCard';
import ChatAssistant from './components/ChatAssistant';
import { getMarketInsights, getPricePrediction } from './services/geminiService';
import { MarketData, Transaction, WalletState } from './types';
import { INITIAL_USD_BALANCE, INITIAL_BTC_BALANCE, TICK_INTERVAL } from './constants';

const App: React.FC = () => {
  const [currentPrice, setCurrentPrice] = useState(64500);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [wallet, setWallet] = useState<WalletState>({
    usdBalance: INITIAL_USD_BALANCE,
    btcBalance: INITIAL_BTC_BALANCE,
    transactions: []
  });
  const [marketInsights, setMarketInsights] = useState("Analyzing market trends...");
  const [prediction, setPrediction] = useState<{targetPrice: number, reasoning: string} | null>(null);

  // Initialize data
  useEffect(() => {
    // Generate initial 20 points
    const now = Date.now();
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now - (20 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: 64000 + Math.random() * 1000
    }));
    setMarketData(initialData);
    setCurrentPrice(initialData[initialData.length - 1].price);

    // Initial AI Insight
    fetchInsights(initialData[initialData.length - 1].price, initialData);
  }, []);

  // Live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const volatility = 0.0005;
        const change = prev * volatility * (Math.random() - 0.5);
        const nextPrice = prev + change;
        
        setMarketData(current => {
          const newData = [...current, {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: nextPrice
          }].slice(-30);
          return newData;
        });
        
        return nextPrice;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async (price: number, history: MarketData[]) => {
    const text = await getMarketInsights(price, history);
    setMarketInsights(text);
    const pred = await getPricePrediction(price);
    if (pred) setPrediction(pred);
  };

  const handleTrade = (type: 'BUY' | 'SELL', amountUsd: number) => {
    const amountBtc = amountUsd / currentPrice;
    
    setWallet(prev => {
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        amountUsd,
        amountBtc,
        priceAtTime: currentPrice,
        timestamp: new Date()
      };

      return {
        usdBalance: type === 'BUY' ? prev.usdBalance - amountUsd : prev.usdBalance + amountUsd,
        btcBalance: type === 'BUY' ? prev.btcBalance + amountBtc : prev.btcBalance - amountBtc,
        transactions: [newTransaction, ...prev.transactions]
      };
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-black font-black italic">B</div>
            <span className="text-xl font-bold tracking-tight">BitFlow</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Current Price</span>
              <span className="font-mono font-bold text-amber-500">${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">JD</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <WalletCard 
          usdBalance={wallet.usdBalance} 
          btcBalance={wallet.btcBalance} 
          currentPrice={currentPrice} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-8">
            <PriceChart data={marketData} />

            {/* Market Insights */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold">AI Market Sentiment</h3>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                {marketInsights}
              </p>
              {prediction && (
                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">6-Month Target</span>
                    <span className="text-emerald-400 font-mono font-bold">${prediction.targetPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-zinc-400 italic">"{prediction.reasoning}"</p>
                </div>
              )}
            </div>

            {/* History Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold">Recent Activity</h3>
                <button className="text-xs text-amber-500 hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Amount BTC</th>
                      <th className="px-6 py-4 font-medium">Value USD</th>
                      <th className="px-6 py-4 font-medium">Price</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {wallet.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">No transactions yet</td>
                      </tr>
                    ) : (
                      wallet.transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${tx.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono">{tx.amountBtc.toFixed(8)}</td>
                          <td className="px-6 py-4 font-mono">${tx.amountUsd.toLocaleString()}</td>
                          <td className="px-6 py-4 text-zinc-400 font-mono">${tx.priceAtTime.toLocaleString()}</td>
                          <td className="px-6 py-4 text-zinc-500">{tx.timestamp.toLocaleTimeString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <TradeCard 
              currentPrice={currentPrice} 
              usdBalance={wallet.usdBalance} 
              btcBalance={wallet.btcBalance}
              onTrade={handleTrade}
            />

            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-6">
              <h4 className="font-bold text-amber-500 mb-2">Did you know?</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Bitcoin has a hard cap of 21 million coins. This makes it a deflationary asset often referred to as "Digital Gold".
              </p>
              <button className="mt-4 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1">
                Learn more 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      <ChatAssistant walletStatus={`${wallet.usdBalance} USD, ${wallet.btcBalance} BTC`} />
    </div>
  );
};

export default App;
