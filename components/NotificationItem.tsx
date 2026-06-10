'use client';

import { isValidElement, type ReactElement, type ReactNode } from 'react';

// @mui
import Avatar, { type AvatarProps } from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// @project
import { AvatarSize } from '@/enum';

interface NotificationItemProps {
  avatar?: ReactElement | (AvatarProps & { src?: string });
  badgeAvatar?: AvatarProps & { src?: string };
  title?: ReactNode;
  subTitle?: ReactNode;
  dateTime?: ReactNode;
  isSeen?: boolean;
}

/***************************  NOTIFICATION - LIST  ***************************/

export default function NotificationItem({
  avatar,
  badgeAvatar,
  title,
  subTitle,
  dateTime,
  isSeen = false
}: NotificationItemProps) {
  const ellipsis = { textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' };

  const avatarContent = isValidElement(avatar) ? (
    <Avatar color="default">{avatar}</Avatar>
  ) : (
    <Avatar {...(avatar as AvatarProps)} />
  );

  return (
    <Stack direction="row" sx={{ width: 1, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
        {badgeAvatar ? (
          // Box component for badge position due to parent Stack component
          <Box>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Avatar
                  color="default"
                  size={AvatarSize.BADGE}
                  sx={{ border: `1px solid`, borderColor: 'common.white' }}
                  {...badgeAvatar}
                />
              }
              slotProps={{ badge: { sx: { bottom: '22%' } } }}
            >
              {avatarContent}
            </Badge>
          </Box>
        ) : (
          avatarContent
        )}
      </Stack>
      {/* minWidth: 0 -> Critical to ensure ellipsis works */}
      <Stack sx={{ flexGrow: 1, minWidth: 0, maxWidth: 1, gap: 0.25 }}>
        <Typography
          variant={isSeen ? 'body2' : 'subtitle2'}
          {...(isSeen && { color: 'grey.700' })}
          noWrap
          sx={ellipsis}
        >
          {title}
        </Typography>
        {subTitle && (
          <Typography variant="caption" color="text.secondary" noWrap sx={ellipsis}>
            {subTitle}
          </Typography>
        )}
      </Stack>
      {dateTime && (
        <Typography variant="caption" sx={{ marginLeft: 'auto', flexShrink: 0 }} {...(isSeen && { color: 'grey.700' })}>
          {dateTime}
        </Typography>
      )}
    </Stack>
  );
}
