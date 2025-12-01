'use client';

import { throttle } from 'es-toolkit';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useLogScroll } from '@/hooks/useLogScroll';
import { useLogStats } from '@/hooks/useLogStats';
import { groupLogLines } from '@/lib/log-utils';
import { GroupedLogLine } from '@/types';

import { GoToBottomButton } from './log/GoToBottomButton';
import { LogContent } from './log/LogContent';
import { LogHeader } from './log/LogHeader';

const LOGS_PER_DISPLAY_CHUNK = 500; // Number of grouped log lines to display at a time

function LogViewer({ selectedFile }: { selectedFile: string | null }) {
  const [fullRawLogLines, setFullRawLogLines] = useState<string[]>([]);
  const [allGroupedLogs, setAllGroupedLogs] = useState<GroupedLogLine[]>([]);
  const [displayedLogGroups, setDisplayedLogGroups] = useState<
    GroupedLogLine[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTailingEnabled, setIsTailingEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [windowHeight, setWindowHeight] = useState(0); // State to store window height

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // useLogScroll now takes displayedLogGroups and manages a native DOM ref
  const {
    scrollViewportRef,
    handleScroll,
    scrollToBottom,
    isAtBottom,
    isAtTop,
  } = useLogScroll(displayedLogGroups);

  const stats = useLogStats(allGroupedLogs); // Pass all grouped logs for full stats

  const fetchAndProcessLogs = useCallback(async () => {
    setIsLoading(true);
    if (!selectedFile) return;

    try {
      const publicPath = selectedFile.startsWith('/')
        ? selectedFile
        : selectedFile.includes('/public')
        ? selectedFile.split('/public')[1]
        : selectedFile;
      const response = await fetch(publicPath);
      if (!response.ok)
        throw new Error(`Failed to fetch log file: ${response.statusText}`);
      const text = await response.text();
      const rawLines = text.split('\n');
      setFullRawLogLines(rawLines);
      const grouped = groupLogLines(rawLines);
      setAllGroupedLogs(grouped);

      // Initialize displayed logs to the latest chunk
      const initialEndIndex = grouped.length;
      const initialStartIndex = Math.max(
        0,
        initialEndIndex - LOGS_PER_DISPLAY_CHUNK
      );
      setDisplayedLogGroups(grouped.slice(initialStartIndex, initialEndIndex));
      scrollToBottom();
    } catch (_e: unknown) {
      console.error('Error occurred while fetching logs:', _e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, scrollToBottom]);

  // Effect for initial load and file changes
  useEffect(() => {
    if (selectedFile) {
      setFullRawLogLines([]);
      setAllGroupedLogs([]);
      setDisplayedLogGroups([]);
      fetchAndProcessLogs();
    }
  }, [selectedFile, fetchAndProcessLogs]);

  // Effect for tailing
  useEffect(() => {
    if (isTailingEnabled && selectedFile) {
      const interval = setInterval(async () => {
        try {
          const publicPath = selectedFile.startsWith('/')
            ? selectedFile
            : selectedFile.split('/public')[1];
          const response = await fetch(publicPath);
          if (!response.ok)
            throw new Error(`Failed to fetch log file: ${response.statusText}`);
          const text = await response.text();
          const newRawLines = text.split('\n');

          if (newRawLines.length > fullRawLogLines.length) {
            const newlyAddedRawLines = newRawLines.slice(
              fullRawLogLines.length
            );
            const newGroupedLogs = groupLogLines(newlyAddedRawLines);

            setFullRawLogLines(newRawLines);
            setAllGroupedLogs((prev) => [...prev, ...newGroupedLogs]);
            setDisplayedLogGroups((prev) => [...prev, ...newGroupedLogs]); // Always append to displayed during tailing
            scrollToBottom();
          }
        } catch (error) {
          console.error('Error during tailing:', error);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTailingEnabled, selectedFile, fullRawLogLines, scrollToBottom]);

  // Infinite scroll: Load more old logs when scrolling to the top
  const loadMoreOldLogs = useCallback(() => {
    if (isLoading || displayedLogGroups.length === 0) return;

    const currentFirstLog = displayedLogGroups[0];
    const indexOfFirstDisplayedInAll = allGroupedLogs.indexOf(currentFirstLog);

    if (indexOfFirstDisplayedInAll > 0) {
      setIsLoading(true);
      const newStartIndex = Math.max(
        0,
        indexOfFirstDisplayedInAll - LOGS_PER_DISPLAY_CHUNK
      );
      const newLogsToPrepend = allGroupedLogs.slice(
        newStartIndex,
        indexOfFirstDisplayedInAll
      );

      // Store current scroll position and height before DOM update
      const userScrollTop = scrollViewportRef.current
        ? scrollViewportRef.current.scrollTop
        : 0;
      const oldScrollHeight = scrollViewportRef.current
        ? scrollViewportRef.current.scrollHeight
        : 0;

      // Prepend new logs
      setDisplayedLogGroups((prev) => [...newLogsToPrepend, ...prev]);

      // Allow DOM to update, then measure new scrollHeight and adjust scrollTop
      setTimeout(() => {
        if (scrollViewportRef.current) {
          const newScrollHeight = scrollViewportRef.current.scrollHeight;
          const heightIncreasedBy = newScrollHeight - oldScrollHeight;
          scrollViewportRef.current.scrollTop =
            userScrollTop + heightIncreasedBy;
        }
        setIsLoading(false); // Set loading to false after scroll adjustment
      }, 0); // Use setTimeout(0) to ensure DOM update before measuring
    }
  }, [isLoading, displayedLogGroups, allGroupedLogs, scrollViewportRef]);

  // Handle native scroll event from LogContent's main div
  const handleNativeScroll = useCallback(() => {
    handleScroll(); // Update isAtBottom, isAtTop from useLogScroll

    if (
      isAtTop &&
      !isLoading &&
      displayedLogGroups.length < allGroupedLogs.length
    ) {
      loadMoreOldLogs();
    }
  }, [
    handleScroll, // This needs to be changed to handleScroll, not handleHandle. Error.
    isAtTop,
    isLoading,
    displayedLogGroups.length,
    allGroupedLogs.length,
    loadMoreOldLogs,
  ]);

  const handleSearch = throttle((term: string) => {
    setSearchTerm(term);
  }, 300);

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

  // Calculate the starting line number for the currently filtered and displayed logs
  const startLineNumber = useMemo(() => {
    if (filteredLogs.length === 0) return 0;
    const firstFilteredLog = filteredLogs[0];
    const originalIndex = allGroupedLogs.indexOf(firstFilteredLog);
    return originalIndex !== -1 ? originalIndex + 1 : 1; // +1 because line numbers are 1-based
  }, [filteredLogs, allGroupedLogs]);

  if (!selectedFile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Please select a file to view logs.</p>
      </div>
    );
  }

  if (isLoading && allGroupedLogs.length === 0) {
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
          logs={filteredLogs}
          height={Math.max(0, windowHeight - 100)} // Ensure height is not negative
          width="100%"
          startLineNumber={startLineNumber} // Pass the calculated starting line number
          outerRef={scrollViewportRef} // Pass our scroll ref to LogContent
          onScroll={handleNativeScroll} // Pass native scroll handler
        />
        {isLoading &&
          allGroupedLogs.length > 0 && ( // Show full-screen dimming spinner for loading more
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
              <Spinner />
            </div>
          )}
        <GoToBottomButton isVisible={!isAtBottom} onClick={scrollToBottom} />
      </div>
    </div>
  );
}

export default LogViewer;
