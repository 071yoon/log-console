import { useState, useRef, useEffect } from 'react'

export function useLogScroll(logs: string[]) {
  const [isAtBottom, setIsAtBottom] = useState(true)
  const scrollViewportRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth',
      })
      setIsAtBottom(true)
    }
  }

  const handleScroll = () => {
    const viewport = scrollViewportRef.current
    if (viewport) {
      const isScrolledToBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 1
      setIsAtBottom(isScrolledToBottom)
    }
  }

  // Effect for auto-scrolling
  useEffect(() => {
    if (isAtBottom && scrollViewportRef.current) {
      // Use instant scroll for tailing updates, not smooth
      scrollViewportRef.current.scrollTop =
        scrollViewportRef.current.scrollHeight
    }
  }, [logs, isAtBottom])

  // Effect to reset scroll position when new logs are loaded (e.g. new file)
  useEffect(() => {
    if (logs.length > 0) {
      setIsAtBottom(true)
    }
  }, [logs])

  return { scrollViewportRef, handleScroll, scrollToBottom, isAtBottom }
}
