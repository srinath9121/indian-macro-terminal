import React from 'react';
import { motion } from 'framer-motion';

export default function StrategicAnalysisCard({ data = {} }) {
  const { 
    hormuz_status = "RESTRICTED", 
    india_oil_at_risk = "3.2 mb/day",
    cad_impact = 1.2,
    russia_oil_share = 32
  } = data;

  return (
    <div className="glass p-6 flex flex-col gap-5 border-l-4 border-l-[#ff3355]">
      <div className="flex justify-between items-center">
        <h3 className="font-heading text-[10px] text-[#7a9bb5] tracking-[0.2em] uppercase">Deep Analysis: Hormuz Strait</h3>
        <span className="text-[9px] font-heading px-2 py-0.5 rounded bg-[#ff3355]/10 border border-[#ff3355]/40 text-[#ff3355]">
            CRITICAL WATCH
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col">
                <span className="text-[8px] font-heading text-[#3d5a70]">TRANSIT STATUS</span>
                <span className="text-[12px] font-data font-bold text-[#ffaa00]">{hormuz_status}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] font-heading text-[#3d5a70]">OIL AT RISK (INDIA)</span>
                <span className="text-[12px] font-data font-bold text-[#ff3355]">{india_oil_at_risk}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] font-heading text-[#3d5a70]">CAD IMPACT %GDP</span>
                <span className="text-[12px] font-data font-bold text-[#ffaa00]">{cad_impact}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] font-heading text-[#3d5a70]">RUSSIA SHARE %</span>
                <span className="text-[12px] font-data font-bold text-[#00ff88]">{russia_oil_share}</span>
             </div>
        </div>

        <div className="h-[1px] bg-[#1a3348]/40" />

        <div className="flex flex-col gap-2">
            <span className="text-[9px] font-heading text-[#7a9bb5] uppercase">Strategic "So What?"</span>
            <p className="text-[11px] font-prose text-[#e8f4f8] leading-relaxed">
               Hormuz blockade affects ~65% of India's crude imports. Even with Russian discounts, the CAD expands by 12bps for every $5 rise in tanker insurance premiums. 
               <span className="text-[#00aaff] block mt-1">Source: Intelligence Unit 04</span>
            </p>
        </div>
      </div>
    </div>
  );
}
