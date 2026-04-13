import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopMoversList({ movers }) {
  const [activeTab, setActiveTab] = useState('gainers');

  if (!movers || !movers.gainers) return <div className="p-10 text-center text-[#3a4560] font-data uppercase tracking-widest text-xs">Loading NSE Data...</div>;

  const tabs = [
    { id: 'gainers', label: 'Top Gainers' },
    { id: 'losers', label: 'Top Losers' },
    { id: 'volume_shockers', label: 'Volume Shockers' }
  ];

  const currentData = movers[activeTab] || [];

  return (
    <div className="glass p-6 rounded-xl border border-[rgba(255,255,255,0.05)] w-full max-w-2xl mt-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF10] blur-3xl rounded-full pointer-events-none" />

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[11px] font-heading tracking-[0.3em] text-[#a0aac0] uppercase mb-1">
            NSE MARKET MOVERS
          </h2>
          <div className="text-[9px] font-data text-[#5a6a88] uppercase tracking-wide">
            {movers.market_status || 'Market Hours'} │ {movers.source || 'yfinance'}
          </div>
        </div>

        <div className="flex bg-[rgba(0,0,0,0.3)] p-1 rounded-lg border border-[rgba(255,255,255,0.05)] shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-[10px] font-heading tracking-widest transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]' 
                  : 'text-[#8892a8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-4 px-4 py-2 text-[9px] font-heading tracking-widest text-[#3a4560] uppercase border-b border-[rgba(255,255,255,0.03)] mb-2">
        <div className="col-span-1">Instrument</div>
        <div className="col-span-1 text-center">Trend</div>
        <div className="col-span-1 text-right">LTP (₹)</div>
        <div className="col-span-1 text-right">Change</div>
      </div>

      {/* Rows */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-1"
        >
          {currentData.map((stock, i) => {
            const isUp = stock.pChange > 0;
            const color = isUp ? '#00E676' : '#FF3D00';
            
            return (
              <motion.div 
                key={stock.symbol}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-4 items-center px-4 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.02)] border border-transparent hover:border-[rgba(255,255,255,0.05)] transition-all group"
              >
                {/* Symbol */}
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] font-data font-bold text-[#e2e8f0] group-hover:text-[#00E5FF] transition-colors">
                      {stock.symbol}
                    </div>
                    {stock.macro_flag && (
                      <span 
                        className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-tighter"
                        style={{ 
                          backgroundColor: stock.macro_flag.includes('✅') ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 193, 7, 0.15)',
                          color: stock.macro_flag.includes('✅') ? '#00E676' : '#FFC107',
                          border: `1px solid ${stock.macro_flag.includes('✅') ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 193, 7, 0.2)'}`
                        }}
                      >
                        {stock.macro_flag}
                      </span>
                    )}
                  </div>
                  <div className="text-[8px] font-data text-[#5a6a88] truncate pr-2">
                     {stock.volume.toLocaleString()} VOL
                  </div>
                </div>

                {/* Sparkline Placeholder */}
                <div className="col-span-1 flex justify-center items-center h-8 px-4">
                  <svg width="100%" height="100%" viewBox="0 0 100 30">
                    <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 2" />
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1 }}
                      d={`M 0 ${15 + (Math.random() * 10 - 5)} Q 25 ${15 + (Math.random() * 10 - 5)}, 50 ${15 + (Math.random() * 10 - 5)} T 100 ${15 + (Math.random() * 10 - 5)}`}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                  </svg>
                </div>

                {/* LTP */}
                <div className="col-span-1 text-right font-data text-[11px] text-[#e2e8f0]">
                  {stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>

                {/* Change */}
                <div className="col-span-1 text-right">
                  <div className="text-[11px] font-data font-bold" style={{ color }}>
                    {isUp ? '+' : ''}{stock.change.toFixed(2)}
                  </div>
                  <div className="text-[9px] font-data font-semibold opacity-80" style={{ color }}>
                    ({isUp ? '+' : ''}{stock.pChange.toFixed(2)}%)
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.03)] text-center">
        <span className="text-[8px] font-data text-[#3a4560] uppercase tracking-[0.2em]">
          DATA DELAYED 15 MIN │ NEXT REFRESH IN 5M
        </span>
      </div>
    </div>
  );
}
