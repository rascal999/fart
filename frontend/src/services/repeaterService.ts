import api from './apiClient';
import { RepeaterRequest } from './types';
import loggingService from './loggingService';
import proxyService from './proxyService';

interface RepeaterResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}

const parseHeadersForLogging = (headers: string): Record<string, string> => {
  const result: Record<string, string> = {};
  // Skip first line and parse remaining headers
  const lines = headers.split('\n').slice(1);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      const [key, ...values] = trimmed.split(':');
      if (key && values.length > 0) {
        result[key.trim()] = values.join(':').trim();
      }
    }
  }
  return result;
};

const repeaterService = {
  sendRequest: async (requestData: RepeaterRequest) => {
    try {
      // Log the outgoing request
      loggingService.request(
        'Repeater',
        `Repeater request: ${requestData.method} ${requestData.url}`,
        {
          method: requestData.method,
          url: requestData.url,
          headers: parseHeadersForLogging(requestData.headers),
          content: requestData.body,
        }
      );

      // Send the request through the backend proxy
      const response = await api.post('/repeater/send', requestData);
      const responseData: RepeaterResponse = response.data;
      
      // Log the response
      loggingService.info(
        'Repeater',
        `Repeater response: ${responseData.status} ${requestData.url}`,
        {
          status: responseData.status,
          headers: responseData.headers,
          content: responseData.body
        }
      );

      // Fetch updated logs after the request
      await proxyService.getLogs();

      // Return the response in the expected format
      return response;
    } catch (error: any) {
      // Log the error
      const errorEntry = loggingService.error(
        'Repeater',
        `Repeater request failed: ${error.message}`,
        {
          method: requestData.method,
          url: requestData.url,
          headers: parseHeadersForLogging(requestData.headers),
          content: requestData.body,
        }
      );
      console.error('Repeater error:', errorEntry);
      throw error;
    }
  }
};

export default repeaterService;
