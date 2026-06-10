import type { ReactNode } from 'react';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface ComponentsWrapperProps {
  children?: ReactNode;
  title?: string;
}

/***************************  COMPONENTS WRAPPER  ***************************/

export default function ComponentsWrapper({ children, title }: ComponentsWrapperProps) {
  return (
    <Stack sx={{ gap: { xs: 2, sm: 4 } }}>
      <Stack sx={{ py: 1.25, justifyContent: 'center' }}>
        <Typography variant="h6">{title}</Typography>
      </Stack>
      {children}
    </Stack>
  );
}
