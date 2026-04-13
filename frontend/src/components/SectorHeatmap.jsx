import React from 'react';
import { motion } from 'framer-motion';

export default function SectorHeatmap({ sectors }) {
  if (!sectors || sectors.length === 0) return (
    <div className="glass p-10 text-center text-[#3d5a70] font-data text-xs uppercase tracking-widest">
      FETCHING SECTOR DATA...
    </div>
  );

  const getColor = (pChange) => {
    if (pChange > 1.5) return 'bg-[#00ff88]/20 border-[#00ff88]/40 text-[#00ff88]';
    if (pChange > 0) return 'bg-[#00ff88]/10 border-[#00ff88]/20 text-[#00ff88]';
    if (pChange < -1.5) return 'bg-[#ff3355]/20 border-[#ff3355]/40 text-[#ff3355]';
    if (pChange < 0) return 'bg-[#ff3355]/10 border-[#ff3355]/20 text-[#ff3355]';
    return 'bg-[#3d5a70]/10 border-[#1a3348] text-[#7a9bb5]';
  };

  const advancingCount = sectors.filter(s => s.pChange > 0).length;

  return (
    <div className="glass p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] uppercase">Sector Performance</h3>
        <div className="px-2 py-0.5 rounded border border-[#1a3348] text-[9px] font-data text-[#7a9bb5]">
          <span className="text-[#00ff88]">{advancingCount}</span> ADVANCING / <span className="text-[#ff3355]">{sectors.length - advancingCount}</span> DECLINING
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sectors.map((sector, i) => {
          const style = getColor(sector.pChange);
          return (
            <motion.div
              key={sector.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`p-3 rounded border flex flex-col gap-1 transition-all duration-300 hover:scale-[1.02] ${style}`}
            >
              <span className="text-[9px] font-heading tracking-wider uppercase opacity-80">{sector.name}</span>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-data font-bold">
                    {sector.pChange > 0 ? '+' : ''}{sector.pChange.toFixed(1)}%
                </span>
                <span className="text-[8px] font-data opacity-60">₹{sector.value.toLocaleString()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
