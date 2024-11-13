import api from './apiClient';
import { Settings } from './types';
import loggingService from './loggingService';

const settingsService = {
  getSettings: () => api.get<Settings>('/settings'),

  updateSettings: async (settings: Partial<Settings>) => {
    try {
      const response = await api.post<Settings>('/settings', settings);
      loggingService.info(
        'Settings',
        `Settings updated: ${JSON.stringify(settings)}`
      );
      return response;
    } catch (error: any) {
      loggingService.error(
        'Settings',
        `Failed to update settings: ${error.message}`
      );
      throw error;
    }
  }
};

export default settingsService;
