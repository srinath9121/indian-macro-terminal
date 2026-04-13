import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Animated number counter — numbers "tally up" on load
const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    // Extract numeric part
    const numStr = String(value).replace(/[^0-9.\-]/g, '');
    const target = parseFloat(numStr);
    if (isNaN(target)) {
      setDisplay(String(value));
      return;
    }

    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
    let startTime;
    const duration = 1200;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [value]);

  return <span>{prefix}{display}{suffix}</span>;
};

const SignalPanel = ({ title, value, change, direction, status, delay = 0 }) => {
  const isUp = direction === 'up';
  const isBearish = status === 'SELL' || status === 'BEARISH' || status === 'RISK';
  const isBullish = status === 'BUY' || status === 'BULLISH' || status === 'STABLE';

  // FUI colors
  const accentColor = isBearish ? '#FF3D00' : isBullish ? '#00E676' : '#00E5FF';
  const changeColor = isUp ? '#00E676' : '#FF3D00';
  const glowClass = isBearish ? 'glow-red' : isBullish ? 'glow-green' : 'glow-cyan';
  const dotGlowClass = isBearish ? 'dot-glow-red' : isBullish ? 'dot-glow-green' : 'dot-glow-cyan';

  // Parse numeric value for the counter
  const numericValue = String(value).replace(/[^0-9.]/g, '');
  const prefix = String(value).match(/^[^0-9]*/)?.[0] || '';

  // Progress width based on change percentage
  const changePct = parseFloat(String(change).replace(/[^0-9.\-]/g, ''));
  const progressWidth = Math.min(Math.abs(changePct) * 8 + 20, 95);

  return (
    <motion.div
      initial={{ x: 120, opacity: 0, scale: 0.95 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ delay: delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full md:w-72 p-4 mt-2 glass group cursor-pointer"
      style={{
        borderColor: `${accentColor}15`,
      }}
    >
      {/* Header row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${isBearish ? 'animate-pulse-glow-red' : 'animate-pulse-glow'}`}
            style={{ backgroundColor: accentColor }}
          />
          <h3 className="font-data text-[10px] uppercase tracking-[0.15em] font-medium"
              style={{ color: '#8a95b0' }}>
            {title}
          </h3>
        </div>
        <span
          className="px-2.5 py-0.5 rounded text-[9px] font-heading font-bold tracking-wider"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
            textShadow: `0 0 8px ${accentColor}40`,
          }}
        >
          {status}
        </span>
      </div>

      {/* Value row — the big number with bloom glow */}
      <div className="flex items-baseline gap-3 mb-3">
        <div className={`text-[28px] font-data font-bold text-white ${glowClass}`}>
          <AnimatedNumber value={numericValue} prefix={prefix} />
        </div>
        <div className="flex items-center gap-1 font-data text-xs font-bold" style={{ color: changeColor }}>
          <span style={{ fontSize: '8px' }}>{isUp ? '▲' : '▼'}</span>
          <span>{change}</span>
        </div>
      </div>

      {/* Progress bar — percentage of range */}
      <div className="progress-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressWidth}%` }}
          transition={{ delay: delay + 0.3, duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className="progress-fill"
          style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}60` }}
        />
      </div>

      {/* Hover glow border effect */}
      <style>{`
        .group:hover {
          box-shadow:
            inset 0 1px 0 0 rgba(255,255,255,0.08),
            0 0 20px -5px ${accentColor}20,
            0 0 40px -10px ${accentColor}10 !important;
          border-color: ${accentColor}30 !important;
        }
      `}</style>
    </motion.div>
  );
};

export default SignalPanel;
