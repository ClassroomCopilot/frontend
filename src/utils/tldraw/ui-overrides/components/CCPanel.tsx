import React from 'react';
import { BasePanel } from './shared/BasePanel';
import { CCExamMarkerPanel } from './shared/CCExamMarkerPanel';

interface CCPanelProps {
  examMarkerProps?: React.ComponentProps<typeof CCExamMarkerPanel>;
  isExpanded?: boolean;
  isPinned?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onPinnedChange?: (pinned: boolean) => void;
}

export const CCPanel: React.FC<CCPanelProps> = ({ 
  examMarkerProps,
  isExpanded,
  isPinned,
  onExpandedChange,
  onPinnedChange,
}) => {
  return (
    <BasePanel 
      examMarkerProps={examMarkerProps}
      isExpanded={isExpanded}
      isPinned={isPinned}
      onExpandedChange={onExpandedChange}
      onPinnedChange={onPinnedChange}
    />
  );
}; 