import { StateNode, TLPointerEventInfo } from '@tldraw/tldraw'

const OFFSET = 12
const STICKER_INTERVAL = 20 // Adjust this value to change the spacing between stickers

class BaseStickerTool extends StateNode {
    isPointerDown = false
    lastStickerPosition = { x: 0, y: 0 }

    override onEnter() {
        this.editor.setCursor({ type: 'cross', rotation: 0 })
    }

    override onPointerDown(info: TLPointerEventInfo) {
        this.isPointerDown = true
        this.createSticker(info)
    }

    override onPointerMove(info: TLPointerEventInfo) {
        if (this.isPointerDown) {
            const { x, y } = info.point
            const dx = x - this.lastStickerPosition.x
            const dy = y - this.lastStickerPosition.y
            if (Math.sqrt(dx * dx + dy * dy) >= STICKER_INTERVAL) {
                this.createSticker(info)
            }
        }
    }

    override onPointerUp() {
        this.isPointerDown = false
    }

    createSticker(info: TLPointerEventInfo) {
        const { x, y } = info.point
        this.editor.createShape({
            type: 'text',
            x: x - OFFSET,
            y: y - OFFSET,
            props: { text: this.getStickerEmoji() },
        })
        this.lastStickerPosition = { x, y }
    }

    getStickerEmoji(): string {
        throw new Error('getStickerEmoji must be implemented in subclasses')
    }
}

export class HeartStickerTool extends BaseStickerTool {
    static override id = 'heartSticker'
    static override name = 'Heart Sticker'

    getStickerEmoji() {
        return '❤️'
    }
}

export class StarStickerTool extends BaseStickerTool {
    static override id = 'starSticker'
    static override name = 'Star Sticker'

    getStickerEmoji() {
        return '⭐'
    }
}

export class SmileyStickerTool extends BaseStickerTool {
    static override id = 'smileySticker'
    static override name = 'Smiley Sticker'

    getStickerEmoji() {
        return '😊'
    }
}