'use client';

import { throttle } from 'es-toolkit';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useLogScroll } from '../hooks/useLogScroll';
import { useLogStats } from '../hooks/useLogStats';
import { groupLogLines } from '../lib/log-utils';
import { GroupedLogLine } from '../types';
import { GoToBottomButton } from './log/GoToBottomButton';
import { LogContent } from './log/LogContent';
import { LogHeader } from './log/LogHeader';
import { Spinner } from './ui/spinner';

interface LogConsoleProps {
  logFileUrl: string | null;
  initialDisplayLines?: number;
}

const DEFAULT_INITIAL_LINES = 500;

export function LogConsole({
  logFileUrl,
  initialDisplayLines = DEFAULT_INITIAL_LINES,
}: LogConsoleProps) {
  const [allGroupedLogs, setAllGroupedLogs] = useState<GroupedLogLine[]>([]);
  const [displayedLogGroups, setDisplayedLogGroups] = useState<
    GroupedLogLine[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTailingEnabled, setIsTailingEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [windowHeight, setWindowHeight] = useState(0);

  const isInitialLoadRef = useRef(true);
  const isFetchingMoreRef = useRef(false);

  const {
    scrollViewportRef,
    handleScroll,
    scrollToBottom,
    isAtBottom,
    isAtTop,
    getScrollInfo,
    setScrollTop,
  } = useLogScroll();

  const stats = useLogStats(allGroupedLogs);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowHeight(window.innerHeight);
      const handleResize = () => setWindowHeight(window.innerHeight);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const fetchLogs = useCallback(
    async (isTailingFetch = false) => {
      if (!logFileUrl || (isLoading && !isTailingFetch)) return;

      if (!isTailingFetch) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(logFileUrl);
        if (!response.ok)
          throw new Error(`Failed to fetch log file: ${response.statusText}`);
        const text = await response.text();
        const rawLines = text.split('\n');
        const grouped = groupLogLines(rawLines);

        setAllGroupedLogs(grouped);

        if (isTailingFetch) {
          const prevAllGroupedLogsLength = allGroupedLogs.length;
          const newLogs = grouped.slice(prevAllGroupedLogsLength);
          if (newLogs.length > 0) {
            setDisplayedLogGroups((prev) => [...prev, ...newLogs]);
            if (isAtBottom) {
              requestAnimationFrame(() => scrollToBottom());
            }
          }
        } else {
          // Initial load or manual re-fetch
          const endIndex = grouped.length;
          const startIndex = Math.max(0, endIndex - initialDisplayLines);
          setDisplayedLogGroups(grouped.slice(startIndex, endIndex));
        }
      } catch (e) {
        console.error('Error occurred while fetching logs:', e);
      } finally {
        if (!isTailingFetch) {
          setIsLoading(false);
        }
      }
    },
    [
      logFileUrl,
      isLoading,
      allGroupedLogs,
      isAtBottom,
      scrollToBottom,
      initialDisplayLines,
    ]
  );

  // --- Initial Load / File Change Effect ---
  useEffect(() => {
    if (logFileUrl) {
      isInitialLoadRef.current = true;
      setAllGroupedLogs([]);
      setDisplayedLogGroups([]);
      fetchLogs(false);
    }
  }, [logFileUrl]);

  // --- Effect for scrolling to bottom on initial load ---
  useEffect(() => {
    if (isInitialLoadRef.current && displayedLogGroups.length > 0) {
      // Use a timeout to ensure the DOM has been painted
      setTimeout(() => {
        scrollToBottom();
        isInitialLoadRef.current = false;
      }, 0);
    }
  }, [displayedLogGroups, scrollToBottom]);

  useEffect(() => {
    if (isTailingEnabled && logFileUrl) {
      const interval = setInterval(() => fetchLogs(true), 1000);
      return () => clearInterval(interval);
    }
  }, [isTailingEnabled, logFileUrl, fetchLogs]);

  const loadMoreOldLogs = useCallback(() => {
    if (
      isFetchingMoreRef.current ||
      displayedLogGroups.length >= allGroupedLogs.length
    )
      return;

    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);

    const { scrollHeight: oldScrollHeight } = getScrollInfo();

    setTimeout(() => {
      const currentFirstLog = displayedLogGroups[0];
      const indexOfCurrentFirstInAll = allGroupedLogs.findIndex(
        (log) => log.id === currentFirstLog.id
      );

      if (indexOfCurrentFirstInAll > 0) {
        const newStartIndex = Math.max(
          0,
          indexOfCurrentFirstInAll - initialDisplayLines
        );
        const newLogsToPrepend = allGroupedLogs.slice(
          newStartIndex,
          indexOfCurrentFirstInAll
        );

        setDisplayedLogGroups((prev) => [...newLogsToPrepend, ...prev]);

        requestAnimationFrame(() => {
          if (scrollViewportRef.current) {
            const { scrollHeight: newScrollHeight } = getScrollInfo();
            const heightIncreasedBy = newScrollHeight - oldScrollHeight;
            setScrollTop(heightIncreasedBy);
            setIsLoadingMore(false);
            isFetchingMoreRef.current = false;
          }
        });
      } else {
        setIsLoadingMore(false);
        isFetchingMoreRef.current = false;
      }
    }, 500);
  }, [
    displayedLogGroups,
    allGroupedLogs,
    getScrollInfo,
    setScrollTop,
    scrollViewportRef,
    initialDisplayLines,
  ]);

  useEffect(() => {
    if (
      isAtTop &&
      !isFetchingMoreRef.current &&
      !isInitialLoadRef.current &&
      displayedLogGroups.length < allGroupedLogs.length
    ) {
      loadMoreOldLogs();
    }
  }, [
    isAtTop,
    loadMoreOldLogs,
    displayedLogGroups.length,
    allGroupedLogs.length,
  ]);

  const handleSearch = throttle((term: string) => setSearchTerm(term), 300);

  const filteredLogs = useMemo(
    () =>
      displayedLogGroups.filter(
        (logGroup) =>
          logGroup.mainLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
          logGroup.subLines.some((subLine) =>
            subLine.toLowerCase().includes(searchTerm.toLowerCase())
          )
      ),
    [displayedLogGroups, searchTerm]
  );

  const startLineNumber = useMemo(() => {
    if (filteredLogs.length === 0) return 1;
    const firstLogId = filteredLogs[0]?.id;
    const originalIndex = allGroupedLogs.findIndex(
      (log) => log.id === firstLogId
    );
    return originalIndex !== -1 ? originalIndex + 1 : 1;
  }, [filteredLogs, allGroupedLogs]);

  if (!logFileUrl) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Please provide a log file URL.</p>
      </div>
    );
  }

  if (isLoading && isInitialLoadRef.current) {
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
      <div className="relative flex-1 overflow-hidden">
        <LogContent
          logs={filteredLogs}
          height={Math.max(0, windowHeight - 100)}
          width="100%"
          startLineNumber={startLineNumber}
          outerRef={scrollViewportRef}
          onScroll={handleScroll}
          isLoadingMore={isLoadingMore}
        />
        <GoToBottomButton isVisible={!isAtBottom} onClick={scrollToBottom} />
      </div>
    </div>
  );
}
