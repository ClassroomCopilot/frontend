import {
    DefaultStylePanel,
    DefaultStylePanelContent,
    TLUiStylePanelProps,
    useRelevantStyles
} from '@tldraw/tldraw';

export const RegularStylePanel = (props: TLUiStylePanelProps) => {
    return (
        <DefaultStylePanel {...props}>
            <DefaultStylePanelContent styles={useRelevantStyles()} />
        </DefaultStylePanel>
    )
};