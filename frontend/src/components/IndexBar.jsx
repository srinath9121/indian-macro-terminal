import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IndexBar() {
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIndices = async () => {
    try {
      const res = await fetch('/api/market/indices');
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setIndices(json.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching indices:", err);
    }
  };

  useEffect(() => {
    fetchIndices();
    const interval = setInterval(fetchIndices, 60000); // 60s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && indices.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[1000] bg-[#050506]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] shadow-xl overflow-x-auto no-scrollbar py-2 px-6">
      <div className="flex items-center gap-8 min-w-max">
        {indices.map((idx, i) => {
          const isUp = idx.pChange > 0;
          const color = isUp ? '#00E676' : '#FF3D00';
          
          let vixLabel = null;
          if (idx.name === "INDIA VIX") {
            if (idx.value < 15) vixLabel = { text: "CALM", color: "#00E676" };
            else if (idx.value <= 20) vixLabel = { text: "CAUTIOUS", color: "#FFC107" };
            else vixLabel = { text: "FEAR", color: "#FF3D00" };
          }

          return (
            <React.Fragment key={idx.name}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 font-mono text-[11px]"
              >
                <span className="text-[#5a6a88] tracking-widest font-bold uppercase">{idx.name}</span>
                <span className="text-white font-bold">{(idx.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="font-bold flex items-center gap-1" style={{ color }}>
                  {isUp ? "▲" : "▼"} {Math.abs(idx.pChange || 0).toFixed(2)}%
                </span>
                
                {vixLabel && (
                  <span 
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tighter" 
                    style={{ 
                      color: vixLabel.color, 
                      backgroundColor: `${vixLabel.color}15`,
                      border: `1px solid ${vixLabel.color}30`
                    }}
                  >
                    {vixLabel.text}
                  </span>
                )}
              </motion.div>
              {i < indices.length - 1 && (
                <div className="h-4 w-[1px] bg-[rgba(255,255,255,0.1)]" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

