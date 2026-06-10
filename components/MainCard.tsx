'use client';

import type { ReactNode, Ref, CSSProperties } from 'react';

// @mui
import Card, { type CardProps } from '@mui/material/Card';
import type { Theme } from '@mui/material/styles';

type SxValue = CSSProperties | Record<string, unknown> | ((theme: Theme) => Record<string, unknown>);

interface MainCardProps extends Omit<CardProps, 'sx' | 'ref'> {
  children?: ReactNode;
  sx?: SxValue;
  ref?: Ref<HTMLDivElement>;
}

/***************************  MAIN CARD  ***************************/

export default function MainCard({ children, sx = {}, ref, ...others }: MainCardProps) {
  const defaultSx = (theme: Theme) => ({
    p: { xs: 1.75, sm: 2.25, md: 3 },
    border: `1px solid ${theme.vars.palette.divider}`,
    borderRadius: 4,
    boxShadow: theme.vars.customShadows.section
  });

  const combinedSx = (theme: Theme) => ({
    ...defaultSx(theme),
    ...(typeof sx === 'function' ? sx(theme) : sx)
  });

  return (
    <Card ref={ref} elevation={0} sx={combinedSx} {...others}>
      {children}
    </Card>
  );
}
