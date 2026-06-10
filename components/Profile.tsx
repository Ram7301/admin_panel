import type { ReactNode } from 'react';

// @mui
import Avatar, { type AvatarProps } from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

// @icons
import { IconPhoto } from '@tabler/icons-react';

interface ProfileProps {
  avatar?: (AvatarProps & { src?: string; sx?: SxProps<Theme> });
  title?: ReactNode;
  caption?: ReactNode;
  label?: ReactNode;
  sx?: SxProps<Theme>;
  titleProps?: TypographyProps & { sx?: SxProps<Theme> };
  captionProps?: TypographyProps & { sx?: SxProps<Theme> };
  placeholderIfEmpty?: boolean;
}

/***************************  PROFILE  ***************************/

export default function Profile({
  avatar,
  title,
  caption,
  label,
  sx,
  titleProps,
  captionProps,
  placeholderIfEmpty
}: ProfileProps) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 0.75, width: 'fit-content', ...(sx as Record<string, unknown>) }}
    >
      {(avatar?.src || placeholderIfEmpty) && (
        <Avatar
          {...avatar}
          alt="profile"
          sx={{
            ...(avatar?.sx as Record<string, unknown>),
            ...(placeholderIfEmpty && { fontSize: 20, '& svg': { width: 26, height: 26 } })
          }}
        >
          {!avatar?.src && placeholderIfEmpty && <IconPhoto stroke={1} />}
        </Avatar>
      )}
      <Stack sx={{ gap: 0.25 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="subtitle2"
            {...titleProps}
            sx={{ color: 'text.primary', whiteSpace: 'nowrap', ...(titleProps?.sx as Record<string, unknown>) }}
          >
            {title || (placeholderIfEmpty && 'N/A')}
          </Typography>
          {label}
        </Stack>
        <Typography
          variant="caption"
          {...captionProps}
          sx={{ color: 'grey.700', ...(captionProps?.sx as Record<string, unknown>) }}
        >
          {caption || (placeholderIfEmpty && '---')}
        </Typography>
      </Stack>
    </Stack>
  );
}
