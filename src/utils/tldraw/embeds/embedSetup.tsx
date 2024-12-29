import {
    DefaultEmbedDefinitionType,
    CustomEmbedDefinition,
    DEFAULT_EMBED_DEFINITIONS,
	TLEmbedDefinition,
} from '@tldraw/tldraw';

const defaultEmbedTypesToKeep: DefaultEmbedDefinitionType[] = [
    'tldraw',
    // 'figma',
    // 'google_maps',
    // 'val_town',
    // 'codesandbox',
    // 'codepen',
    // 'scratch',
    'youtube',
    // 'google_calendar',
    'google_slides',
    // 'github_gist',
    // 'replit',
    // 'felt',
    // 'spotify',
    // 'vimeo',
    // 'excalidraw',
    // 'observable',
    // 'desmos'
];

export const defaultEmbedsToKeep = DEFAULT_EMBED_DEFINITIONS.filter((embed) =>
    defaultEmbedTypesToKeep.includes(embed.type as DefaultEmbedDefinitionType)
) as TLEmbedDefinition[]

const createCustomEmbed = (
    type: string,
    title: string,
    hostnames: string[],
    icon: string,
    minWidth = 300,
    minHeight = 300,
    width = 720,
    height = 500
): CustomEmbedDefinition => ({
    type,
    title,
    hostnames,
    minWidth,
    minHeight,
    width,
    height,
    doesResize: true,
    toEmbedUrl: (url) => {
        const urlObj = new URL(url);
        return `${urlObj.origin}/embed${urlObj.pathname}`;
    },
    fromEmbedUrl: (url) => {
        const urlObj = new URL(url);
        return url.replace('/embed', '');
    },
    icon,
});

export const pptEmbed = createCustomEmbed(
    'ppt',
    'PowerPoint',
    ['office.live.com'],
    'https://c1-odc-15.cdn.office.net/start/resources/images/favicon_powerpointcom.ico'
);

export const customEmbeds = [
    pptEmbed
];
