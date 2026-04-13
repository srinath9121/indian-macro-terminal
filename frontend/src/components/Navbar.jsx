import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [marketStatus, setMarketStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = () => {
      fetch('/api/market-status')
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(setMarketStatus)
        .catch(() => {});
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 30s check
    return () => clearInterval(interval);
  }, []);

  const isOpen = marketStatus?.is_open;

  return (
    <nav className="fixed top-0 w-full px-8 py-3 flex justify-between items-center z-50 bg-[#050a0f]/90 backdrop-blur-xl border-b border-[#1a3348]">
      <div className="flex items-center gap-10">
        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-2 h-2 rounded-full bg-[#00aaff] shadow-[0_0_10px_rgba(0,170,255,0.8)]" />
          <h1 className="font-heading text-lg tracking-wider text-[#e8f4f8] group-hover:text-white transition-colors">
            INDIA MACRO <span className="text-[#00aaff]">TERMINAL</span>
          </h1>
        </NavLink>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1 bg-[#1a3348]/30 rounded-md p-1 border border-[#1a3348]">
          <NavLink 
            to="/" 
            className={({isActive}) => `
              relative px-4 py-1.5 text-[11px] font-heading flex items-center gap-2 transition-all duration-300 rounded
              ${isActive ? 'bg-[#00aaff]/10 text-[#00aaff] shadow-[inset_0_0_0_1px_rgba(0,170,255,0.2)]' : 'text-[#7a9bb5] hover:text-[#e8f4f8]'}
            `}
          >
            <span className="flex items-center gap-1.5">
              <span className="flex items-center gap-1">
                {isOpen ? (
                    <motion.span 
                        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }} 
                        transition={{ duration: 2, repeat: Infinity }} 
                        className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)]" 
                    />
                ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3d5a70]" />
                )}
                <span className={isOpen ? "text-[#00ff88]" : "text-[#3d5a70]"}>LIVE</span>
              </span>
              <span>PULSE</span>
            </span>
          </NavLink>

          <NavLink 
            to="/markets" 
            className={({isActive}) => `
              px-5 py-1.5 text-[11px] font-heading transition-all duration-300 rounded
              ${isActive ? 'bg-[#00aaff]/10 text-[#00aaff] shadow-[inset_0_0_0_1px_rgba(0,170,255,0.2)]' : 'text-[#7a9bb5] hover:text-[#e8f4f8]'}
            `}
          >
            MARKETS
          </NavLink>

          <NavLink 
            to="/geopolitics" 
            className={({isActive}) => `
              px-5 py-1.5 text-[11px] font-heading transition-all duration-300 rounded
              ${isActive ? 'bg-[#00aaff]/10 text-[#00aaff] shadow-[inset_0_0_0_1px_rgba(0,170,255,0.2)]' : 'text-[#7a9bb5] hover:text-[#e8f4f8]'}
            `}
          >
            GEOPOLITICS
          </NavLink>
        </div>
      </div>

      {/* SYSTEM STATUS INDICATOR */}
      <div className="flex items-center gap-6 text-[10px] font-data tracking-tighter">
        <div className="flex flex-col items-end">
            <span className="text-[#3d5a70] text-[9px] font-heading opacity-50">MARKET STATUS</span>
            <div className="flex items-center gap-2">
                <span style={{ color: marketStatus?.color === 'green' ? '#00ff88' : marketStatus?.color === 'amber' ? '#ffaa00' : '#7a9bb5' }}>
                    {marketStatus?.status || 'INITIALIZING...'}
                </span>
                {marketStatus?.next_event && <span className="text-[#3d5a70]">/ {marketStatus.next_event}</span>}
            </div>
        </div>
        <div className="h-6 w-[1px] bg-[#1a3348]" />
        <div className="flex flex-col items-end">
             <span className="text-[#3d5a70] text-[9px] font-heading opacity-50">LATENCY</span>
             <span className="text-[#00aaff]">24ms</span>
        </div>
      </div>
    </nav>
  );
}
