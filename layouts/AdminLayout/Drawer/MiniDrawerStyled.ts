// @mui
import { styled, type Theme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';

// @project
import { DRAWER_WIDTH } from '@/config';

// Mixin for common (open/closed) drawer state
const commonDrawerStyles = (theme: Theme) => ({
  borderRight: `1px solid ${theme.vars.palette.grey[300]}`,
  overflowX: 'hidden' as const
});

// Mixin for opened drawer state
const openedMixin = (theme: Theme) => ({
  ...commonDrawerStyles(theme),
  width: DRAWER_WIDTH,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  })
});

// Mixin for closed drawer state
const closedMixin = (theme: Theme) => ({
  ...commonDrawerStyles(theme),
  width: 0,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  })
});

/***************************  DRAWER - MINI STYLED  ***************************/

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })<{ open?: boolean }>(
  ({ theme, open }) => ({
    width: DRAWER_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme)
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme)
    })
  })
);

export default MiniDrawerStyled;
