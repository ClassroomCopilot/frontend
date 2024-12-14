import {
    DefaultStylePanel,
    DefaultStylePanelContent,
    TLUiStylePanelProps,
    TldrawUiButton,
    useRelevantStyles
} from '@tldraw/tldraw';

import { SnapshotToolbar } from './../../../toolbars/snapshotToolbar';
import { UserToolbar } from './../../../toolbars/userToolbar';
import { ToolsToolbar } from './../../../toolbars/toolsToolbar';

export const PresentationStylePanel = (props: TLUiStylePanelProps) => {
    const emojiButtonStyle = {
        fontSize: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
    };

    const toolbarStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0 8px',
    };

    return (
        <DefaultStylePanel {...props}>
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0px', 
                padding: '0px',
                position: 'relative',
                top: '0px',
                left: '0',
                zIndex: 1000,
                background: 'var(--color-panel)',
                borderRadius: 'var(--radius-2)',
                boxShadow: 'var(--shadow-2)',
                width: '100%',
            }}>
                <UserToolbar>
                    {({ handleLogout, handleNavUserHome }) => (
                        <div style={toolbarStyle}>
                            <TldrawUiButton type="icon" title="Logout" onClick={handleLogout} style={emojiButtonStyle}>
                                🚪
                            </TldrawUiButton>
                            <TldrawUiButton type="icon" title="Home" onClick={handleNavUserHome} style={emojiButtonStyle}>
                                🏠
                            </TldrawUiButton>
                        </div>
                    )}
                </UserToolbar>
                <SnapshotToolbar pathFromCalendar={null}>
                    {({ save, resetToBlankCanvas }) => (
                        <div style={toolbarStyle}>
                            <TldrawUiButton type="icon" title="Save Snapshot" onClick={save} style={emojiButtonStyle}>
                                💾
                            </TldrawUiButton>
                            <TldrawUiButton type="icon" title="Reset Canvas" onClick={resetToBlankCanvas} style={emojiButtonStyle}>
                                🔄
                            </TldrawUiButton>
                        </div>
                    )}
                </SnapshotToolbar>
                <ToolsToolbar>
                    {({ handlePutUserNode, handleOpenOneNote, handleAddCalendar: toolbarHandleAddCalendar }) => (
                        <div style={toolbarStyle}>
                            <TldrawUiButton type="icon" title="Add User Node" onClick={handlePutUserNode} style={emojiButtonStyle}>
                                👤
                            </TldrawUiButton>
                            <TldrawUiButton type="icon" title="Add Calendar" onClick={toolbarHandleAddCalendar} style={emojiButtonStyle}>
                                📅
                            </TldrawUiButton>
                            <TldrawUiButton type="icon" title="Open OneNote" onClick={handleOpenOneNote} style={emojiButtonStyle}>
                                📓
                            </TldrawUiButton>
                        </div>
                    )}
                </ToolsToolbar>
            </div>
        </DefaultStylePanel>
    )
};