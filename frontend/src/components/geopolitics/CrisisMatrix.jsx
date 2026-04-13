import React from 'react';
import { motion } from 'framer-motion';

export default function CrisisMatrix({ data = {} }) {
  const assets = [
    { label: 'EQUITY', icon: '📈' },
    { label: 'DEBT', icon: '🏦' },
    { label: 'GOLD', icon: '✨' },
    { label: 'OIL', icon: '🛢️' }
  ];

  const events = [
    { name: 'Red Sea Blockade', impact: { EQUITY: 'high', DEBT: 'med', GOLD: 'low', OIL: 'extreme' } },
    { name: 'US-China Chip War', impact: { EQUITY: 'extreme', DEBT: 'low', GOLD: 'med', OIL: 'low' } },
    { name: 'Iran Sanctions', impact: { EQUITY: 'med', DEBT: 'low', GOLD: 'high', OIL: 'extreme' } }
  ];

  const getRiskColor = (level) => {
    switch (level) {
      case 'extreme': return 'bg-[#ff3355] text-white';
      case 'high': return 'bg-[#ff3355]/40 text-[#ff3355] border-[#ff3355]/60 border';
      case 'med': return 'bg-[#ffaa00]/20 text-[#ffaa00] border-[#ffaa00]/40 border';
      case 'low': return 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30 border';
      default: return 'bg-[#1a3348] text-[#3d5a70]';
    }
  };

  return (
    <div className="glass p-6 flex flex-col gap-4">
      <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] uppercase mb-2">Crisis Risk Matrix</h3>
      
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-5 gap-2 px-1">
            <div className="col-span-1" />
            {assets.map(a => (
                <div key={a.label} className="flex flex-col items-center gap-1">
                    <span className="text-[14px]">{a.icon}</span>
                    <span className="text-[8px] font-heading text-[#3d5a70]">{a.label}</span>
                </div>
            ))}
        </div>

        {events.map((event, idx) => (
            <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="grid grid-cols-5 items-center gap-2 p-1 border-t border-[#1a3348]/40 pt-3"
            >
                <div className="col-span-1 text-[10px] font-heading text-[#e8f4f8] leading-tight">
                    {event.name}
                </div>
                {assets.map(a => (
                    <div 
                        key={a.label}
                        className={`h-8 flex items-center justify-center rounded text-[7px] font-heading tracking-widest uppercase ${getRiskColor(event.impact[a.label])}`}
                    >
                        {event.impact[a.label]}
                    </div>
                ))}
            </motion.div>
        ))}
      </div>
      
      <div className="mt-4 flex flex-col gap-2 p-3 bg-[#0a1520]/60 rounded border border-[#1a3348]">
         <span className="text-[9px] font-heading text-[#ffaa00] tracking-widest uppercase italic">STRATEGIC NOTE</span>
         <p className="text-[11px] font-prose text-[#7a9bb5] leading-relaxed">
            Oil spikes typically cause Rupee outflows from debt first, then volatility in equity within 4-5 trading sessions.
         </p>
      </div>
    </div>
  );
}
