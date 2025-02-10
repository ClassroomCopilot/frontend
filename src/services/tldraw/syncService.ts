// External imports
import {
    TLAssetStore,
    uniqueId,
    TLAsset,
    TLBookmarkAsset,
    AssetRecordType,
    getHashForString,
} from '@tldraw/tldraw';
import { logger } from '../../debugConfig';

export interface SyncConnectionOptions {
    userId: string;
    displayName: string;
    color: string;
    roomId?: string;
    baseUrl: string;
}

export function createSyncConnectionOptions(options: SyncConnectionOptions) {
    const {
        userId,
        displayName,
        roomId = 'multiplayer',
        baseUrl

    } = options;

    // Ensure we have valid user info
    if (!userId || !displayName) {
        logger.warn('sync-service', 'Missing user information', { userId, displayName });
    }

    // Create a unique room ID if not provided
    const effectiveRoomId = roomId || `room-${uniqueId()}`;

    const multiplayerAssets: TLAssetStore = {
        async upload(_asset: unknown, file: File) {
            const id = uniqueId();
            const objectName = `${id}-${file.name}`;
            const uploadPath = '/uploads';
            const url = `${baseUrl}${uploadPath}/${encodeURIComponent(objectName)}`;

            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type
                    }
                });

                if (!response.ok) {
                    const errorDetail = await response.text();
                    throw new Error(`Failed to upload asset: ${response.statusText} - Details: ${errorDetail}`);
                }

                return url;
            } catch (error) {
                logger.error('sync-service', 'Error during asset upload: ', error);
                throw error;
            }
        },
        resolve(asset: TLAsset) {
            return asset.props.src ?? '';
        }
    };

    logger.info('sync-service', '🔄 Creating sync connection', { 
        userId, 
        displayName, 
        roomId: effectiveRoomId 
    });

    return {
        uri: `${baseUrl}/connect/${effectiveRoomId}`,
        assets: multiplayerAssets,
        roomId: effectiveRoomId
    };
}

export async function handleExternalAsset(baseUrl: string, url: string): Promise<TLBookmarkAsset> {
    const asset: TLBookmarkAsset = {
        id: AssetRecordType.createId(getHashForString(url)),
        typeName: 'asset',
        type: 'bookmark',
        props: {
            src: url,
            description: '',
            image: '',
            favicon: '',
            title: ''
        },
        meta: {}
    };

    try {
        const response = await fetch(`${baseUrl}/unfurl?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        asset.props = {
            ...asset.props,
            ...data
        };
    } catch (error) {
        logger.error('sync-service', 'Error unfurling URL:', error);
    }

    return asset;
}

export function generateSharedRoomId(path: string): string {
    // Create a deterministic room ID based on the path
    const sanitizedPath = path.replace(/[^a-zA-Z0-9]/g, '-');
    return `shared-${sanitizedPath}`;
}

