import React from 'react';
import { motion } from 'framer-motion';

export default function IndiaContextPanels({ fii, rbi }) {
  if (!fii || !rbi) return null;

  const fiiColor = fii.fii_net > 0 ? '#00E676' : '#FF3D00';
  const diiColor = fii.dii_net > 0 ? '#00E676' : '#FF3D00';

  return (
    <div className="flex gap-4 pointer-events-auto">
      {/* FII/DII Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="glass p-4 rounded-xl border border-[rgba(255,255,255,0.05)] w-48 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        <h3 className="text-[9px] font-heading tracking-[0.2em] text-[#a0aac0] uppercase mb-3 text-center border-b border-[rgba(255,255,255,0.05)] pb-2">
          FII / DII FLOWS ({fii.period})
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-[rgba(255,0,0,0.02)] px-2 py-1.5 rounded">
            <span className="text-[10px] text-[#8892a8] font-bold tracking-wider">FII NET</span>
            <span className="text-[11px] font-data font-bold" style={{ color: fiiColor, textShadow: `0 0 8px ${fiiColor}40` }}>
              {fii.fii_net > 0 ? `+₹${fii.fii_net} Cr` : `-₹${Math.abs(fii.fii_net)} Cr`}
            </span>
          </div>
          <div className="flex justify-between items-center bg-[rgba(0,255,0,0.02)] px-2 py-1.5 rounded">
            <span className="text-[10px] text-[#8892a8] font-bold tracking-wider">DII NET</span>
            <span className="text-[11px] font-data font-bold" style={{ color: diiColor, textShadow: `0 0 8px ${diiColor}40` }}>
              {fii.dii_net > 0 ? `+₹${fii.dii_net} Cr` : `-₹${Math.abs(fii.dii_net)} Cr`}
            </span>
          </div>
        </div>
      </motion.div>

      {/* RBI Policy Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
        className="glass p-4 rounded-xl border border-[rgba(255,255,255,0.05)] w-40 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        {/* Subtle background icon */}
        <div className="absolute opacity-[0.03] text-6xl rotate-[-20deg] left-0 bottom-0 pointer-events-none">🏦</div>
        
        <h3 className="text-[9px] font-heading tracking-[0.2em] text-[#a0aac0] uppercase mb-3 w-full text-center border-b border-[rgba(255,255,255,0.05)] pb-2 z-10">
          RBI POLICY
        </h3>
        
        <div className="flex flex-col items-center gap-1 z-10">
          <span className="text-[10px] text-[#5a6a88]">REPO RATE</span>
          <span className="text-xl font-data font-bold tracking-wider glow-cyan" style={{ color: '#00E5FF' }}>
            {rbi.repo_rate}%
          </span>
        </div>
        
        <div className="flex w-full justify-between mt-3 text-[9px] font-data tracking-widest text-[#8892a8] uppercase z-10">
          <span>CPI: <span className="font-bold text-white">{rbi.cpi_latest}%</span></span>
          <span>TGT: <span className="font-bold text-white">{rbi.cpi_target}%</span></span>
        </div>
      </motion.div>
    </div>
  );
}
