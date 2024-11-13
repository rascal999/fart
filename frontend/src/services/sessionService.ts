import api from './apiClient';
import { SessionData } from './types';
import loggingService from './loggingService';

const sessionService = {
  exportSession: async () => {
    try {
      const response = await api.post<SessionData>('/session/export');
      loggingService.info(
        'System',
        'Session exported'
      );
      return response;
    } catch (error: any) {
      loggingService.error(
        'System',
        `Failed to export session: ${error.message}`
      );
      throw error;
    }
  },

  importSession: async (sessionData: SessionData) => {
    try {
      const response = await api.post('/session/import', sessionData);
      loggingService.info(
        'System',
        'Session imported'
      );
      return response;
    } catch (error: any) {
      loggingService.error(
        'System',
        `Failed to import session: ${error.message}`
      );
      throw error;
    }
  }
};

export default sessionService;
