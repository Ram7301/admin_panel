// @mui
import LinearProgress, { type LinearProgressProps } from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// @project
import { LinearProgressType } from '@/enum';

interface ProgressCardProps {
  title?: string;
  value?: string;
  progress?: Partial<LinearProgressProps>;
}

/***************************  CARD - PROGRESS  ***************************/

export default function ProgressCard({ title, value, progress }: ProgressCardProps) {
  return (
    <Stack sx={{ gap: 0.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2">{title}</Typography>
        <Typography variant="subtitle1">{value}</Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        type={LinearProgressType.LIGHT}
        {...progress}
        aria-label="progress"
      />
    </Stack>
  );
}
