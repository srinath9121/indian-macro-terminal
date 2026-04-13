import { motion } from 'framer-motion';

export default function RiskEventsWidget({ events = [] }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-[#ff3355] shadow-[0_0_8px_rgba(255,51,85,0.6)]';
      case 'developing': return 'bg-[#ffaa00] shadow-[0_0_8px_rgba(255,170,0,0.6)]';
      case 'watch': return 'bg-[#ffaa00] shadow-[0_0_4px_rgba(255,170,0,0.4)]';
      case 'resolving': return 'bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)]';
      default: return 'bg-[#3d5a70]';
    }
  };

  return (
    <div className="glass p-5 flex flex-col gap-4">
      <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] mb-2 uppercase">Top 3 Risk Events</h3>
      
      <div className="flex flex-col gap-3">
        {events.length > 0 ? events.map((event, idx) => (
          <div key={idx} className="flex items-start gap-4 p-2 bg-[#0a1520]/40 rounded border border-[#1a3348]/40 hover:border-[#1a3348] transition-colors">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${getStatusColor(event.status)}`} />
            <div className="flex flex-col gap-1">
                <span className="text-[11px] font-heading text-[#e8f4f8] leading-tight group-hover:text-white transition-colors">{event.name}</span>
                <span className="text-[10px] font-prose text-[#7a9bb5] line-clamp-1 italic">{event.description}</span>
            </div>
          </div>
        )) : (
          <div className="text-[11px] font-data text-[#3d5a70]">Awaiting risk assessment...</div>
        )}
      </div>
    </div>
  );
}
