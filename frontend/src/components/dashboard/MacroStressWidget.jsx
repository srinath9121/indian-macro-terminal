import { motion } from 'framer-motion';

export default function MacroStressWidget({ score = 0, contributors = [] }) {
  const getStatus = (val) => {
    if (val < 40) return { color: 'text-[#00ff88]', label: 'Environment stable. Normal positioning.' };
    if (val <= 55) return { color: 'text-[#ffaa00]', label: 'Moderate pressure. Monitor oil and rupee.' };
    if (val <= 70) return { color: 'text-[#ffaa00]', label: 'Elevated stress. Defensive tilt warranted.' };
    if (val <= 85) return { color: 'text-[#ff3355]', label: 'High stress. Risk-off conditions active.' };
    return { color: 'text-[#ff3355]', label: 'Crisis mode. Capital preservation priority.' };
  };

  const status = getStatus(score);

  return (
    <div className="glass p-6 flex flex-col gap-4 border-l-4" style={{ borderLeftColor: score > 70 ? '#ff3355' : score > 40 ? '#ffaa00' : '#00ff88' }}>
      <div className="flex justify-between items-start">
        <h2 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em]">MACRO STRESS INDEX</h2>
        <div className="text-[10px] font-data text-[#3d5a70]">SYSTEM.LIVE</div>
      </div>

      <div className="flex items-baseline gap-2">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-6xl font-data font-bold ${status.color}`}
        >
          {score.toFixed(1)}
        </motion.span>
        <span className="text-[#3d5a70] font-data text-sm">/ 100</span>
      </div>

      <div className="bg-[#0a1520]/50 p-3 rounded border border-[#1a3348]">
        <p className={`text-xs leading-relaxed ${status.color} font-medium`}>
          {status.label}
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="text-[9px] font-heading text-[#3d5a70] mb-1">TOP CONTRIBUTORS (SHAP WEIGHTS)</div>
        {contributors.length > 0 ? contributors.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-[11px] font-data">
            <span className="text-[#7a9bb5] uppercase">{item.label}</span>
            <span className="text-[#e8f4f8]">{item.weight > 0 ? '+' : ''}{item.weight}% weight</span>
          </div>
        )) : (
          <div className="text-[11px] font-data text-[#3d5a70]">Awaiting SHAP decomposition...</div>
        )}
      </div>
    </div>
  );
}
