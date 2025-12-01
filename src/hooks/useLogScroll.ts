import { useCallback, useEffect,useRef, useState } from 'react';

// This hook manages the scroll state of a given scrollable DOM element
export function useLogScroll() {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const getScrollInfo = useCallback(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) {
      return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
    }
    return {
      scrollTop: viewport.scrollTop,
      scrollHeight: viewport.scrollHeight,
      clientHeight: viewport.clientHeight,
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      viewport.scrollTo({
        behavior: 'smooth',
        top: viewport.scrollHeight,
      });
      setIsAtBottom(true);
    }
  }, []);

  const setScrollTop = useCallback((position: number) => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      viewport.scrollTop = position;
    }
  }, []);

  const handleScroll = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = getScrollInfo();
    const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 1;
    setIsAtBottom(scrolledToBottom);
    setIsAtTop(scrollTop === 0);
  }, [getScrollInfo]);

  // Effect to attach/detach scroll listener
  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      handleScroll(); // Initial check
      viewport.addEventListener('scroll', handleScroll);
      return () => {
        viewport.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]); // Re-run if handleScroll identity changes

  return { scrollViewportRef, handleScroll, scrollToBottom, isAtBottom, isAtTop, getScrollInfo, setScrollTop };
}