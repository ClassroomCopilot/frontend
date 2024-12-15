import { TLUserPreferences, TLUser, createTLUser } from '@tldraw/tldraw';
import { storageService, StorageKeys } from '../auth/localStorageService';
import { logger } from '../../debugConfig';

export const DEFAULT_PREFERENCES: TLUserPreferences = {
  id: 'default',
  name: 'Anonymous',
  color: 'blue',
  locale: 'en',
  colorScheme: 'system',
  isSnapMode: false,
  isWrapMode: false,
  isDynamicSizeMode: false,
  isPasteAtCursorMode: false,
  animationSpeed: 1,
  edgeScrollSpeed: 1
};

export const createTldrawUser = (
    userId: string, 
    preferences?: TLUserPreferences | null
): TLUser => {
    const effectivePreferences = preferences || {
        ...DEFAULT_PREFERENCES,
        id: userId,
        name: DEFAULT_PREFERENCES.name,
        color: generateUserColor(userId)
    };

    logger.debug('tldraw-service', '🔄 Creating TLDraw user', { 
        userId,
        hasPreferences: effectivePreferences 
    });
  
    return createTLUser({
        userPreferences: {
            name: 'userPreferences',
            get: () => {
                return effectivePreferences;
            },
            lastChangedEpoch: Date.now(),
            getDiffSince: () => [],
            __unsafe__getWithoutCapture: () => effectivePreferences
        },
        setUserPreferences: (newPreferences: TLUserPreferences) => {
            storageService.set(StorageKeys.TLDRAW_PREFERENCES, newPreferences);
        }
    });
};

const generateUserColor = (userId: string): string => {
  const hash = userId.split('').reduce((acc, char) => 
    char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
};
