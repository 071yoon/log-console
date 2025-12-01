'use client';

import React, { forwardRef, UIEventHandler } from 'react';

// Removed List and ListChildComponentProps import from 'react-window'
import { GroupedLogLine } from '@/types';

import { ExpandableSubLines } from './ExpandableSubLines';
import { LogLine } from './LogLine';

interface LogContentProps {
  logs: GroupedLogLine[];
  height: number;
  width: string;
  startLineNumber: number; // New prop for actual starting line number
  outerRef: React.Ref<HTMLDivElement>;
  onScroll: UIEventHandler<HTMLDivElement>;
}

// Row component - now renders a single logGroup directly
const Row: React.FC<{
  logGroup: GroupedLogLine;
  originalLineNumber: number;
  style?: React.CSSProperties;
}> = React.memo(({ logGroup, originalLineNumber, style }) => {
  return (
    <div style={style}>
      {' '}
      {/* Apply style from parent if passed */}
      <div className="flex text-xs">
        <div className="w-12 select-none text-right opacity-50 pr-2">
          {originalLineNumber}
        </div>
        <LogLine line={logGroup.mainLine} level={logGroup.level} />
      </div>
      {logGroup.subLines.length > 0 && (
        <ExpandableSubLines subLines={logGroup.subLines} />
      )}
    </div>
  );
});

Row.displayName = 'LogRow';

export const LogContent = forwardRef<HTMLDivElement, LogContentProps>(
  ({ logs, height, width, startLineNumber, outerRef, onScroll }, ref) => {
    return (
      <main className="relative flex-1">
        <div
          ref={outerRef} // Apply outerRef to the scrollable div
          onScroll={onScroll} // Apply onScroll to the scrollable div
          style={{
            height: height > 0 ? height : '100%',
            overflowY: 'auto',
            width: width,
          }} // Apply height/width directly
          className="h-full" // Ensure the div takes full height
        >
          {logs.map((logGroup, index) => (
            <Row
              key={index}
              logGroup={logGroup}
              originalLineNumber={startLineNumber + index}
            />
          ))}
        </div>
      </main>
    );
  }
);

LogContent.displayName = 'LogContent';
