import React, { useEffect, useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { IconButton, Tooltip, Box, Typography, Popover } from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Map as MapIcon,
    Home as HomeIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useNavigationStore } from '../../stores/navigationStore';
import { logger } from '../../debugConfig';
import { UserNeoDBService } from '../../services/graph/userNeoDBService';

const NavigationRoot = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  max-width: 800px;
  overflow: hidden;
`;

const BreadcrumbContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
`;

const NodeLabel = styled('span')`
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  &:hover {
    background-color: ${props => props.theme.palette.action.hover};
    cursor: pointer;
  }
`;

const Separator = styled('span')`
  color: ${props => props.theme.palette.text.secondary};
`;

const NavigationControls = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MenuItem = styled(Box)`
  padding: 8px 16px;
  &:hover {
    background-color: ${props => props.theme.palette.action.hover};
    cursor: pointer;
  }
`;

export const GraphNavigator: React.FC = () => {
  const {
    history,
    availableRoutes,
    back,
    forward,
    navigate,
    navigateToNode,
    isLoading
  } = useNavigationStore();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    logger.debug('navigation', '🗺️ Routes menu clicked', { 
      availableRoutes: availableRoutes.map(r => ({ id: r.id, label: r.label, type: r.type }))
    });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    logger.debug('navigation', '🗺️ Routes menu closed');
  };

  const handleNodeClick = async (nodeId: string) => {
    try {
      if (nodeId.startsWith('User_')) {
        await navigateToNode(nodeId);
      } else {
        // Get the database name from the current node's path
        const currentNode = history.nodes[history.currentIndex];
        const dbName = currentNode ? UserNeoDBService.getNodeDatabaseName(currentNode) : undefined;
        
        if (!dbName) {
          logger.error('navigation', '❌ Failed to determine database name');
          return;
        }

        await navigate(nodeId, dbName);
      }
      handleMenuClose();
    } catch (error) {
      logger.error('navigation', '❌ Failed to navigate', { nodeId, error });
    }
  };

  const canGoBack = history.currentIndex > 0;
  const canGoForward = history.currentIndex < history.nodes.length - 1;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if Alt key is pressed
      if (!event.altKey) return;

      switch (event.key) {
        case 'ArrowLeft':
          if (canGoBack && !isLoading) {
            event.preventDefault();
            back();
          }
          break;
        case 'ArrowRight':
          if (canGoForward && !isLoading) {
            event.preventDefault();
            forward();
          }
          break;
        case 'Home':
          if (history.nodes.length && !isLoading) {
            event.preventDefault();
            handleNodeClick(history.nodes[0].id);
          }
          break;
        case 'm':
          // Toggle routes menu
          if (availableRoutes.length > 0) {
            event.preventDefault();
            if (buttonRef.current) {
              if (anchorEl) {
                handleMenuClose();
              } else {
                handleMenuOpen({ currentTarget: buttonRef.current } as React.MouseEvent<HTMLButtonElement>);
              }
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, canGoForward, history.nodes, isLoading, back, forward, availableRoutes.length, anchorEl]);

  return (
    <NavigationRoot>
      <NavigationControls>
        <Tooltip title="Home (Alt+Home)">
          <span>
            <IconButton
              onClick={() => handleNodeClick(history.nodes[0]?.id)}
              disabled={!history.nodes.length || isLoading}
              size="small"
            >
              <HomeIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Back (Alt+←)">
          <span>
            <IconButton 
              onClick={back}
              disabled={!canGoBack || isLoading}
              size="small"
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Forward (Alt+→)">
          <span>
            <IconButton
              onClick={forward}
              disabled={!canGoForward || isLoading}
              size="small"
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Search (Alt+/)">
          <span>
            <IconButton
              onClick={() => {
                // TODO: Implement search
                logger.debug('navigation', '🔍 Search clicked');
              }}
              size="small"
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </NavigationControls>

      <BreadcrumbContainer>
        {history.nodes.slice(0, history.currentIndex + 1).map((node, index) => (
          <React.Fragment key={node.id}>
            {index > 0 && <Separator>/</Separator>}
            <Tooltip title={`Type: ${node.type}`}>
              <NodeLabel
                onClick={() => handleNodeClick(node.id)}
                style={{
                  fontWeight: index === history.currentIndex ? 'bold' : 'normal',
                }}
              >
                {node.label}
              </NodeLabel>
            </Tooltip>
          </React.Fragment>
        ))}
      </BreadcrumbContainer>

      {availableRoutes.length > 0 && (
        <Box>
          <Tooltip title="Available routes (Alt+M)">
            <IconButton 
              ref={buttonRef}
              size="small"
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: anchorEl ? 'action.selected' : 'transparent'
              }}
            >
              <MapIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                minWidth: 200,
                maxWidth: 300,
                maxHeight: 400,
                overflow: 'auto',
              }
            }}
          >
            {availableRoutes.map(route => (
              <MenuItem
                key={route.id}
                onClick={() => {
                  logger.debug('navigation', '🗺️ Route clicked', { route });
                  handleNodeClick(route.id);
                }}
              >
                <Typography variant="body2" noWrap>
                  {route.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {route.type}
                </Typography>
              </MenuItem>
            ))}
          </Popover>
        </Box>
      )}
    </NavigationRoot>
  );
}; 