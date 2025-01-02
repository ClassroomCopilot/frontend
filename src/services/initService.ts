import { logger } from '../debugConfig';

let isInitialized = false;

export const initializeApp = () => {
  if (isInitialized) {
    return;
  }

  logger.debug('app', '🚀 App initializing', {
    isDevMode: import.meta.env.VITE_DEV === 'true',
    environment: import.meta.env.MODE,
    appName: import.meta.env.VITE_APP_NAME
  });

  isInitialized = true;
};

export const resetInitialization = () => {
  isInitialized = false;
}; 