export interface Request {
  method: string;
  url: string;
  headers: string;
  body: string;
}

export interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}

export interface RequestConfig {
  protocol: 'http' | 'https';
  port: string;
  host: string;
  followRedirects: boolean;
}

export interface RepeaterTab {
  id: string;
  name: string;
  domain: string;
  request: Request;
  config: RequestConfig;
  response: Response | null;
}

export interface RepeaterRequestProps {
  request: Request;
  config: RequestConfig;
  isLoading: boolean;
  onRequestChange: (field: keyof Request) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onConfigChange: (updates: Partial<RequestConfig>) => void;
  onSend: () => void;
  onClear: () => void;
}

export interface RepeaterResponseProps {
  response: Response | null;
  isLoading: boolean;
}

export interface FormattedRequest {
  method: string;
  url: string;
  headers: string;
  body: string;
  follow_redirects: boolean;
}

export interface RepeaterState {
  tabs: RepeaterTab[];
  activeTabId: string | null;
}
