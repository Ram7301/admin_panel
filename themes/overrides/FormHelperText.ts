import type { ThemeArg } from './types';

/***************************  OVERRIDES - FORM HELPER TEXT  ***************************/

export default function FormHelperText(theme: ThemeArg) {
  return {
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: 6,
          marginLeft: 0,
          marginRight: 0,
          color: theme.vars.palette.grey[700],
          '&.Mui-error': {
            color: theme.vars.palette.error.main
          }
        }
      }
    }
  };
}
