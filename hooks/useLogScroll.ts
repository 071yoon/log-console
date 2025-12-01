import { useEffect, useRef, useState, useCallback } from 'react';
import { GroupedLogLine } from '@/types';

export function useLogScroll(logs: GroupedLogLine[]) {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        behavior: 'smooth',
        top: scrollViewportRef.current.scrollHeight,
      });
      setIsAtBottom(true);
    }
  }, []);

  const handleScroll = useCallback(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      const isScrolledToBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 1;
      setIsAtBottom(isScrolledToBottom);

      setIsAtTop(viewport.scrollTop === 0);
    }
  }, []);

  // Effect for auto-scrolling when new logs arrive and user is at bottom
  useEffect(() => {
    if (isAtBottom && scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [logs, isAtBottom]); // Rerun when logs change or isAtBottom changes

  return { scrollViewportRef, handleScroll, scrollToBottom, isAtBottom, isAtTop };
}
