import type { ReactNode } from 'react';

// @mui
import { styled } from '@mui/material/styles';
import Box, { type BoxProps } from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

// @third-party
import MainSimpleBar from 'simplebar-react';
import { BrowserView, MobileView } from 'react-device-detect';

// @project
import { withAlpha } from '@/utils/colorUtils';

// root style
const RootStyle = styled(BrowserView)({ flexGrow: 1, height: '100%', overflow: 'hidden' });

// scroll bar wrapper
const SimpleBarStyle = styled(MainSimpleBar)(({ theme }) => ({
  maxHeight: '100%',
  '& .simplebar-scrollbar': {
    '&:before': {
      background: withAlpha(theme.vars.palette.grey[500], 0.48)
    },
    '&.simplebar-visible:before': { opacity: 1 }
  },
  '& .simplebar-track.simplebar-vertical': { width: 10 },
  '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': { height: 6 },
  '& .simplebar-mask': { zIndex: 'inherit' }
}));

interface SimpleBarProps extends Omit<BoxProps, 'sx'> {
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

/***************************  SIMPLE SCROLL BAR   ***************************/

export default function SimpleBar({ children, sx, ...other }: SimpleBarProps) {
  return (
    <>
      <RootStyle>
        <SimpleBarStyle
          clickOnTrack={false}
          sx={sx as never}
          data-simplebar-direction="ltr"
          {...(other as Record<string, unknown>)}
        >
          {children}
        </SimpleBarStyle>
      </RootStyle>
      <MobileView>
        <Box sx={{ overflowX: 'auto', ...(sx as Record<string, unknown>) }} {...other}>
          {children}
        </Box>
      </MobileView>
    </>
  );
}
