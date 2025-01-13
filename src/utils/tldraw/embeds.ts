import {
    DefaultEmbedDefinitionType,
    CustomEmbedDefinition,
    DEFAULT_EMBED_DEFINITIONS,
    TLEmbedDefinition,
} from '@tldraw/tldraw';

// Define which default embeds we want to keep
const defaultEmbedTypesToKeep: DefaultEmbedDefinitionType[] = [
    'tldraw',
    'google_slides',
];

// Filter default embeds to keep only the ones we want
export const defaultEmbedsToKeep = DEFAULT_EMBED_DEFINITIONS.filter((embed) =>
    defaultEmbedTypesToKeep.includes(embed.type as DefaultEmbedDefinitionType)
) as TLEmbedDefinition[];

// Helper to create custom embeds
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
        return url.replace('/embed', '');
    },
    icon,
});

// Define custom embeds
export const pptEmbed = createCustomEmbed(
    'ppt',
    'PowerPoint',
    ['office.live.com'],
    'https://c1-odc-15.cdn.office.net/start/resources/images/favicon_powerpointcom.ico'
);

export const ccYoutubeEmbed: CustomEmbedDefinition = {
    type: 'cc-youtube-embed',
    title: 'YouTube Video',
    hostnames: ['youtube.com', 'youtu.be'],
    width: 800,
    height: 450,
    doesResize: true,
    minWidth: 200,
    minHeight: 113,
    toEmbedUrl: (url) => {
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        return `https://www.youtube.com/embed/${videoId}`;
    },
    fromEmbedUrl: (url) => {
        const videoId = url.split('/').pop();
        return `https://www.youtube.com/watch?v=${videoId}`;
    },
    icon: 'https://www.youtube.com/favicon.ico',
};

export const customEmbeds: TLEmbedDefinition[] = [
    pptEmbed,
    ccYoutubeEmbed,
];

// Export specific embed sets for different modes
export const multiplayerEmbeds: TLEmbedDefinition[] = [
    ...defaultEmbedsToKeep,
    ...customEmbeds,
];

export const singlePlayerEmbeds: TLEmbedDefinition[] = [
    ...defaultEmbedsToKeep,
    ...customEmbeds,
];

export const devEmbeds: TLEmbedDefinition[] = [
    ...defaultEmbedsToKeep,
    ...customEmbeds,
];

// Helper function to create custom embed sets
export const createCustomEmbedSet = (...embedSets: TLEmbedDefinition[][]): TLEmbedDefinition[] => {
    return [...new Set(embedSets.flat())];
};
