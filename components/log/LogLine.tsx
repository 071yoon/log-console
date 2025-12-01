'use client';

import { useMemo, useState } from 'react';

interface LogLineProps {
  line: string;
  level?: string; // New prop for log level
}

export function LogLine({ line, level }: LogLineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const textColorClass = useMemo(() => {
    switch (level) {
      case 'ERROR':
        return 'text-red-500';
      case 'WARN':
        return 'text-yellow-500';
      case 'INFO':
        return 'text-blue-500'; // Subtle distinction for INFO
      case 'DEBUG':
        return 'text-gray-500';
      case 'FATAL':
        return 'text-red-700 font-bold'; // More prominent for FATAL
      default:
        return ''; // Default color
    }
  }, [level]);

  return (
    <div
      className={`flex-1 pl-4 ${textColorClass} ${
        !isExpanded ? 'whitespace-nowrap overflow-hidden text-ellipsis' : ''
      }`}
      onClick={toggleExpansion}
    >
      {line}
    </div>
  );
}
