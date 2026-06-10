import type { ThemeArg } from './types';

/***************************  COMPONENT - TOOLTIP  ***************************/

export default function Tooltip(theme: ThemeArg) {
  return {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          ...theme.typography.caption,
          color: theme.vars.palette.secondary.darker,
          backgroundColor: theme.vars.palette.secondary.lighter,
          padding: 6,
          borderRadius: 8,
          boxShadow: theme.vars.customShadows.tooltip,
          '& svg': {
            opacity: 0.7
          }
        },
        arrow: {
          color: theme.vars.palette.secondary.lighter
        }
      }
    }
  };
}
