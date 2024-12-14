import axios from 'axios';
import { logger } from './debugConfig';

const baseURL = 'https://' + import.meta.env.VITE_SITE_URL;

const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
instance.interceptors.request.use(
  (config) => {
    logger.debug('axios', '🔄 Outgoing request', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL
    });
    return config;
  },
  (error) => {
    logger.error('axios', '❌ Request error', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
instance.interceptors.response.use(
  (response) => {
    logger.debug('axios', '✅ Response received', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error('axios', '❌ Response error', {
        status: error.response.status,
        url: error.config.url,
        data: error.response.data
      });
    } else if (error.request) {
      logger.error('axios', '❌ No response received', {
        url: error.config.url
      });
    } else {
      logger.error('axios', '❌ Request setup error', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;