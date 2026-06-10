'use client';

import { useMemo, type ReactNode } from 'react';

// @mui
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// @project
import { CSS_VAR_PREFIX } from '@/config';
import useConfig from '@/hooks/useConfig';
import CustomShadows from './custom-shadows';
import componentsOverride from './overrides';
import { buildPalette } from './palette';
import typography from './typography';

/*************************** DEFAULT THEME - MAIN ***************************/

interface ThemeCustomizationProps {
  children: ReactNode;
}

export default function ThemeCustomization({ children }: ThemeCustomizationProps) {
  const {
    state: { themeDirection }
  } = useConfig();

  const palette = useMemo(() => buildPalette(), []);

  const theme = createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 768,
        md: 1024,
        lg: 1266,
        xl: 1440
      }
    },
    direction: themeDirection,
    colorSchemes: {
      light: {
        palette: palette.light as never,
        customShadows: CustomShadows(palette.light as never)
      }
    },
    cssVariables: {
      cssVarPrefix: CSS_VAR_PREFIX,
      colorSchemeSelector: 'data-color-scheme'
    },
    typography: typography()
  });

  theme.components = componentsOverride(theme as never) as never;

  return (
    <ThemeProvider disableTransitionOnChange theme={theme} defaultMode="light">
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
