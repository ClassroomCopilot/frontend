import React, { useState } from 'react';
import { BasePanel } from './shared/BasePanel';
import { CCExamMarkerPanel } from './shared/CCExamMarkerPanel';
import { BaseContext, ViewContext } from '../../../../types/navigation';

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
  const [currentContext, setCurrentContext] = useState<BaseContext>('profile');
  const [currentExtendedContext, setCurrentExtendedContext] = useState<ViewContext>('overview');

  return (
    <BasePanel 
      examMarkerProps={examMarkerProps}
      isExpanded={isExpanded}
      isPinned={isPinned}
      onExpandedChange={onExpandedChange}
      onPinnedChange={onPinnedChange}
      currentContext={currentContext}
      onContextChange={setCurrentContext}
      currentExtendedContext={currentExtendedContext}
      onExtendedContextChange={setCurrentExtendedContext}
    />
  );
}; 