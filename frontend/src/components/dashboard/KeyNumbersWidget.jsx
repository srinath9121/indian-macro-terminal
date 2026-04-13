import { motion } from 'framer-motion';

export default function KeyNumbersWidget({ data = {} }) {
  const getVixLabel = (vix) => {
    if (vix < 13) return 'VERY LOW FEAR';
    if (vix < 16) return 'NORMAL';
    if (vix < 20) return 'ELEVATED CAUTION';
    if (vix < 25) return 'HIGH FEAR';
    return 'EXTREME FEAR';
  };

  const getVixColor = (vix) => {
    if (vix < 16) return 'text-[#00ff88]';
    if (vix < 20) return 'text-[#ffaa00]';
    return 'text-[#ff3355]';
  };

  return (
    <div className="glass p-5 flex flex-col gap-4">
      <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] mb-1">FIVE KEY NUMBERS</h3>
      
      <div className="flex flex-col gap-3">
        {/* NIFTY */}
        <div className="flex justify-between items-center group">
          <span className="text-[#7a9bb5] text-[11px] font-heading group-hover:text-white transition-colors">NIFTY 50</span>
          <div className="flex items-center gap-3 font-data">
            <span className="text-[#e8f4f8] text-sm">{data.NIFTY?.price?.toLocaleString()}</span>
            <span className={data.NIFTY?.direction === 'up' ? 'text-[#00ff88]' : 'text-[#ff3355]'}>
               {data.NIFTY?.direction === 'up' ? '▲' : '▼'} {data.NIFTY?.change}
            </span>
          </div>
        </div>

        {/* SENSEX */}
        <div className="flex justify-between items-center group">
          <span className="text-[#7a9bb5] text-[11px] font-heading group-hover:text-white transition-colors">SENSEX</span>
          <div className="flex items-center gap-3 font-data">
            <span className="text-[#e8f4f8] text-sm">{data.SENSEX?.price?.toLocaleString()}</span>
            <span className={data.SENSEX?.direction === 'up' ? 'text-[#00ff88]' : 'text-[#ff3355]'}>
               {data.SENSEX?.direction === 'up' ? '▲' : '▼'} {data.SENSEX?.change}
            </span>
          </div>
        </div>

        {/* INDIA VIX */}
        <div className="flex justify-between items-center group">
          <span className="text-[#7a9bb5] text-[11px] font-heading group-hover:text-white transition-colors">INDIA VIX</span>
          <div className="flex items-center gap-3 font-data">
            <span className="text-[#e8f4f8] text-sm">{data.INDIAVIX?.price}</span>
            <span className={`${getVixColor(data.INDIAVIX?.price)}`}>
               ▲ {getVixLabel(data.INDIAVIX?.price || 15)}
            </span>
          </div>
        </div>

        {/* BRENT */}
        <div className="flex justify-between items-center group">
          <span className="text-[#7a9bb5] text-[11px] font-heading group-hover:text-white transition-colors">BRENT (USD)</span>
          <div className="flex items-center gap-3 font-data">
            <span className="text-[#e8f4f8] text-sm">${data.BRENT_CRUDE?.price}</span>
            <span className={data.BRENT_CRUDE?.direction === 'up' ? 'text-[#ff3355]' : 'text-[#00ff88]'}>
               {data.BRENT_CRUDE?.direction === 'up' ? '▲' : '▼'} {data.BRENT_CRUDE?.change}
            </span>
          </div>
        </div>

        {/* USD/INR */}
        <div className="flex justify-between items-center group pt-1 border-t border-[#1a3348]/40">
          <span className="text-[#7a9bb5] text-[11px] font-heading group-hover:text-white transition-colors">USD/INR</span>
          <div className="flex items-center gap-3 font-data">
            <span className="text-[#e8f4f8] text-sm">₹{data['USD/INR']?.price}</span>
            <span className={data['USD/INR']?.direction === 'up' ? 'text-[#00ff88]' : 'text-[#ff3355]'}>
               {data['USD/INR']?.direction === 'up' ? '▼' : '▲'} Rupee {data['USD/INR']?.change}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
