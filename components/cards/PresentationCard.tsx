import type { ReactNode } from 'react';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// @project
import MainCard from '@/components/MainCard';

interface PresentationCardProps {
  title?: string;
  children?: ReactNode;
}

/***************************  PRESENTATION CARD  ***************************/

export default function PresentationCard({ title, children }: PresentationCardProps) {
  return (
    <MainCard>
      <Stack sx={{ gap: 3.25 }}>
        <Typography variant="h6" sx={{ fontWeight: 400 }}>
          {title}
        </Typography>
        {children}
      </Stack>
    </MainCard>
  );
}
