'use client';

// @next
import NextLink from 'next/link';

// @mui
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

// @project
import LogoMain from './LogoMain';
import LogoIcon from './LogoIcon';
import { APP_DEFAULT_PATH } from '@/config';
import { generateFocusStyle } from '@/utils/generateFocusStyle';

interface LogoSectionProps {
  isIcon?: boolean;
  sx?: SxProps<Theme>;
  to?: string;
}

/***************************  MAIN - LOGO  ***************************/

export default function LogoSection({ isIcon, sx, to }: LogoSectionProps) {
  const theme = useTheme();

  return (
    <NextLink href={!to ? APP_DEFAULT_PATH : to} passHref>
      <ButtonBase
        disableRipple
        sx={{ ...(sx as Record<string, unknown>), '&:focus-visible': generateFocusStyle(theme.vars.palette.primary.main) }}
        aria-label="logo"
      >
        {isIcon ? <LogoIcon /> : <LogoMain />}
      </ButtonBase>
    </NextLink>
  );
}
