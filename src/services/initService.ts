import { logger } from '../debugConfig';
import Modal from 'react-modal';

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

  // Set the app element for react-modal
  Modal.setAppElement('#root');

  isInitialized = true;
};

export const resetInitialization = () => {
  isInitialized = false;
}; 