'use client';

import React, { forwardRef, UIEventHandler } from 'react';

import { GroupedLogLine } from '../../types';
import { Spinner } from '../ui/spinner'; // Import Spinner
import { ExpandableSubLines } from './ExpandableSubLines';
import { LogLine } from './LogLine';

interface LogContentProps {
  logs: GroupedLogLine[];
  height: number;
  width: string;
  startLineNumber: number;
  outerRef: React.Ref<HTMLDivElement>;
  onScroll: UIEventHandler<HTMLDivElement>;
  isLoadingMore: boolean; // New prop for loading state
}

const Row: React.FC<{
  logGroup: GroupedLogLine;
  originalLineNumber: number;
  style?: React.CSSProperties;
}> = React.memo(({ logGroup, originalLineNumber, style }) => {
  return (
    <div style={style}>
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
  (
    { logs, height, width, startLineNumber, outerRef, onScroll, isLoadingMore },
    ref
  ) => {
    return (
      <main className="relative flex-1">
        <div
          ref={outerRef}
          onScroll={onScroll}
          style={{ height: height > 0 ? height : '100%', overflowY: 'auto', width }}
          className="h-full"
        >
          {/* Top loading spinner */}
          {isLoadingMore && (
            <div className="flex justify-center items-center p-2">
              <Spinner />
            </div>
          )}
          {logs.map((logGroup, index) => (
            <Row
              key={logGroup.id} // Use a stable key like an id
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