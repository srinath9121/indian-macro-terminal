import { useState, useEffect } from 'react';

export function useDataFreshness(timestamp) {
  const [freshness, setFreshness] = useState({ label: '', color: 'green' });

  useEffect(() => {
    const updateFreshness = () => {
      if (!timestamp) {
        setFreshness({ label: 'No data', color: 'red' });
        return;
      }
      
      const now = new Date();
      const updatedTime = new Date(timestamp);
      // Sometimes python timestamp doesn't include Z and is treated as local time
      // Let's assume the difference is in minutes correctly regardless of exact string format
      // Just parsing new Date(timestamp) usually works if it's ISO form
      const diffMs = now - updatedTime;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 0 || isNaN(diffMins)) {
         setFreshness({ label: 'Live', color: 'green' });
      } else if (diffMins < 1) {
        setFreshness({ label: 'Just now', color: 'green' });
      } else if (diffMins <= 5) {
        setFreshness({ label: `${diffMins}m ago`, color: 'green' });
      } else if (diffMins <= 15) {
        setFreshness({ label: `${diffMins}m ago`, color: 'amber' });
      } else {
        const hours = Math.floor(diffMins / 60);
        if (hours > 0) {
          setFreshness({ label: `${hours}h ago`, color: 'red' });
        } else {
          setFreshness({ label: `${diffMins}m ago`, color: 'red' });
        }
      }
    };

    updateFreshness();
    const interval = setInterval(updateFreshness, 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return freshness;
}
