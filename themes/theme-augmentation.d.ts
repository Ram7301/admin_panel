// MUI theme augmentation for project-specific tokens.
import type { CSSProperties } from 'react';
import type { CustomShadowsType } from './custom-shadows';

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadowsType;
    vars: ThemeVars;
  }
  interface ThemeOptions {
    customShadows?: CustomShadowsType;
  }
  interface PaletteOptions {
    [key: string]: unknown;
  }
  // Extend palette colors with `lighter` / `darker` shades used throughout the template
  interface PaletteColor {
    lighter?: string;
    darker?: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }
  interface PaletteColorChannel {
    lighterChannel?: string;
    darkerChannel?: string;
  }
  interface ColorSystemOptions {
    customShadows?: CustomShadowsType;
  }
  interface ColorSystem {
    customShadows: CustomShadowsType;
  }
  interface ThemeVars {
    customShadows: CustomShadowsType;
  }
  // Extend TypographyVariants to allow `caption1`
  interface TypographyVariants {
    caption1: CSSProperties;
  }
  interface TypographyVariantsOptions {
    caption1?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    caption1: true;
  }
}

declare module '@mui/material/Avatar' {
  interface AvatarOwnProps {
    size?: string;
  }
}

declare module '@mui/material/LinearProgress' {
  interface LinearProgressProps {
    type?: string;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsVariantOverrides {
    text: true;
    light: true;
  }
  interface ChipOwnProps {
    position?: string;
  }
}

declare module '@mui/material/Alert' {
  interface AlertPropsVariantOverrides {
    border: true;
  }
}

declare module '@mui/material/IconButton' {
  interface IconButtonOwnProps {
    variant?: 'contained' | 'outlined' | 'text';
  }
}

export {};
