
import React from 'react';

interface WalletCardProps {
  usdBalance: number;
  btcBalance: number;
  currentPrice: number;
}

const WalletCard: React.FC<WalletCardProps> = ({ usdBalance, btcBalance, currentPrice }) => {
  const totalValue = usdBalance + (btcBalance * currentPrice);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-xl">
        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-2">Total Net Worth</span>
        <div className="text-3xl font-mono font-bold text-white">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        <div className="text-emerald-400 text-xs mt-2 font-medium">+2.4% vs last week</div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-2">Fiat Balance</span>
        <div className="text-3xl font-mono font-bold text-white">${usdBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        <span className="text-zinc-500 text-xs">United States Dollar</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-2">Bitcoin Owned</span>
        <div className="text-3xl font-mono font-bold text-amber-500">{btcBalance.toFixed(8)}</div>
        <span className="text-zinc-500 text-xs">≈ ${(btcBalance * currentPrice).toLocaleString()} USD</span>
      </div>
    </div>
  );
};

export default WalletCard;
