import { useMemo } from 'react';

import { GroupedLogLine } from '@/types';

export function useLogStats(logs: GroupedLogLine[]) {
  const stats = useMemo(() => {
    return {
      total: logs.length,
      errors: logs.filter((logGroup) =>
        logGroup.mainLine.toLowerCase().includes('error')
      ).length,
      warnings: logs.filter((logGroup) =>
        logGroup.mainLine.toLowerCase().includes('warn')
      ).length,
    };
  }, [logs]);

  return stats;
}
