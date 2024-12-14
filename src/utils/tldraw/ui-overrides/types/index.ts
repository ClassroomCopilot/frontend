import { TLComponents, TLUiOverrides } from '@tldraw/tldraw'

export interface UiConfig {
  components: TLComponents
  overrides: TLUiOverrides
}

export type UiMode = 'regular' | 'presentation'