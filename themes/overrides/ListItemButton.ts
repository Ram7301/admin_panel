import type { ThemeArg } from './types';

/***************************  OVERRIDES - MENU  ***************************/

export default function ListItemButton(theme: ThemeArg) {
  return {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          padding: '10px 8px',
          borderRadius: 4,
          '&.Mui-selected': {
            backgroundColor: theme.vars.palette.primary.lighter,
            '&:hover': { backgroundColor: theme.vars.palette.primary.light }
          }
        }
      }
    }
  };
}
