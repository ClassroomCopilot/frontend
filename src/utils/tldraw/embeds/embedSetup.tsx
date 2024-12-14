import {
    DefaultEmbedDefinitionType,
    CustomEmbedDefinition,
    DEFAULT_EMBED_DEFINITIONS,
	TLEmbedDefinition,
} from '@tldraw/tldraw';

const defaultEmbedTypesToKeep: DefaultEmbedDefinitionType[] = [
    'tldraw',
    'figma',
    'google_maps',
    'val_town',
    'codesandbox',
    'codepen',
    'scratch',
    'youtube',
    'google_calendar',
    'google_slides',
    'github_gist',
    'replit',
    'felt',
    'spotify',
    'vimeo',
    'excalidraw',
    'observable',
    'desmos'
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

export const jsFiddleEmbed = createCustomEmbed(
    'jsfiddle',
    'JSFiddle',
    ['jsfiddle.net'],
    'https://jsfiddle.net/img/favicon.png'
);

export const pptEmbed = createCustomEmbed(
    'ppt',
    'PowerPoint',
    ['office.live.com'],
    'https://c1-odc-15.cdn.office.net/start/resources/images/favicon_powerpointcom.ico'
);

export const youtubeEmbed = createCustomEmbed(
    'youtube',
    'YouTube',
    ['youtube.com', 'youtu.be'],
    'https://youtube.com/favicon.ico'
);

export const replitEmbed = createCustomEmbed(
    'replit',
    'Replit',
    ['replit.com'],
    'https://replit.com/public/icons/favicon-196.png'
);

export const feltEmbed = createCustomEmbed(
    'felt',
    'Felt',
    ['felt.com'],
    'https://felt.com/favicon.ico'
);

export const spotifyEmbed = createCustomEmbed(
    'spotify',
    'Spotify',
    ['open.spotify.com'],
    'https://open.spotify.com/favicon.ico'
);

export const vimeoEmbed = createCustomEmbed(
    'vimeo',
    'Vimeo',
    ['vimeo.com'],
    'https://vimeo.com/favicon.ico'
);

export const excalidrawEmbed = createCustomEmbed(
    'excalidraw',
    'Excalidraw',
    ['excalidraw.com'],
    'https://excalidraw.com/favicon.ico'
);

export const observableEmbed = createCustomEmbed(
    'observable',
    'Observable',
    ['observablehq.com'],
    'https://static.observableusercontent.com/favicon.ico'
);

export const desmosEmbed = createCustomEmbed(
    'desmos',
    'Desmos',
    ['www.desmos.com'],
    'https://www.desmos.com/assets/img/favicon.ico'
);

export const customEmbeds = [
    jsFiddleEmbed,
    pptEmbed,
    youtubeEmbed,
    replitEmbed,
    feltEmbed,
    spotifyEmbed,
    vimeoEmbed,
    excalidrawEmbed,
    observableEmbed,
    desmosEmbed,
];
