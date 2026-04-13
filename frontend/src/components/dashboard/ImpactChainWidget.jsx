import { motion } from 'framer-motion';

export default function ImpactChainWidget({ data = {} }) {
  const { variable = "BRENT CRUDE", impacts = [], label = "BRENT AT CURRENT LEVEL MEANS:" } = data;

  return (
    <div className="glass p-6 flex flex-col gap-4 border-l-4 border-l-[#ffaa00]">
      <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] mb-1">"SO WHAT FOR INDIA?" TRANSLATOR</h3>
      
      <div className="flex flex-col gap-1">
        <div className="text-[14px] font-heading font-bold text-[#ffaa00] mb-2">{variable}</div>
        <div className="text-[10px] text-[#7a9bb5] uppercase mb-4 opacity-70 tracking-widest">{label}</div>
        
        <div className="flex flex-col gap-3">
          {impacts.length > 0 ? impacts.map((impact, idx) => (
            <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3"
            >
                <span className="text-[#ffaa00] text-xs font-data">→</span>
                <span className="text-[12px] leading-snug text-[#e8f4f8] font-prose">{impact}</span>
            </motion.div>
          )) : (
            <div className="text-[12px] font-data text-[#3d5a70]">Awaiting impact chain resolution...</div>
          )}
        </div>
      </div>
    </div>
  );
}
