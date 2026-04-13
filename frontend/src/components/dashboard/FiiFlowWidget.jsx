import { motion } from 'framer-motion';

export default function FiiFlowWidget({ data = {} }) {
  const { fii = {}, dii = {}, net = 0 } = data;
  
  const isHeavySelling = net < -2000;
  const isStrongBuying = net > 2000;

  return (
    <div className="glass p-5 flex flex-col gap-4">
      <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] mb-1 uppercase">Institutions Today</h3>
      
      <div className="flex flex-col gap-3">
        {/* FII */}
        <div className="flex justify-between items-center">
            <span className="text-[#00aaff] text-[11px] font-heading font-medium tracking-widest">FII</span>
            <div className="flex items-center gap-2 font-data">
                <span className={fii.net > 0 ? 'text-[#00ff88]' : 'text-[#ff3355]'}>
                    {fii.net > 0 ? '▲ BOUGHT' : '▼ SOLD'}
                </span>
                <span className="text-[#e8f4f8] text-sm">₹{Math.abs(fii.net || 0).toLocaleString()} Cr</span>
            </div>
        </div>

        {/* DII */}
        <div className="flex justify-between items-center">
            <span className="text-[#aa55ff] text-[11px] font-heading font-medium tracking-widest">DII</span>
            <div className="flex items-center gap-2 font-data">
                <span className={dii.net > 0 ? 'text-[#00ff88]' : 'text-[#ff3355]'}>
                    {dii.net > 0 ? '▲ BOUGHT' : '▼ SOLD'}
                </span>
                <span className="text-[#e8f4f8] text-sm">₹{Math.abs(dii.net || 0).toLocaleString()} Cr</span>
            </div>
        </div>

        {/* NET */}
        <div className="flex justify-between items-center mt-1 pt-2 border-t border-[#1a3348]/60">
            <span className="text-[#7a9bb5] text-[11px] font-heading">NET FLOW</span>
            <div className="flex items-center gap-2 font-data">
                <span className={net > 0 ? 'text-[#00ff88]' : 'text-[#ff3355]'}>
                    {net > 0 ? '▲' : '▼'} ₹{Math.abs(net).toLocaleString()} Cr
                </span>
                <span className="text-[10px] text-[#3d5a70]">({net > 0 ? 'INFLOW' : 'OUTFLOW'})</span>
            </div>
        </div>

        {/* Warnings */}
        {(isHeavySelling || isStrongBuying) && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-2 p-2 rounded text-center text-[10px] font-heading tracking-[0.1em] border ${isHeavySelling ? 'bg-[#ff3355]/10 border-[#ff3355]/30 text-[#ff3355]' : 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]'}`}
            >
                {isHeavySelling ? '⚠️ HEAVY FOREIGN SELLING' : '✅ STRONG FOREIGN BUYING'}
            </motion.div>
        )}
      </div>
    </div>
  );
}
