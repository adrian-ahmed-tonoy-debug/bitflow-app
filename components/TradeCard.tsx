
import React, { useState, useEffect } from 'react';

interface TradeCardProps {
  currentPrice: number;
  usdBalance: number;
  btcBalance: number;
  onTrade: (type: 'BUY' | 'SELL', amountUsd: number) => void;
}

const TradeCard: React.FC<TradeCardProps> = ({ currentPrice, usdBalance, btcBalance, onTrade }) => {
  const [amount, setAmount] = useState<string>('');
  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');
  const [showSuccess, setShowSuccess] = useState(false);

  const btcValue = parseFloat(amount) ? (mode === 'BUY' ? parseFloat(amount) / currentPrice : parseFloat(amount) * currentPrice) : 0;
  const estFee = btcValue * 0.001; // 0.1% simulated fee

  const handlePercentage = (pct: number) => {
    if (mode === 'BUY') {
      setAmount(((usdBalance * pct) / 100).toFixed(2));
    } else {
      setAmount(((btcBalance * pct) / 100).toFixed(8));
    }
  };

  const handlePreset = (val: number) => {
    if (mode === 'BUY') {
      setAmount(val.toString());
    } else {
      // For sell, we might want presets in BTC, but for "friendly" we can stick to USD equivalent if preferred.
      // Here we just use the raw value as BTC for sell presets or keep it USD-centric.
      setAmount((val / currentPrice).toFixed(8));
    }
  };

  const handleAction = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    if (mode === 'BUY') {
      if (numAmount > usdBalance) return;
      onTrade('BUY', numAmount);
    } else {
      if (numAmount > btcBalance) return;
      onTrade('SELL', numAmount * currentPrice);
    }

    setAmount('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-10 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Trade Successful!</h3>
          <p className="text-zinc-400 text-sm mt-1">Your wallet has been updated.</p>
        </div>
      )}

      <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl mb-6">
        <button 
          onClick={() => { setMode('BUY'); setAmount(''); }}
          className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${mode === 'BUY' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Buy
        </button>
        <button 
          onClick={() => { setMode('SELL'); setAmount(''); }}
          className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${mode === 'SELL' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              {mode === 'BUY' ? 'Amount to Spend' : 'Amount to Sell'}
            </span>
            <span className="text-xs text-zinc-400">
              Balance: <span className="font-mono text-zinc-200">
                {mode === 'BUY' ? `$${usdBalance.toLocaleString()}` : `${btcBalance.toFixed(8)} BTC`}
              </span>
            </span>
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-lg">
              {mode === 'BUY' ? '$' : '₿'}
            </div>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 outline-none rounded-2xl py-5 pl-10 pr-4 text-3xl font-mono transition-all group-hover:border-zinc-700"
            />
          </div>

          {/* Quick Selection Buttons */}
          <div className="flex justify-between gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <button 
                key={pct}
                onClick={() => handlePercentage(pct)}
                className="flex-1 bg-zinc-950 border border-zinc-800 py-2 rounded-lg text-[10px] font-bold text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Preset Values - Smart Shortcuts */}
          {mode === 'BUY' && (
            <div className="flex flex-wrap gap-2 pt-1">
              {[10, 50, 100, 500].map((val) => (
                <button 
                  key={val}
                  onClick={() => handlePreset(val)}
                  className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 rounded-full text-xs font-medium text-zinc-300 border border-zinc-700/50"
                >
                  +${val}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transaction Summary Table */}
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">You Receive</span>
            <span className={`font-mono font-bold ${mode === 'BUY' ? 'text-emerald-400' : 'text-zinc-200'}`}>
              {mode === 'BUY' ? `≈ ${btcValue.toFixed(8)} BTC` : `$${btcValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Est. Network Fee (0.1%)</span>
            <span className="text-zinc-400 font-mono">
              {mode === 'BUY' ? `${estFee.toFixed(8)} BTC` : `$${(estFee * currentPrice).toFixed(2)}`}
            </span>
          </div>
          <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs">
            <span className="text-zinc-500">Price Rate</span>
            <span className="text-zinc-300 font-mono">1 BTC = ${currentPrice.toLocaleString()}</span>
          </div>
        </div>

        <button 
          onClick={handleAction}
          disabled={!amount || parseFloat(amount) <= 0}
          className={`w-full py-5 rounded-2xl font-black text-xl transition-all transform active:scale-[0.98] ${
            mode === 'BUY' 
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-xl shadow-amber-500/20' 
              : 'bg-white hover:bg-zinc-200 text-black shadow-xl shadow-white/5'
          } disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed`}
        >
          {mode === 'BUY' ? 'Buy Bitcoin' : 'Sell Bitcoin'}
        </button>
      </div>
    </div>
  );
};

export default TradeCard;
