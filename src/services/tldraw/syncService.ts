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

    return {
        uri: `${baseUrl}/connect/${roomId}`,
        assets: multiplayerAssets
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

