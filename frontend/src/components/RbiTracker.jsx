import React from 'react';
import { motion } from 'framer-motion';

export default function RbiTracker({ data }) {
  if (!data || data.error) return <div>Awaiting RBI policy...</div>;

  const nextDate = new Date(data.next_mpc_date);
  const today = new Date();
  const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-5 w-full max-w-sm mt-4 border-l-4" 
      style={{ borderColor: '#00E5FF' }}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-[10px] font-heading tracking-[0.2em] text-[#a0aac0] uppercase mb-1">RBI POLICY STATUS</h4>
          <div className="text-[8px] font-data text-[#5a6a88] lowercase italic italic tracking-widest">Monetary Policy Committee</div>
        </div>
        <div className="px-2 py-0.5 rounded text-[9px] font-heading bg-[rgba(0,229,255,0.1)] text-[#00E5FF] border border-[rgba(0,229,255,0.2)]">
          {data.stance.toUpperCase()}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="flex flex-col">
          <span className="text-[28px] font-data font-bold text-white leading-none">{data.repo_rate.toFixed(2)}%</span>
          <span className="text-[9px] font-data text-[#5a6a88] uppercase mt-1 tracking-tighter">Current Repo Rate</span>
        </div>
        <div className="h-10 w-[1px] bg-[rgba(255,255,255,0.1)]" />
        <div className="flex flex-col">
          <span className="text-[12px] font-data text-[#e2e8f0] uppercase">{data.last_action}</span>
          <span className="text-[8px] font-data text-[#5a6a88] uppercase mt-1">{data.last_action_date}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-[rgba(255,255,255,0.05)]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[9px] text-[#5a6a88] uppercase">CPI Inflation</span>
          <span className="text-[10px] font-data text-white">{data.cpi_last}% <span className="text-[#00E676] text-[8px] italic">Vs {data.cpi_target}% Target</span></span>
        </div>
        <div className="w-full bg-[rgba(255,255,255,0.02)] h-1 rounded-full overflow-hidden">
           <div className="h-full bg-[#00E5FF]" style={{ width: `${(data.cpi_last / data.cpi_target) * 50}%` }} />
        </div>
      </div>

      <div className="mt-4 py-2 px-3 bg-[rgba(0,229,255,0.03)] rounded border border-[rgba(0,229,255,0.05)]">
        <div className="text-[9px] font-data text-[#00E5FF] uppercase tracking-widest text-center">
           Next MPC Meeting in <span className="font-bold">{diffDays} Days</span>
        </div>
      </div>
    </motion.div>
  );
}
