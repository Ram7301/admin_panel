import type { ThemeArg } from './types';

/***************************  OVERRIDES - CHARTS AXIS HIGHLIGHT  ***************************/

export default function ChartsAxisHighlight(theme: ThemeArg) {
  return {
    MuiChartsAxisHighlight: {
      styleOverrides: {
        root: {
          stroke: theme.vars.palette.grey[600]
        }
      }
    }
  };
}
