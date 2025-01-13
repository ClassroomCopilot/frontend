import { CCBaseShape, CCBaseShapeUtil } from '../CCBaseShapeUtil'
import { ccShapeProps, getDefaultCCSettingsProps } from '../cc-props'
import { ccShapeMigrations } from '../cc-migrations'
import { SettingsComponent } from './SettingsComponent'

export interface CCSettingsShape extends CCBaseShape {
  type: 'cc-settings'
  props: {
    title: string
    w: number
    h: number
    headerColor: string
    isLocked: boolean
    userEmail: string
    userRole: string
    isTeacher: boolean
  }
}

export class CCSettingsShapeUtil extends CCBaseShapeUtil<CCSettingsShape> {
  static override type = 'cc-settings' as const
  static override props = ccShapeProps.settings
  static override migrations = ccShapeMigrations.settings

  override getDefaultProps(): CCSettingsShape['props'] {
    return getDefaultCCSettingsProps() as CCSettingsShape['props']
  }

  override canResize = () => false
  override isAspectRatioLocked = () => false
  override hideResizeHandles = () => true
  override hideRotateHandle = () => false
  override canEdit = () => false

  override renderContent = () => {
    return <SettingsComponent />
  }
} 