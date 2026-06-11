'use client';

// @mui
import type { SxProps, Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// @project
import GetImagePath from '@/utils/GetImagePath';
import { SocialTypes } from '@/enum';

interface AuthSocialProps {
  type?: SocialTypes;
  buttonSx?: SxProps<Theme>;
}

interface AuthButton {
  label: string;
  icon: string;
  title: string;
}

/***************************  SOCIAL BUTTON - DATA  ***************************/

const authButtons: AuthButton[] = [
  {
    label: 'Google',
    icon: '/assets/images/social/google.svg',
    title: 'Sign in with Google'
  },
  {
    label: 'Facebook',
    icon: '/assets/images/social/facebook.svg',
    title: 'Sign in with Facebook'
  }
];

/***************************  AUTH - SOCIAL  ***************************/

export default function AuthSocial({ type = SocialTypes.VERTICAL, buttonSx }: AuthSocialProps) {
  return (
    <Stack direction={type === SocialTypes.VERTICAL ? 'column' : 'row'} sx={{ gap: 1 }}>
      {authButtons.map((item) => (
        <Button
          key={item.label}
          variant="outlined"
          fullWidth
          size="small"
          color="secondary"
          sx={{ ...(type === SocialTypes.HORIZONTAL && { '.MuiButton-startIcon': { m: 0 } }), ...buttonSx }}
          startIcon={<CardMedia component="img" src={GetImagePath(item.icon)} sx={{ width: 16, height: 16 }} alt={item.label} />}
        >
          {type === SocialTypes.VERTICAL && (
            <Typography variant="caption1" sx={{ textTransform: 'none' }}>
              {item.title}
            </Typography>
          )}
        </Button>
      ))}
    </Stack>
  );
}
