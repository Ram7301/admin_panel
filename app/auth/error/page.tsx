'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

// @project
import { NextLink } from '@/components/routes';

/***************************  AUTH ERROR PAGE  ***************************/

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'Callback':
        return 'There was an error with the callback. Please try again.';
      case 'OAuthSignin':
        return 'Error connecting to the authentication provider.';
      case 'OAuthCallback':
        return 'Error in the OAuth callback.';
      case 'EmailSignInError':
        return 'Could not send the sign-in email.';
      case 'EmailCreateAccount':
        return 'Could not create user account.';
      case 'SessionCallback':
        return 'Error in session callback.';
      case 'Default':
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  return (
    <Container maxWidth="sm">
      <Stack sx={{ py: 10, textAlign: 'center', gap: 3 }}>
        <Alert severity="error">{getErrorMessage()}</Alert>

        <Typography variant="h4">Authentication Failed</Typography>

        <Stack sx={{ gap: 2, pt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            component={NextLink}
            href="/auth/login"
          >
            Back to Login
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}