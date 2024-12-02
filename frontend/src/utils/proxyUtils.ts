import { ProxyLog, SortColumn, SortDirection } from '../types/proxy';

export const sortProxyLogs = (
  logs: ProxyLog[],
  sortColumn: SortColumn,
  sortDirection: SortDirection
): ProxyLog[] => {
  return [...logs].sort((a, b) => {
    let comparison = 0;

    if (sortColumn === 'id') {
      // Direct numeric comparison for IDs
      comparison = a.id - b.id;
    } else if (sortColumn === 'status') {
      // Convert status to numeric value for comparison
      const getStatusValue = (status: number | string | undefined): number => {
        if (status === undefined) return -1;
        if (status === "pending") return -2;
        if (status === "error") return -3;
        return status as number;
      };
      
      comparison = getStatusValue(a.status) - getStatusValue(b.status);
    } else if (sortColumn === 'timestamp') {
      comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (sortColumn === 'content_length') {
      const aLength = a.content_length || 0;
      const bLength = b.content_length || 0;
      comparison = aLength - bLength;
    } else {
      // String comparison for other fields
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });
};

export const filterProxyLogs = (
  logs: ProxyLog[],
  filter: string
): ProxyLog[] => {
  const lowercaseFilter = filter.toLowerCase();
  return logs.filter(log => 
    log.url.toLowerCase().includes(lowercaseFilter) ||
    log.method.toLowerCase().includes(lowercaseFilter)
  );
};

export const formatHttpRequest = (log: ProxyLog): string => {
  // Start with the request line
  let request = `${log.method} ${new URL(log.url).pathname} HTTP/1.1\n`;
  
  // Add headers
  if (log.request?.headers) {
    Object.entries(log.request.headers).forEach(([key, value]) => {
      request += `${key}: ${value}\n`;
    });
  }
  
  // Add body if exists
  if (log.request?.content) {
    request += `\n${log.request.content}`;
  }
  
  return request;
};

export const prepareRepeaterRequest = (log: ProxyLog) => {
  const formattedRequest = formatHttpRequest(log);
  const url = new URL(log.url);
  
  return {
    method: log.method,
    url: log.url,
    raw_request: formattedRequest,
    body: log.request?.content || '',
    protocol: url.protocol.replace(':', '') as 'http' | 'https',
    host: url.hostname,
    port: url.port || (url.protocol === 'https:' ? '443' : '80')
  };
};

export const generateCurlCommand = (log: ProxyLog): string => {
  let curl = `curl -X ${log.method} '${log.url}'`;
  
  // Add headers
  if (log.request?.headers) {
    Object.entries(log.request.headers).forEach(([key, value]) => {
      curl += ` -H '${key}: ${value}'`;
    });
  }
  
  // Add request body if exists
  if (log.request?.content) {
    curl += ` -d '${log.request.content}'`;
  }
  
  return curl;
};

export const generateNmapCommand = (log: ProxyLog): string => {
  const url = new URL(log.url);
  return `nmap -sC -sV -p- ${url.hostname}`;
};

export const generateGobusterCommand = (log: ProxyLog): string => {
  const url = new URL(log.url);
  const baseUrl = `${url.protocol}//${url.hostname}`;
  return `gobuster dir -u ${baseUrl} -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt`;
};

export const generateDirbCommand = (log: ProxyLog): string => {
  const url = new URL(log.url);
  const baseUrl = `${url.protocol}//${url.hostname}`;
  return `dirb ${baseUrl}`;
};

export const generateNiktoCommand = (log: ProxyLog): string => {
  const url = new URL(log.url);
  const baseUrl = `${url.protocol}//${url.hostname}`;
  return `nikto -h ${baseUrl}`;
};

export const generateSqlmapCommand = (log: ProxyLog): string => {
  return `sqlmap -u '${log.url}' --batch`;
};
