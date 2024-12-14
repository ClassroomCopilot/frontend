// External imports
import {
    TLAssetStore,
    TLBookmarkAsset,
    AssetRecordType,
    uniqueId,
    getHashForString,
    TLStore,
} from '@tldraw/tldraw';
import { TLSyncUserInfo, useSync } from '@tldraw/sync';
import { useEffect, useMemo, useState, useRef } from 'react';
// Local imports
import { customSchema } from '../../utils/tldraw/schemas';
import { logger } from '../../debugConfig';

const HTTP_SYNC_WORKER_URL = `https://${import.meta.env.VITE_SITE_URL}/tldraw`

// Define proper types for the sync connection
interface WebSocketConnection extends WebSocket {
    readyState: number;
}

interface SyncAdapter {
    ws?: WebSocketConnection;
    connect: () => void;
    disconnect: () => void;
}

interface TLConnection {
    readonly connectionStatus: 'offline' | 'online';
    readonly error?: Error;
    readonly status: 'synced-remote' | 'connecting' | 'error';
    readonly store: TLStore;
    adapter?: SyncAdapter;
}

const CONNECT_TIMEOUT = 5000; // 5 seconds
const STABLE_CONNECTION_TIME = 2000; // 2 seconds to consider connection stable

export const useSyncStore = (roomId: string, userInfo: TLSyncUserInfo) => {
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'online' | 'offline' | 'error'>('connecting');
    const reconnectAttemptsRef = useRef(0);
    const stableConnectionTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const isConnectedRef = useRef(false);
    const connectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const connectionOptions = useMemo(() => ({
        uri: `${HTTP_SYNC_WORKER_URL}/connect/${roomId}`,
        userInfo,
        assets: multiplayerAssets,
        schema: customSchema,
        // Add connection config
        timeout: CONNECT_TIMEOUT,
        shouldReconnect: true,
    }), [roomId, userInfo]);

    const store = useSync(connectionOptions) as TLConnection;

    useEffect(() => {
        const adapter = store.adapter;
        if (!adapter?.ws) return;

        const ws = adapter.ws;
        let reconnectTimeout: ReturnType<typeof setTimeout>;

        const handleConnectionChange = (newStatus: typeof connectionStatus) => {
            // Clear any existing timers
            clearTimeout(stableConnectionTimerRef.current);
            clearTimeout(connectTimeoutRef.current);

            if (newStatus === 'online') {
                // Only set online after connection is stable
                stableConnectionTimerRef.current = setTimeout(() => {
                    if (isConnectedRef.current) {
                        setConnectionStatus('online');
                        reconnectAttemptsRef.current = 0;
                        logger.info('sync-service', '✅ Connection stable');
                    }
                }, STABLE_CONNECTION_TIME);
            } else {
                setConnectionStatus(newStatus);
            }
        };

        const handleOpen = () => {
            isConnectedRef.current = true;
            handleConnectionChange('online');
            logger.debug('sync-service', '🔌 WebSocket connected');
        };

        const handleClose = () => {
            isConnectedRef.current = false;
            reconnectAttemptsRef.current += 1;

            if (reconnectAttemptsRef.current <= 3) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 5000);
                logger.debug('sync-service', `🔄 Attempting reconnect in ${delay}ms`);
                
                reconnectTimeout = setTimeout(() => {
                    if (!isConnectedRef.current) {
                        adapter.disconnect();
                        adapter.connect();
                    }
                }, delay);
            } else {
                handleConnectionChange('error');
                logger.error('sync-service', '❌ Max reconnection attempts reached');
            }
        };

        const handleError = (error: Event) => {
            logger.error('sync-service', '❌ WebSocket error:', error);
            handleConnectionChange('error');
        };

        // Set initial connection timeout
        connectTimeoutRef.current = setTimeout(() => {
            if (!isConnectedRef.current) {
                handleConnectionChange('error');
                logger.error('sync-service', '❌ Connection timeout');
            }
        }, CONNECT_TIMEOUT);

        ws.addEventListener('open', handleOpen);
        ws.addEventListener('close', handleClose);
        ws.addEventListener('error', handleError);

        // Check initial connection state
        if (ws.readyState === WebSocket.OPEN) {
            handleOpen();
        }

        return () => {
            isConnectedRef.current = false;
            clearTimeout(reconnectTimeout);
            clearTimeout(stableConnectionTimerRef.current);
            clearTimeout(connectTimeoutRef.current);
            ws.removeEventListener('open', handleOpen);
            ws.removeEventListener('close', handleClose);
            ws.removeEventListener('error', handleError);
        };
    }, [store]);

    // Add store ready status with additional checks
    const isStoreReady = useMemo(() => {
        return connectionStatus === 'online' && 
               store.status === 'synced-remote' && 
               !!store.store;
    }, [connectionStatus, store.status, store.store]);

    return {
        ...store,
        connectionStatus,
        isStoreReady
    };
};

export const multiplayerAssets: TLAssetStore = {
    async upload(_asset, file) {
        const id = uniqueId()

        const objectName = `${id}-${file.name}`
        const uploadPath = '/uploads'
        const url = `${HTTP_SYNC_WORKER_URL}${uploadPath}/${encodeURIComponent(objectName)}`

        console.log('Asset: ', _asset)
        console.log('Uploading asset to: ', url)

        try {
            const response = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            })

            if (!response.ok) {
                const errorDetail = await response.text();
                console.error(`Failed to upload asset: ${response.statusText}`, errorDetail);
                throw new Error(`Failed to upload asset: ${response.statusText} - Details: ${errorDetail}`);
            }

            console.log('Upload successful, URL: ', url)
            return url
        } catch (error) {
            console.error('Error during asset upload: ', error)
            throw error
        }
    },
    resolve(asset) {
        if (asset.type === 'bookmark') {
            return asset.props.src
        }
        return asset.props.src
    },
}

export async function unfurlBookmarkUrl({ url }: { url: string }): Promise<TLBookmarkAsset> {
    const asset: TLBookmarkAsset = {
        id: AssetRecordType.createId(getHashForString(url)),
        typeName: 'asset',
        type: 'bookmark',
        props: {
            src: url,
            description: '',
            image: '',
            favicon: '',
            title: '',
        },
        meta: {}, // Add the meta property
    }

    try {
        console.log('Unfurling URL: ', url)
        const response = await fetch(`${HTTP_SYNC_WORKER_URL}/unfurl?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        asset.props.description = data?.description ?? ''
        asset.props.image = data?.image ?? ''
        asset.props.favicon = data?.favicon ?? ''
        asset.props.title = data?.title ?? ''

        console.log('Unfurling successful, data: ', data)
    } catch (e) {
        console.error('Error during URL unfurling: ', e)
    }

    return asset
}