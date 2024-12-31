import React from 'react';
import { TLUserPreferences, TLEditorSnapshot, TLUser } from '@tldraw/tldraw';
import { CalendarNodeInterface } from '../../utils/tldraw/graph/graph-shape-types';
import { ProcessedUserNodes } from '../graph/userNeoDBService';
import { StandardizedOneNoteDetails } from './microsoft/oneNoteService';
import { CCUser } from '../../services/auth/authService';
import { logger } from '../../debugConfig';

// Type-safe storage keys
export const StorageKeys = {
  USER: 'user',
  USER_ROLE: 'userRole',
  SUPABASE_TOKEN: 'supabaseIdToken',
  MS_TOKEN: 'msAccessToken',
  NEO4J_USER_DB: 'neo4jUserDbName',
  NEO4J_WORKER_DB: 'neo4jWorkerDbName',
  USER_NODES: 'userNodes',
  CALENDAR_DATA: 'calendarData',
  IS_NEW_REGISTRATION: 'isNewRegistration',
  TLDRAW_PREFERENCES: 'tldrawUserPreferences',
  TLDRAW_FILE_PATH: 'tldrawUserFilePath',
  LOCAL_SNAPSHOT: 'localSnapshot',
  NODE_FILE_PATH: 'nodeFilePath',
  ONENOTE_NOTEBOOK: 'oneNoteNotebook',
  PRESENTATION_MODE: 'presentationMode',
  TLDRAW_USER: 'tldrawUser'
} as const;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];

// Type mapping for storage values
interface StorageValueTypes {
  [StorageKeys.USER]: CCUser;
  [StorageKeys.USER_ROLE]: string;
  [StorageKeys.SUPABASE_TOKEN]: string;
  [StorageKeys.MS_TOKEN]: string;
  [StorageKeys.NEO4J_USER_DB]: string;
  [StorageKeys.NEO4J_WORKER_DB]: string;
  [StorageKeys.USER_NODES]: ProcessedUserNodes;
  [StorageKeys.CALENDAR_DATA]: CalendarNodeInterface[];
  [StorageKeys.TLDRAW_PREFERENCES]: TLUserPreferences;
  [StorageKeys.TLDRAW_FILE_PATH]: string;
  [StorageKeys.LOCAL_SNAPSHOT]: Partial<TLEditorSnapshot>;
  [StorageKeys.NODE_FILE_PATH]: string;
  [StorageKeys.ONENOTE_NOTEBOOK]: StandardizedOneNoteDetails;
  [StorageKeys.PRESENTATION_MODE]: boolean;
  [StorageKeys.TLDRAW_USER]: TLUser;
  [StorageKeys.IS_NEW_REGISTRATION]: boolean;
}

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  get<K extends StorageKey>(key: K): StorageValueTypes[K] | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === 'undefined') return null;
      return JSON.parse(item) as StorageValueTypes[K];
    } catch (error) {
      logger.error('storage-service', `Error retrieving ${key} from storage:`, error);
      return null;
    }
  }

  set<K extends StorageKey>(key: K, value: StorageValueTypes[K]): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error('storage-service', `Error setting ${key} in storage:`, error);
    }
  }

  remove(key: StorageKey): void {
    localStorage.removeItem(key);
  }

  clearAll(): void {
    Object.values(StorageKeys).forEach(key => {
      this.remove(key);
    });
  }

  // Helper method to update state and storage together
  setStateAndStorage<K extends StorageKey>(
    setter: React.Dispatch<React.SetStateAction<StorageValueTypes[K]>>, 
    key: K, 
    value: StorageValueTypes[K]
  ): void {
    setter(value);
    this.set(key, value);
  }
}

export const storageService = StorageService.getInstance();
