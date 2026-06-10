import type { ThemeArg } from './types';

/***************************  COMPONENT - BREADCRUMBS  ***************************/

export default function Breadcrumbs(theme: ThemeArg) {
  return {
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          color: theme.vars.palette.text.secondary,
          marginLeft: 4,
          marginRight: 4
        }
      }
    }
  };
}
