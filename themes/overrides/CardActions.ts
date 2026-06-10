import type { ThemeArg } from './types';

/***************************  OVERRIDES - CARD ACTIONS  ***************************/

export default function CardActions(theme: ThemeArg) {
  return {
    MuiCardActions: {
      styleOverrides: {
        root: { padding: 20, borderTop: `1px solid ${theme.vars.palette.divider}` }
      }
    }
  };
}
