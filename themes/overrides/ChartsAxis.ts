import type { ThemeArg } from './types';

/***************************  OVERRIDES - CHARTS AXIS  ***************************/

export default function ChartsAxis(theme: ThemeArg) {
  return {
    MuiChartsAxis: {
      styleOverrides: {
        root: {
          '& .MuiChartsAxis-tickLabel': {
            fill: theme.vars.palette.text.secondary
          },
          '& .MuiChartsAxis-line': {
            stroke: theme.vars.palette.divider
          }
        }
      }
    }
  };
}
