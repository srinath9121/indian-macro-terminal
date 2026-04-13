import { motion } from 'framer-motion';

export default function NewsTicker({ news = [] }) {
  if (!news || news.length === 0) return (
    <div className="glass p-3 border-[#1a3348] border flex items-center justify-center text-[10px] text-[#3d5a70]">
      AWAITING LIVE RSS FEEDS...
    </div>
  );

  const tickerContent = news.map(n => n.headline || n.title).join(" | ");

  return (
    <div className="glass p-3 border-[#1a3348] border relative overflow-hidden group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 px-2 bg-[#050a0f] border border-[#00aaff] text-[#00aaff] text-[8px] font-heading h-4 flex items-center shadow-[0_0_8px_rgba(0,170,255,0.4)]">
        BREAKING NEWS
      </div>
      
      <div className="ticker-container pl-24">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-[11px] text-[#7a9bb5] font-data group-hover:[animation-play-state:paused]"
        >
          {tickerContent} | {tickerContent}
        </motion.div>
      </div>
    </div>
  );
}
