import React from 'react';
import { motion } from 'framer-motion';

export default function RiskTimeline({ news = [] }) {
  if (!news || news.length === 0) return (
    <div className="glass p-10 text-center text-[#3d5a70] font-data text-xs uppercase tracking-widest">
      AWAITING STRATEGIC FEEDS...
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] uppercase mb-2">Strategic Risk Timeline</h3>
      
      <div className="relative border-l border-[#1a3348] ml-2 pb-8">
        {news.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="mb-8 ml-6 relative group"
          >
            {/* Timeline Dot */}
            <div className={`absolute -left-[30px] top-1.5 w-3 h-3 rounded-full border-2 border-[#050a0f] shadow-[0_0_8px_rgba(255,255,255,0.2)] ${item.bias === 'bearish' ? 'bg-[#ff3355]' : item.bias === 'bullish' ? 'bg-[#00ff88]' : 'bg-[#7a9bb5]'}`} />
            
            <div className="glass p-5 flex flex-col gap-3 group-hover:border-[#00aaff]/40 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-heading text-[#3d5a70] tracking-widest uppercase">{item.source || 'INTEL'}</span>
                {item.category && (
                  <span className="px-1.5 py-0.5 rounded bg-[#ff3355]/10 border border-[#ff3355]/30 text-[#ff3355] text-[7px] font-heading tracking-widest">
                    {item.category.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>
              
              <h4 className="text-[13px] font-heading leading-snug text-[#e8f4f8] group-hover:text-white transition-colors">
                {item.headline}
              </h4>
              
              <div className="flex items-center gap-4 mt-1 border-t border-[#1a3348]/40 pt-3">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-heading text-[#3d5a70]">MACRO IMPACT</span>
                    <span className="text-[10px] font-data text-[#ffaa00] uppercase">Medium Alert</span>
                 </div>
                 <div className="h-6 w-[1px] bg-[#1a3348]" />
                 <p className="text-[11px] font-prose text-[#7a9bb5] italic flex-1">
                    "{item.bias === 'bearish' ? 'Strategic headwind for India crude supply chain.' : 'Neutral transition in diplomatic channels.'}"
                 </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
