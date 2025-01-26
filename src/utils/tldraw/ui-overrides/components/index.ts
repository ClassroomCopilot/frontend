import { TLComponents } from '@tldraw/tldraw';

import { RegularToolbar } from './regular/toolbar';
import { RegularHelperButtons } from './regular/helperButton';
// import { RegularHelpMenu } from './regular/helpMenu';
// import { RegularMainMenu } from './regular/mainMenu';
import { RegularNavigationPanel } from './regular/navigationPanel';
import { RegularPageMenu } from './regular/pageMenu';
import { RegularQuickActions } from './regular/quickActions';
import { RegularStylePanel } from './regular/stylePanel';
import { RegularZoomMenu } from './regular/zoomMenu';
import { RegularKeyboardShortcutsDialog } from './regular/keyboardShortcutsDialog';
import { RegularActionsMenu } from './regular/actionsMenu';
import { RegularContextMenu } from './regular/contextMenu';
import { RegularDebugMenu } from './regular/debugMenu';

import { PresentationToolbar } from './presentation/toolbar';
import { PresentationHelperButtons } from './presentation/helperButton';
// import { PresentationHelpMenu } from './presentation/helpMenu';
// import { PresentationMainMenu } from './presentation/mainMenu';
import { PresentationNavigationPanel } from './presentation/navigationPanel';
import { PresentationPageMenu } from './presentation/pageMenu';
import { PresentationQuickActions } from './presentation/quickActions';
import { PresentationStylePanel } from './presentation/stylePanel';
import { PresentationZoomMenu } from './presentation/zoomMenu';
import { PresentationKeyboardShortcutsDialog } from './presentation/keyboardShortcutsDialog';
import { PresentationActionsMenu } from './presentation/actionsMenu';
import { PresentationContextMenu } from './presentation/contextMenu';
import { PresentationDebugMenu } from './presentation/debugMenu';
import { CCPanel } from './CCPanel';

export const regularComponentsIndex: TLComponents = {
    Toolbar: RegularToolbar,
    InFrontOfTheCanvas: CCPanel,
    HelperButtons: RegularHelperButtons,
    // HelpMenu: RegularHelpMenu,
    // MainMenu: RegularMainMenu,
    NavigationPanel: RegularNavigationPanel,
    PageMenu: RegularPageMenu,
    QuickActions: RegularQuickActions,
    StylePanel: RegularStylePanel,
    ZoomMenu: RegularZoomMenu,
    KeyboardShortcutsDialog: RegularKeyboardShortcutsDialog,
    ActionsMenu: RegularActionsMenu,
    ContextMenu: RegularContextMenu,
    DebugMenu: RegularDebugMenu,
};

export const presentationComponentsIndex: TLComponents = {
    Toolbar: PresentationToolbar,
    InFrontOfTheCanvas: CCPanel,
    HelperButtons: PresentationHelperButtons,
    // HelpMenu: PresentationHelpMenu,
    // MainMenu: PresentationMainMenu,
    NavigationPanel: PresentationNavigationPanel,
    PageMenu: PresentationPageMenu,
    QuickActions: PresentationQuickActions,
    StylePanel: PresentationStylePanel,
    ZoomMenu: PresentationZoomMenu,
    KeyboardShortcutsDialog: PresentationKeyboardShortcutsDialog,
    ActionsMenu: PresentationActionsMenu,
    ContextMenu: PresentationContextMenu,
    DebugMenu: PresentationDebugMenu,
};

