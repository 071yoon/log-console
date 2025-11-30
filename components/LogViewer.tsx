'use client';

import { useEffect, useState, useMemo } from 'react';
import { throttle } from 'es-toolkit';
import { Spinner } from '@/components/ui/spinner';
import { useLogStats } from '@/hooks/useLogStats';
import { useLogScroll } from '@/hooks/useLogScroll';
import { LogHeader } from './log/LogHeader';
import { LogContent } from './log/LogContent';
import { GoToBottomButton } from './log/GoToBottomButton';

function LogViewer({ selectedFile }: { selectedFile: string | null }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTailingEnabled, setIsTailingEnabled] = useState(false);

  const stats = useLogStats(logs);
  const { scrollViewportRef, handleScroll, scrollToBottom, isAtBottom } =
    useLogScroll(logs);

  const loadFile = async () => {
    if (!selectedFile) return;
    if (logs.length === 0) setIsLoading(true);
    try {
      const publicPath = selectedFile.startsWith('/')
        ? selectedFile
        : selectedFile.split('/public')[1];
      const response = await fetch(publicPath);
      if (!response.ok)
        throw new Error(`Failed to fetch log file: ${response.statusText}`);
      const text = await response.text();
      setLogs(text.split('\n'));
    } catch (e: unknown) {
      throw new Error('Error occurred while fetching logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      setLogs([]);
      loadFile();
    } else {
      setLogs([]);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (isTailingEnabled && selectedFile) {
      const interval = setInterval(loadFile, 1000);
      return () => clearInterval(interval);
    }
  }, [isTailingEnabled, selectedFile]);

  const handleSearch = throttle((term: string) => {
    setSearchTerm(term);
  }, 300);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) =>
        log.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [logs, searchTerm]
  );

  if (!selectedFile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Please select a file to view logs.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <LogHeader
        onSearchChange={handleSearch}
        isTailingEnabled={isTailingEnabled}
        onTailingChange={setIsTailingEnabled}
        stats={stats}
      />
      <div className="relative flex-1">
        <LogContent
          ref={scrollViewportRef}
          logs={filteredLogs}
          onScroll={handleScroll}
        />
        <GoToBottomButton isVisible={!isAtBottom} onClick={scrollToBottom} />
      </div>
    </div>
  );
}

export default LogViewer;
