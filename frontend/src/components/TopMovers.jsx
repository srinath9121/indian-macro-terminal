import React from 'react';
import { motion } from 'framer-motion';

export default function TopMovers({ movers }) {
  if (!movers || movers.length === 0) return null;

  return (
    <div className="glass p-5 rounded-xl border border-[rgba(255,255,255,0.05)] w-[280px]">
      
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FFC107', boxShadow: '0 0 6px #FFC107' }} />
        <h2 className="text-[10px] font-heading tracking-[0.2em] text-[#a0aac0] uppercase">
          TOP MACRO MOVERS
        </h2>
      </div>

      <div className="space-y-3">
        {movers.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 + (0.1 * i) }}
            className="p-3 bg-[rgba(10,12,20,0.4)] rounded-lg border border-[rgba(255,255,255,0.03)] hover:border-[#FFC107] transition-colors duration-300 pointer-events-auto"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center bg-[rgba(0,0,0,0.2)] p-2 rounded -mx-1 -mt-1 mb-2 border-b border-[rgba(255,255,255,0.02)]">
              <div className="text-xs font-semibold text-white tracking-wide flex items-center">
                <span className="mr-1.5 text-sm">{m.icon}</span> {m.title}
              </div>
              <div className="text-[10px] text-[#00E5FF] font-data">
                {m.change}
              </div>
            </div>

            {/* SECTORS */}
            <div className="mt-2 space-y-1">
              {m.sectors.map((s, idx) => {
                const isBullish = s.direction === "up";
                const color = isBullish ? '#00E676' : '#FF3D00';
                return (
                  <div key={idx} className="flex justify-between text-[11px] items-center">
                    <span className="text-[#8892a8]">
                      <span className="text-[#3a4560] mr-1">→</span> {s.name}
                    </span>
                    <span 
                      className="font-bold flex items-center gap-1 text-[10px]"
                      style={{ color }}
                    >
                      {isBullish ? "▲" : "▼"} {s.impact}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* REASON */}
            <div className="mt-3 text-[9px] text-[#5a6a88] border-t border-[rgba(255,255,255,0.03)] pt-2 uppercase tracking-wide">
              {m.reason}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
