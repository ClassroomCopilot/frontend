import {
	TLEmbedDefinition,
    TldrawUiDialogHeader,
    TldrawUiDialogTitle,
    TldrawUiDialogBody,
    TldrawUiDialogCloseButton,
    TldrawUiDialogFooter,
    TldrawUiInput,
    TldrawUiButton,
    TldrawUiButtonLabel,
    TldrawUiIcon,
    TLUiDialogProps,
    useTranslation,
    TLEmbedResult,
    useEditor,
    track,
} from '@tldraw/tldraw'
import { defaultEmbedsToKeep, customEmbeds } from './embedSetup'

// Add these utility functions
const isDefaultEmbedDefinitionType = (def: TLEmbedDefinition) => 
    defaultEmbedsToKeep.some(embed => embed.type === def.type)

const isCustomEmbedDefinition = (def: TLEmbedDefinition) => 
    customEmbeds.some(embed => embed.type === def.type)

const useGetEmbedDefinitions = () => [...defaultEmbedsToKeep, ...customEmbeds]

const useGetEmbedDefinition = () => (url: string) => {
    const allDefinitions = useGetEmbedDefinitions()
    for (const def of allDefinitions) {
        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
            if (def.hostnames.some(h => urlObj.hostname.includes(h.replace('*', '')))) {
                const embedUrl = def.fromEmbedUrl(urlObj.href)
                if (embedUrl) {
                    return { definition: def, embedUrl, url: urlObj.href }
                }
            }
        } catch (error) {
            console.error(`Error processing URL for embed type ${def.type}:`, error)
        }
    }
    return null
}

export const EmbedDialog = track(function EmbedDialog({ onClose }: TLUiDialogProps) {
    const editor = useEditor()
    const msg = useTranslation()
    const definitions = useGetEmbedDefinitions()
    const getEmbedDefinition = useGetEmbedDefinition()

    const handleEmbedSelection = (def: TLEmbedDefinition) => {
        const url = prompt(`Enter URL for ${def.title}:`, 'https://')
        if (url) {
            const embedInfo = getEmbedDefinition(url)
            if (embedInfo && embedInfo.definition.type === def.type) {
                editor.putExternalContent({
                    type: 'embed',
                    url: embedInfo.url,
                    point: editor.getViewportPageBounds().center,
                    embed: embedInfo.definition,
                })
                onClose()
            } else {
                let errorMessage = `Invalid URL for ${def.title}. `
                if (!embedInfo) {
                    errorMessage += `The URL doesn't match any known embed type.`
                } else if (embedInfo.definition.type !== def.type) {
                    errorMessage += `The URL matches a ${embedInfo.definition.title} embed, not a ${def.title} embed.`
                }
                console.error(`Embed error: ${errorMessage}`, { url, embedInfo, def })
                alert(errorMessage)
            }
        }
    }

    return (
        <>
            <TldrawUiDialogHeader>
                <TldrawUiDialogTitle>{msg('embed-dialog.title')}</TldrawUiDialogTitle>
                <TldrawUiDialogCloseButton />
            </TldrawUiDialogHeader>
            <TldrawUiDialogBody className="tlui-embed-dialog__list">
                {definitions.map((def) => {
                    const iconUrl = 'icon' in def ? def.icon : undefined
                    return (
                        <TldrawUiButton type="menu" key={def.type} onClick={() => handleEmbedSelection(def)}>
                            <TldrawUiButtonLabel>{def.title}</TldrawUiButtonLabel>
                            {iconUrl && (
                                <div
                                    className="tlui-embed-dialog__item__image"
                                    style={{ backgroundImage: `url(${iconUrl})` }}
                                />
                            )}
                        </TldrawUiButton>
                    )
                })}
            </TldrawUiDialogBody>
        </>
    )
})
