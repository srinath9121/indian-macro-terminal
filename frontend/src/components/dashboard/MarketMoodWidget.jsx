import { motion } from 'framer-motion';

export default function MarketMoodWidget({ data = {} }) {
  const { text = "Analyzing market signals...", tone = "neutral" } = data;
  
  const toneMap = {
    bullish: { color: 'text-[#00ff88]', border: 'border-[#00ff88]/30', bg: 'bg-[#00ff88]/5', label: 'BULLISH' },
    bearish: { color: 'text-[#ff3355]', border: 'border-[#ff3355]/30', bg: 'bg-[#ff3355]/5', label: 'BEARISH' },
    neutral: { color: 'text-[#7a9bb5]', border: 'border-[#1a3348]', bg: 'bg-[#0a1520]/50', label: 'NEUTRAL' }
  };

  const current = toneMap[tone] || toneMap.neutral;

  return (
    <div className="glass p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] uppercase">Market Mood Summary</h3>
        <span className={`text-[9px] font-heading px-2 py-0.5 rounded border ${current.color} ${current.border} ${current.bg}`}>
            {current.label}
        </span>
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[13px] leading-[1.6] text-[#e8f4f8] font-prose italic"
      >
        "{text}"
      </motion.p>
      
      <div className="text-[9px] font-data text-[#3d5a70] uppercase mt-2">
        DESTRUCTIVE SIGNAL DECODED BY MACRO-V3
      </div>
    </div>
  );
}
