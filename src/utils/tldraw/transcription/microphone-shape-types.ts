import { TLBaseShape, TLDefaultColorStyle } from '@tldraw/tldraw'

export type IMicrophoneShape = TLBaseShape<
  'microphone',
  {
    w: number
    h: number
    color: TLDefaultColorStyle
    isOn: boolean
    buttonX: number
    buttonY: number
    buttonWidth: number
    buttonHeight: number
  }
>

export type ITranscriptionTextShape = TLBaseShape<
  'transcriptionText',
  {
    text: string
    w: number
    h: number
    sentenceId: string
    isComplete: boolean
  }
>