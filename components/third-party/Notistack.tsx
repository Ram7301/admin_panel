'use client';

import type { ReactNode } from 'react';

// @mui
import { styled } from '@mui/material/styles';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import Slide, { type SlideProps } from '@mui/material/Slide';
import Zoom from '@mui/material/Zoom';

// @third-party
import { SnackbarProvider } from 'notistack';

// @project
import { useGetSnackbar, type SnackbarTransition } from '@/states/snackbar';
import Loader from '@/components/Loader';

// @assets
import { IconAlertTriangle, IconBug, IconChecks, IconInfoCircle, IconSpeakerphone } from '@tabler/icons-react';

// custom styles
const StyledSnackbarProvider = styled(SnackbarProvider)(({ theme }) => ({
  '&.notistack-MuiContent': {
    color: theme.vars.palette.background.default
  },
  '&.notistack-MuiContent-default': {
    backgroundColor: theme.vars.palette.primary.main
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: theme.vars.palette.error.main
  },
  '&.notistack-MuiContent-success': {
    backgroundColor: theme.vars.palette.success.main
  },
  '&.notistack-MuiContent-info': {
    backgroundColor: theme.vars.palette.info.main
  },
  '&.notistack-MuiContent-warning': {
    backgroundColor: theme.vars.palette.warning.main
  },
  '& #notistack-snackbar': {
    gap: 8
  }
}));

/***************************  SNACKBAR - ANIMATION  ***************************/

function TransitionSlideLeft(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

function TransitionSlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

function TransitionSlideRight(props: SlideProps) {
  return <Slide {...props} direction="right" />;
}

function TransitionSlideDown(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

const animation: Record<string, React.ComponentType<any>> = {
  SlideLeft: TransitionSlideLeft,
  SlideUp: TransitionSlideUp,
  SlideRight: TransitionSlideRight,
  SlideDown: TransitionSlideDown,
  Grow,
  Zoom,
  Fade
};

const iconSX = { fontSize: '1.15rem' };

interface NotistackProps {
  children?: ReactNode;
}

/***************************  SNACKBAR - NOTISTACK  ***************************/

export default function Notistack({ children }: NotistackProps) {
  const { snackbar } = useGetSnackbar();

  if (snackbar === undefined) return <Loader />;

  return (
    <StyledSnackbarProvider
      maxSnack={snackbar.maxStack}
      dense={snackbar.dense}
      anchorOrigin={snackbar.anchorOrigin}
      TransitionComponent={animation[snackbar.transition as SnackbarTransition]}
      iconVariant={
        snackbar.iconVariant === 'useemojis'
          ? {
              default: <IconSpeakerphone style={iconSX} />,
              success: <IconChecks style={iconSX} />,
              error: <IconBug style={iconSX} />,
              warning: <IconAlertTriangle style={iconSX} />,
              info: <IconInfoCircle style={iconSX} />
            }
          : undefined
      }
      hideIconVariant={snackbar.iconVariant === 'hide'}
    >
      {children}
    </StyledSnackbarProvider>
  );
}
