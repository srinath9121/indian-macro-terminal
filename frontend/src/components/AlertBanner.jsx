import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertBanner() {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const fetchAlerts = () => {
      fetch('/api/alerts-active')
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(data => setAlerts(data.alerts || []))
        .catch(() => {});
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts.filter(a => !dismissed.includes(a.name));

  if (activeAlerts.length === 0) return null;

  const handleDismiss = (name) => {
    setDismissed(prev => [...prev, name]);
  };

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-3xl flex flex-col gap-2">
      <AnimatePresence>
        {activeAlerts.map((alert) => (
          <motion.div
            key={alert.name}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`glass p-3 flex items-center justify-between border-l-4 ${
              alert.severity === 'CRITICAL' ? 'border-[#ff3355] bg-[#ff3355]/10' :
              alert.severity === 'HIGH' ? 'border-[#ffaa00] bg-[#ffaa00]/10' :
              'border-[#00aaff] bg-[#00aaff]/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={16} style={{ color: alert.severity === 'CRITICAL' ? '#ff3355' : alert.severity === 'HIGH' ? '#ffaa00' : '#00aaff' }} />
              <div>
                <span className="font-heading text-[10px] font-bold mr-2 text-[#e8f4f8]">{alert.name}</span>
                <span className="font-sans text-[11px] text-[#e8f4f8]">{alert.message}</span>
              </div>
            </div>
            <button onClick={() => handleDismiss(alert.name)} className="text-[#7a9bb5] hover:text-white p-1">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
