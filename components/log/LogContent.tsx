'use client';

import { forwardRef } from 'react';

interface LogContentProps {
  logs: string[];
  onScroll: () => void;
}

export const LogContent = forwardRef<HTMLDivElement, LogContentProps>(
  ({ logs, onScroll }, ref) => {
    return (
      <main className="relative flex-1 overflow-y-auto p-4">
        <div
          className="h-[calc(100vh-95px)] overflow-y-auto"
          ref={ref}
          onScroll={onScroll}
        >
          <pre className="text-xs p-1">
            {logs.map((line, i) => (
              <div key={i} className="flex">
                <div className="w-12 select-none text-right opacity-50">
                  {i + 1}
                </div>
                <div className="flex-1 pl-4">{line}</div>
              </div>
            ))}
          </pre>
        </div>
      </main>
    );
  }
);

LogContent.displayName = 'LogContent';
