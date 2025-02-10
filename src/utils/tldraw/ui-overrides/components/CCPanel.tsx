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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Reset menu state when panel is closed
  const handleExpandedChange = (expanded: boolean) => {
    if (!expanded) {
      setIsMenuOpen(false);
    }
    onExpandedChange?.(expanded);
  };

  return (
    <BasePanel 
      examMarkerProps={examMarkerProps}
      isExpanded={isExpanded}
      isPinned={isPinned}
      onExpandedChange={handleExpandedChange}
      onPinnedChange={onPinnedChange}
      currentContext={currentContext}
      onContextChange={setCurrentContext}
      currentExtendedContext={currentExtendedContext}
      onExtendedContextChange={setCurrentExtendedContext}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    />
  );
}; 