import { LogEntry, ProxyLog } from './types';
import loggingService from './loggingService';
import apiClient from './apiClient';

class ProxyService {
  async getLogs(): Promise<{ data: ProxyLog[] }> {
    try {
      const response = await apiClient.get('/proxy/logs');
      const logs: ProxyLog[] = response.data.data;

      // Log each proxy request
      const logEntries: LogEntry[] = logs.map((log: ProxyLog) => ({
        id: String(log.id), // Convert number to string for LogEntry
        timestamp: log.timestamp,
        type: 'request',
        source: 'Proxy',
        message: `${log.method} ${log.url}`,
        details: {
          method: log.method,
          url: log.url,
          status: log.status,
          headers: log.request?.headers,
          content: log.request?.content || undefined // Convert null to undefined
        }
      }));

      loggingService.notifyMultiple(logEntries);
      return { data: logs };
    } catch (error) {
      console.error('Failed to fetch proxy logs:', error);
      throw error;
    }
  }

  async clearLogs(): Promise<void> {
    try {
      await apiClient.post('/proxy/clear');
    } catch (error) {
      console.error('Failed to clear proxy logs:', error);
      throw error;
    }
  }

  async deleteLog(id: number): Promise<void> {
    try {
      await apiClient.delete(`/proxy/logs/${id}`);
    } catch (error) {
      console.error('Failed to delete proxy log:', error);
      throw error;
    }
  }
}

export default new ProxyService();
