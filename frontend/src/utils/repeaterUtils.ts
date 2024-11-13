import { Request, Response, RequestConfig, FormattedRequest, RepeaterTab } from '../types/repeater';

interface ParsedRequestLine {
  method: string;
  path: string;
  protocol: string;
}

export const parseHttpRequest = (httpRequest: string): { 
  requestLine: ParsedRequestLine,
  headers: string 
} => {
  const lines = httpRequest.split('\n');
  const firstLine = lines[0];
  const [method = '', path = '/', protocol = ''] = firstLine.split(' ');
  
  return {
    requestLine: {
      method,
      path,
      protocol
    },
    headers: lines.slice(1).join('\n')
  };
};

export const formatHttpResponse = (response: Response): string => {
  const statusLine = `HTTP/1.1 ${response.status} ${response.statusText}`;
  const headers = Object.entries(response.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  return `${statusLine}\n${headers}\n\n${response.body}`;
};

export const constructUrl = (config: RequestConfig, path: string = '/'): string => {
  if (!config.host) return '';
  const portString = (
    (config.protocol === 'http' && config.port === '80') || 
    (config.protocol === 'https' && config.port === '443')
  ) ? '' : `:${config.port}`;
  return `${config.protocol}://${config.host}${portString}${path}`;
};

export const formatRequestForApi = (
  request: Request, 
  config: RequestConfig
): FormattedRequest => {
  // Keep the headers exactly as they are in the editor
  const headers = request.headers;
  
  // Extract method from the first line
  const firstLine = headers.split('\n')[0];
  const [method = 'GET'] = firstLine.split(' ');
  
  return {
    method,
    url: constructUrl(config),
    headers,
    body: request.body,
    follow_redirects: config.followRedirects
  };
};

export const getDefaultRequest = (): Request => ({
  method: 'GET',
  url: '',
  headers: 'GET / HTTP/1.1\nHost: example.com\nUser-Agent: FART-Proxy\nAccept: */*',
  body: ''
});

export const getDefaultConfig = (): RequestConfig => ({
  protocol: 'http',
  port: '80',
  host: '',
  followRedirects: false
});

export const extractDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

export const serializeTab = (tab: RepeaterTab): string => {
  return JSON.stringify(tab, null, 2);
};

export const deserializeTab = (serialized: string): RepeaterTab => {
  return JSON.parse(serialized);
};

export const validateImportedTabs = (data: any): boolean => {
  if (!Array.isArray(data)) return false;
  
  return data.every(tab => 
    tab &&
    typeof tab.name === 'string' &&
    typeof tab.domain === 'string' &&
    tab.request &&
    tab.config &&
    (tab.response === null || typeof tab.response === 'object')
  );
};
