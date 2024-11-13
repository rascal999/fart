import { EnhancedLogEntry, FilterOptions, SortField, SortDirection } from '../types/logs';

const getStatusValue = (status: number | string | undefined): number => {
  if (status === undefined) return -1;
  if (status === "pending") return -2;
  if (status === "error") return -3;
  return status as number;
};

export const sortLogs = (
  logs: EnhancedLogEntry[],
  sortField: SortField,
  sortDirection: SortDirection
): EnhancedLogEntry[] => {
  return [...logs].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'id':
        const aId = a.source === 'Proxy' ? parseInt(a.proxyId || '0') : a.incrementalId;
        const bId = b.source === 'Proxy' ? parseInt(b.proxyId || '0') : b.incrementalId;
        comparison = aId - bId;
        break;
      case 'timestamp':
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'source':
        comparison = a.source.localeCompare(b.source);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'method':
        comparison = (a.details?.method || '').localeCompare(b.details?.method || '');
        break;
      case 'url':
        comparison = (a.details?.url || a.message).localeCompare(b.details?.url || b.message);
        break;
      case 'status':
        comparison = getStatusValue(a.details?.status) - getStatusValue(b.details?.status);
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });
};

export const filterLogs = (
  logs: EnhancedLogEntry[],
  quickFilter: string,
  filterOptions: FilterOptions
): EnhancedLogEntry[] => {
  return logs.filter(log => {
    if (!quickFilter && !filterOptions.method && !filterOptions.url && 
        !filterOptions.status && !filterOptions.type && !filterOptions.source) {
      return true;
    }

    const matchesQuickFilter = quickFilter === '' || 
      log.message.toLowerCase().includes(quickFilter.toLowerCase()) ||
      (log.details?.url || '').toLowerCase().includes(quickFilter.toLowerCase());

    const matchesMethod = !filterOptions.method || 
      (log.details?.method || '').toLowerCase().includes(filterOptions.method.toLowerCase());

    const matchesUrl = !filterOptions.url || 
      (log.details?.url || '').toLowerCase().includes(filterOptions.url.toLowerCase());

    const matchesStatus = !filterOptions.status || 
      String(log.details?.status || '').includes(filterOptions.status);

    const matchesType = !filterOptions.type || 
      log.type.toLowerCase().includes(filterOptions.type.toLowerCase());

    const matchesSource = !filterOptions.source || 
      log.source.toLowerCase().includes(filterOptions.source.toLowerCase());

    return matchesQuickFilter && matchesMethod && matchesUrl && 
           matchesStatus && matchesType && matchesSource;
  });
};

export const exportLogs = (logs: EnhancedLogEntry[]): void => {
  const exportData = JSON.stringify(logs, null, 2);
  const blob = new Blob([exportData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fart-proxy-logs-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
