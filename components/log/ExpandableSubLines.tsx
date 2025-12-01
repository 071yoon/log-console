'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ExpandableSubLinesProps {
  subLines: string[];
}

export function ExpandableSubLines({ subLines }: ExpandableSubLinesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (subLines.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col pl-4">
      <button
        className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {isExpanded ? 'Hide' : `Show ${subLines.length} more`} lines
      </button>
      {isExpanded && (
        <div className="flex flex-col">
          {subLines.map((line, index) => (
            <div key={index} className="flex">
              <div className="w-12 select-none text-right opacity-50">
                {/* No line number for sub-lines to avoid confusion with main lines */}
              </div>
              <div className="flex-1 pl-4 text-[10px]">{line}</div> {/* Added text-[10px] */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}