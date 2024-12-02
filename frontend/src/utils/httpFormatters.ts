import { ProxyLog } from '../types/proxy';

const formatHeaders = (headers: Record<string, string> | undefined | null): string => {
  if (!headers || Object.keys(headers).length === 0) return '';
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
};

export const formatRequest = (log: ProxyLog): string => {
  if (!log) return '';
  
  const parts = [];
  
  // Request line
  parts.push(`${log.method} ${log.url} HTTP/1.1`);
  
  // Headers
  if (log.request?.headers) {
    const headerLines = formatHeaders(log.request.headers);
    if (headerLines) {
      parts.push(headerLines);
    }
  }
  
  // Empty line between headers and body
  parts.push('');
  
  // Body
  if (log.request?.content) {
    parts.push(log.request.content);
  }
  
  // Join with newlines and preserve empty lines
  return parts.join('\n');
};

export const formatResponse = (log: ProxyLog): string => {
  if (!log) return '';
  
  const parts = [];
  
  // Status line
  const status = log.response?.status_code || log.status;
  parts.push(`HTTP/1.1 ${status}`);
  
  // Headers
  if (log.response?.headers) {
    const headerLines = formatHeaders(log.response.headers);
    if (headerLines) {
      parts.push(headerLines);
    }
  }
  
  // Empty line between headers and body
  parts.push('');
  
  // Body
  if (log.response?.content) {
    parts.push(log.response.content);
  }
  
  // Join with newlines and preserve empty lines
  return parts.join('\n');
};
