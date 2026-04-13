import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

export default function InstitutionalFlow({ data }) {
  if (!data || !data.fii) return <div className="p-4 text-[9px] text-[#3a4560] uppercase tracking-widest">Awaiting Flow Data...</div>;

  const isFiiSelling = data.fii.net < 0;
  const isFiiStrongSell = data.fii.net < -2000;
  const isFiiStrongBuy = data.fii.net > 1000;
  
  const fiiColor = isFiiStrongSell ? '#FF3D00' : isFiiStrongBuy ? '#00E676' : '#8892a8';
  const diiColor = data.dii.net > 0 ? '#00E5FF' : '#8892a8';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-4">
      {/* FII Card */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass p-5 relative overflow-hidden" 
        style={{ 
          borderColor: `${fiiColor}20`,
          backgroundColor: isFiiStrongSell ? 'rgba(255, 61, 0, 0.05)' : isFiiStrongBuy ? 'rgba(0, 230, 118, 0.05)' : 'rgba(255,255,255,0.02)'
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-[10px] font-heading tracking-[0.2em] text-[#a0aac0] uppercase mb-1">FII ACTIVITY</h4>
            <div className="text-[9px] font-data text-[#5a6a88] lowercase italic">{data.date || 'Checking...'}</div>
          </div>
          <div className="p-1.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
             {isFiiSelling ? <TrendingDown size={14} color="#FF3D00" /> : <TrendingUp size={14} color="#00E676" />}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-[8px] text-[#5a6a88] uppercase mb-1">Buy Value</div>
            <div className="text-[12px] font-data text-white">₹{data.fii.buy.toLocaleString()} Cr</div>
          </div>
          <div>
            <div className="text-[8px] text-[#5a6a88] uppercase mb-1">Sell Value</div>
            <div className="text-[12px] font-data text-white">₹{data.fii.sell.toLocaleString()} Cr</div>
          </div>
        </div>

        <div className="pt-3 border-t border-[rgba(255,255,255,0.05)]">
           <div className="flex justify-between items-end">
              <span className="text-[9px] font-heading tracking-widest text-[#a0aac0]">{data.fii.net_label}</span>
              <span className="text-[18px] font-data font-bold" style={{ color: fiiColor }}>
                {data.fii.net > 0 ? '+' : ''}{data.fii.net.toLocaleString()} Cr
              </span>
           </div>
        </div>
      </motion.div>

      {/* DII Card */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-5 relative overflow-hidden"
        style={{ 
          borderColor: `${diiColor}20`,
          backgroundColor: data.dii.net > 0 ? 'rgba(0, 229, 255, 0.05)' : 'rgba(255,255,255,0.02)'
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-[10px] font-heading tracking-[0.2em] text-[#a0aac0] uppercase mb-1">DII ACTIVITY</h4>
            <div className="text-[9px] font-data text-[#5a6a88] lowercase italic">Institutional Support</div>
          </div>
          <div className="p-1.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
             <TrendingUp size={14} color="#00E5FF" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-[8px] text-[#5a6a88] uppercase mb-1">Buy Value</div>
            <div className="text-[12px] font-data text-white">₹{data.dii.buy.toLocaleString()} Cr</div>
          </div>
          <div>
            <div className="text-[8px] text-[#5a6a88] uppercase mb-1">Sell Value</div>
            <div className="text-[12px] font-data text-white">₹{data.dii.sell.toLocaleString()} Cr</div>
          </div>
        </div>

        <div className="pt-3 border-t border-[rgba(255,255,255,0.05)]">
           <div className="flex justify-between items-end">
              <span className="text-[9px] font-heading tracking-widest text-[#a0aac0]">{data.dii.net_label}</span>
              <span className="text-[18px] font-data font-bold" style={{ color: diiColor }}>
                {data.dii.net > 0 ? '+' : ''}{data.dii.net.toLocaleString()} Cr
              </span>
           </div>
        </div>
      </motion.div>

      {/* MTD Summary */}
      <div className="col-span-1 md:col-span-2 text-center py-4 bg-[rgba(0,0,0,0.2)] rounded-lg border border-[rgba(255,255,255,0.03)]">
        <p className="text-[11px] font-data text-[#e2e8f0]">
           FIIs have <span className={data.month_to_date_fii_net < 0 ? 'text-[#FF3D00]' : 'text-[#00E676]'}>
             {data.month_to_date_fii_net < 0 ? 'sold' : 'bought'} ₹{Math.abs(data.month_to_date_fii_net).toLocaleString()} Cr
           </span> this month
        </p>
        <p className="text-[8px] font-data text-[#5a6a88] uppercase tracking-widest mt-1">
           {data.month_to_date_fii_net < 0 ? 'Institutional Headwind' : 'Institutional Tailwind'}
        </p>
      </div>
    </div>
  );
}
