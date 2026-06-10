import type { ThemeArg } from './types';

const validPaletteKeys = ['primary', 'secondary', 'error', 'warning', 'info', 'success'] as const;
type ValidPaletteKey = (typeof validPaletteKeys)[number];
const isValidPaletteKey = (value: unknown): value is ValidPaletteKey =>
  typeof value === 'string' && (validPaletteKeys as readonly string[]).includes(value);

/***************************  COMPONENT - LINEAR PROGRESS  ***************************/

export default function LinearProgress(theme: ThemeArg) {
  return {
    MuiLinearProgress: {
      defaultProps: {
        variant: 'determinate'
      },
      styleOverrides: {
        root: ({ ownerState }: { ownerState: { color?: string } }) => {
          const paletteColor = isValidPaletteKey(ownerState.color) ? theme.vars.palette[ownerState.color] : undefined;
          return {
            '& .MuiLinearProgress-bar': {
              backgroundColor: paletteColor?.main
            },
            borderRadius: 24,
            backgroundColor: theme.vars.palette.grey[100],
            variants: [
              {
                props: { type: 'light' },
                style: {
                  '& .MuiLinearProgress-bar': {
                    opacity: 0.6
                  }
                }
              }
            ]
          };
        },
        bar: {
          borderRadius: 24
        }
      }
    }
  };
}
