import type { ThemeArg } from './types';

/***************************  OVERRIDES - CARD HEADER  ***************************/

export default function CardHeader(theme: ThemeArg) {
  return {
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: 20, borderBottom: `1px solid ${theme.vars.palette.divider}` },
        action: { margin: 0 },
        content: {},
        title: { '& ~ span.MuiCardHeader-subheader': { marginTop: 4 } }
      }
    }
  };
}
