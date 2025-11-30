import { useMemo } from 'react'

export function useLogStats(logs: string[]) {
  const stats = useMemo(() => {
    return {
      total: logs.length,
      errors: logs.filter((log) => log.toLowerCase().includes('error')).length,
      warnings: logs.filter((log) => log.toLowerCase().includes('warn')).length,
    }
  }, [logs])

  return stats
}
