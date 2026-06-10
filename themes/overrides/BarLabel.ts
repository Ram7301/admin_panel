import type { ThemeArg } from './types';

/***************************  OVERRIDES - BAR LABEL  ***************************/

export default function BarLabel(theme: ThemeArg) {
  return {
    MuiBarLabel: {
      styleOverrides: {
        root: {
          fill: theme.vars.palette.text.secondary
        }
      }
    }
  };
}
