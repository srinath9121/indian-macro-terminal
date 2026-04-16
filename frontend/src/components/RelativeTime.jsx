import { useState, useEffect } from 'react';

export default function RelativeTime({ dateString }) {
  const [text, setText] = useState('Updated just now');

  useEffect(() => {
    if (!dateString) return;
    
    // Parse the IST ISO string
    const updateTime = new Date(dateString).getTime();
    
    const updateText = () => {
      const diffSecs = Math.floor((Date.now() - updateTime) / 1000);
      if (diffSecs < 10) setText('Updated just now');
      else if (diffSecs < 60) setText(`Updated ${diffSecs}s ago`);
      else if (diffSecs < 3600) setText(`Updated ${Math.floor(diffSecs/60)}m ago`);
      else setText(`Updated ${Math.floor(diffSecs/3600)}h ago`);
    };

    updateText();
    const interval = setInterval(updateText, 1000);
    return () => clearInterval(interval);
  }, [dateString]);

  return <span>{text}</span>;
}
