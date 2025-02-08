import axios from 'axios';
import { logger } from './debugConfig';

// Use development backend URL if no custom URL is provided
const baseURL = import.meta.env.VITE_SITE_URL.startsWith('http') 
  ? import.meta.env.VITE_SITE_URL
  : `https://${import.meta.env.VITE_SITE_URL}`;

const instance = axios.create({
  baseURL,
  timeout: 120000,  // Increase timeout to 120 seconds for large files
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
instance.interceptors.request.use(
  (config) => {
    // Don't override Content-Type if it's already set (e.g., for multipart/form-data)
    if (config.headers['Content-Type'] === 'application/json' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
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

// Add type guard for Axios errors
export const {isAxiosError} = axios;

// Export the axios instance with the type guard
export default Object.assign(instance, { isAxiosError });