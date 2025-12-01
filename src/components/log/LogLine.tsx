'use client';

import { useMemo, useState } from 'react';

interface LogLineProps {
  line: string;
  level?: string;
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
        return 'text-blue-500';
      case 'DEBUG':
        return 'text-gray-500';
      case 'FATAL':
        return 'text-red-700 font-bold';
      default:
        return '';
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