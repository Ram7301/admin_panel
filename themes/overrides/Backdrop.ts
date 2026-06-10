// @project
import { withAlpha } from '@/utils/colorUtils';
import type { ThemeArg } from './types';

/***************************  OVERRIDES - BACKDROP  ***************************/

export default function Backdrop(theme: ThemeArg) {
  return {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: withAlpha(theme.vars.palette.grey[900], 0.2)
        }
      }
    }
  };
}
