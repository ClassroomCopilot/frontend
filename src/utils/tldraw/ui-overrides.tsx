import {
    TLComponents,
    TLUiOverrides,
    TldrawUiToastsProvider,
    TLUiToast,
    Editor,
    TLUiToastsContextType,
    Atom,
    atom
} from '@tldraw/tldraw';
import { ReactNode } from 'react';

import { regularComponentsIndex, presentationComponentsIndex } from './ui-overrides/components';
import { presentationUiOverridesIndex, regularUiOverridesIndex } from './ui-overrides/overrides';

// Toast Wrapper Component
const ToastWrapper = ({ children }: { children: ReactNode }) => {
    // Create custom toast overrides
    const toastOverrides = (editor: Editor): TLUiToastsContextType => {
        const toasts: Atom<TLUiToast[]> = atom('toasts', []);

        return {
            addToast: (toast) => {
                const id = toast.id || Math.random().toString();
                const newToast: TLUiToast = { ...toast, id };
                toasts.set([...toasts.get(), newToast]);
                return id;
            },
            removeToast: (id) => {
                toasts.set(toasts.get().filter((t: TLUiToast) => t.id !== id));
                return id;
            },
            clearToasts: () => {
                toasts.set([]);
            },
            toasts
        };
    };

    return (
        <TldrawUiToastsProvider overrides={toastOverrides}>
            {children}
        </TldrawUiToastsProvider>
    );
};

// Function to get the appropriate UI overrides
export const getUiOverrides = (presentationMode: boolean): TLUiOverrides => {
    return presentationMode ? presentationUiOverridesIndex : regularUiOverridesIndex;
};

// Function to get the appropriate UI configuration
export const getUiComponents = (presentationMode: boolean): TLComponents => {
    return presentationMode ? presentationComponents : regularComponents;
};

// Regular components configuration
const regularComponents: TLComponents = {
    Toolbar: regularComponentsIndex.Toolbar,
    KeyboardShortcutsDialog: regularComponentsIndex.KeyboardShortcutsDialog,
    HelperButtons: regularComponentsIndex.HelperButtons,
    ActionsMenu: regularComponentsIndex.ActionsMenu,
    ContextMenu: regularComponentsIndex.ContextMenu,
    DebugMenu: regularComponentsIndex.DebugMenu,
    HelpMenu: regularComponentsIndex.HelpMenu,
    MainMenu: regularComponentsIndex.MainMenu,
    NavigationPanel: regularComponentsIndex.NavigationPanel,
    PageMenu: regularComponentsIndex.PageMenu,
    QuickActions: regularComponentsIndex.QuickActions,
    StylePanel: regularComponentsIndex.StylePanel,
    ZoomMenu: regularComponentsIndex.ZoomMenu
};

// Presentation components configuration
const presentationComponents: TLComponents = {
    Toolbar: presentationComponentsIndex.Toolbar,
    KeyboardShortcutsDialog: presentationComponentsIndex.KeyboardShortcutsDialog,
    HelperButtons: presentationComponentsIndex.HelperButtons,
    ActionsMenu: presentationComponentsIndex.ActionsMenu,
    ContextMenu: presentationComponentsIndex.ContextMenu,
    DebugMenu: presentationComponentsIndex.DebugMenu,
    HelpMenu: presentationComponentsIndex.HelpMenu,
    MainMenu: presentationComponentsIndex.MainMenu,
    NavigationPanel: presentationComponentsIndex.NavigationPanel,
    PageMenu: presentationComponentsIndex.PageMenu,
    QuickActions: presentationComponentsIndex.QuickActions,
    StylePanel: presentationComponentsIndex.StylePanel,
    ZoomMenu: presentationComponentsIndex.ZoomMenu
};

export { ToastWrapper };

