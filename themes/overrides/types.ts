// Permissive shared theme type used by component overrides.
// Project uses CSS-vars theme + a custom `customShadows` augmentation; rather than
// duplicating the augmentation here, we accept the theme loosely so override
// authors can read `theme.vars.palette.*` and `theme.vars.customShadows.*` freely.

export type ThemeArg = {
  vars: {
    palette: any;
    customShadows: any;
  };
  typography: any;
  transitions: any;
};
