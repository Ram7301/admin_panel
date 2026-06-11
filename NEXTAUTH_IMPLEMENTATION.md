# NextAuth.js Implementation Guide

## 🚀 Step-by-Step Implementation

### Phase 1: Setup & Installation

#### Step 1: Install NextAuth.js

```bash
pnpm add next-auth
# or
npm install next-auth
```

#### Step 2: Generate Secret Key

```bash
openssl rand -base64 32
```

Copy the output - you'll use it in `.env.local`

#### Step 3: Configure Environment Variables

**File**: `.env.local` (Create or update)

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Backend API (optional, if using external API)
API_BASE_URL=http://localhost:5000

# For production
# NEXTAUTH_SECRET=your_production_secret
# NEXTAUTH_URL=https://yourdomain.com
```

---

### Phase 2: Create Auth Configuration

#### Step 4: Create Auth Handler

**File**: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/***************************  NEXTAUTH CONFIGURATION  ***************************/

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' }
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          // Option 1: Call external backend API
          const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:5000'}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Invalid credentials');
          }

          const user = await response.json();

          // Return user object - this becomes JWT payload
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role || 'user',
            image: user.avatar
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      }
    })
  ],

  // JWT Configuration
  session: {
    strategy: 'jwt', // Use JWT instead of database
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  // Callbacks
  callbacks: {
    // Called whenever JWT is created or updated
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'user';
        token.email = user.email;
      }
      return token;
    },

    // Called when session is requested (useSession hook)
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.email = token.email as string;
      }
      return session;
    },

    // Callback after signin
    async redirect({ url, baseUrl }) {
      // Allow callback urls starting with /
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allow same origin callback urls
      return baseUrl + '/dashboard';
    }
  },

  // Custom pages
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },

  // Events
  events: {
    async signIn({ user }) {
      console.log('✅ User signed in:', user?.email);
    },
    async signOut() {
      console.log('❌ User signed out');
    }
  },

  // Debug mode (set to true during development)
  debug: process.env.NODE_ENV === 'development',

  // Cookie settings
  useSecureCookies: process.env.NODE_ENV === 'production'
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

### Phase 3: Create Type Definitions

#### Step 5: Extend NextAuth Types

**File**: `types/next-auth.d.ts` (Create new file)

```typescript
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: 'admin' | 'user' | 'moderator';
      email?: string;
      name?: string;
      image?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    role?: 'admin' | 'user' | 'moderator';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'admin' | 'user' | 'moderator';
    email?: string;
  }
}
```

---

### Phase 4: Setup SessionProvider

#### Step 6: Update ProviderWrapper

**File**: `app/ProviderWrapper.tsx` (REPLACE ENTIRE FILE)

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';

// @mui
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

// @project
import Notistack from '@/components/third-party/Notistack';
import { ConfigProvider } from '@/contexts/ConfigContext';
import ThemeCustomization from '@/themes';

/***************************  LAYOUT - CONFIG, THEME, AUTH  ***************************/

export default function ProviderWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <InitColorSchemeScript attribute="data-color-scheme" defaultMode="light" />
      <SessionProvider>
        <ConfigProvider>
          <ThemeCustomization>
            <Notistack>{children}</Notistack>
          </ThemeCustomization>
        </ConfigProvider>
      </SessionProvider>
    </>
  );
}
```

---

### Phase 5: Create useAuth Hook

#### Step 7: Create useAuth Hook

**File**: `hooks/useAuth.ts` (REPLACE ENTIRE FILE)

```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';
import type { Session } from 'next-auth';

/***************************  USE AUTH HOOK  ***************************/

export interface UseAuthReturn {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Session['user'] | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  status: 'authenticated' | 'unauthenticated' | 'loading';
}

/**
 * Hook to access authentication state and methods
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  // Login with email and password
  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false // Don't auto-redirect
      });

      if (!result?.ok) {
        throw new Error(result?.error || 'Login failed');
      }

      return result;
    },
    []
  );

  // Logout user
  const logout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  }, []);

  return {
    session,
    isAuthenticated: !!session && status === 'authenticated',
    isLoading: status === 'loading',
    user: session?.user || null,
    login,
    logout,
    status
  };
}
```

---

### Phase 6: Middleware for Route Protection

#### Step 8: Create Middleware

**File**: `middleware.ts` (at project root - CREATE NEW FILE)

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

/***************************  NEXTAUTH MIDDLEWARE  ***************************/

export default withAuth(
  function middleware(request: NextRequest) {
    const token = request.nextauth.token;
    const pathname = request.nextUrl.pathname;

    // Redirect authenticated users away from auth pages
    if ((pathname === '/auth/login' || pathname === '/auth/register') && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Check if user is authorized to access route
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Protect admin/dashboard routes - must have token
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/(admin)')) {
          return !!token;
        }

        // Allow all other routes (including /auth/login, /auth/register)
        return true;
      }
    },
    pages: {
      signIn: '/auth/login'
    }
  }
);

// Specify which routes to run middleware on
export const config = {
  matcher: [
    // Protect admin routes
    '/dashboard/:path*',
    '/(admin)/:path*',
    // Allow auth pages
    '/auth/:path*'
  ]
};
```

---

### Phase 7: Update Components

#### Step 9: Update Login Component

**File**: `sections/auth/AuthLogin.tsx` (REPLACE entire file)

```typescript
'use client';

// @next
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// @mui
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

// @third-party
import { useForm, type RegisterOptions } from 'react-hook-form';

// @project
import { useAuth } from '@/hooks/useAuth';
import { NextLink } from '@/components/routes';
import { emailSchema, passwordSchema } from '@/utils/validation-schema/common';

// @icons
import { IconEye, IconEyeOff } from '@tabler/icons-react';

interface LoginFormData {
  email: string;
  password: string;
}

interface AuthLoginProps {
  inputSx?: SxProps<Theme>;
}

/***************************  AUTH - LOGIN WITH NEXTAUTH  ***************************/

export default function AuthLogin({ inputSx }: AuthLoginProps) {
  const router = useRouter();
  const theme = useTheme();
  const { login, isLoading } = useAuth();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (formData: LoginFormData) => {
    try {
      setLoginError('');
      const result = await login(formData.email, formData.password);

      if (result.ok) {
        // NextAuth session is created automatically
        router.push('/dashboard');
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const commonIconProps = { size: 16, color: theme.vars.palette.grey[700] };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}

      <Stack sx={{ mb: 1.5 }}>
        <InputLabel htmlFor="email-login">Email Address</InputLabel>
        <OutlinedInput
          id="email-login"
          type="email"
          placeholder="email@example.com"
          {...register('email', emailSchema as RegisterOptions)}
          sx={inputSx}
          disabled={isLoading}
        />
        {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
      </Stack>

      <Stack sx={{ mb: 2 }}>
        <InputLabel htmlFor="password-login">Password</InputLabel>
        <OutlinedInput
          id="password-login"
          type={isPasswordVisible ? 'text' : 'password'}
          placeholder="••••••••"
          {...register('password', passwordSchema as RegisterOptions)}
          endAdornment={
            <InputAdornment position="end">
              <Button
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                edge="end"
                color="secondary"
                aria-label="toggle password visibility"
                sx={{ pr: 1.25 }}
              >
                {isPasswordVisible ? (
                  <IconEyeOff {...commonIconProps} />
                ) : (
                  <IconEye {...commonIconProps} />
                )}
              </Button>
            </InputAdornment>
          }
          sx={inputSx}
          disabled={isLoading}
        />
        {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
      </Stack>

      <Button
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>

      <Stack sx={{ mt: 2, textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link component={NextLink} href="/auth/register" color="primary" underline="none">
          Register
        </Link>
      </Stack>
    </form>
  );
}
```

#### Step 10: Update Admin Layout

**File**: `app/(admin)/layout.tsx` (REPLACE entire file)

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// @project
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/Loader';

const AdminLayout = dynamic(() => import('@/layouts/AdminLayout'));

/***************************  LAYOUT - ADMIN WITH AUTH CHECK  ***************************/

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
```

---

### Phase 8: Create Error Page (Optional)

#### Step 11: Create Auth Error Page

**File**: `app/auth/error/page.tsx` (CREATE NEW FILE)

```typescript
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
```

---

### Phase 9: Create API Wrapper (Optional)

#### Step 12: API Client with Session

**File**: `utils/api/client.ts` (CREATE NEW FILE)

```typescript
import { getSession } from 'next-auth/react';

/***************************  API CLIENT WITH NEXTAUTH SESSION  ***************************/

interface FetchOptions extends RequestInit {
  includeCredentials?: boolean;
}

/**
 * Fetch wrapper that automatically includes NextAuth session
 * @example
 * const response = await apiFetch('/api/users');
 * const data = await response.json();
 */
export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { includeCredentials = true, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});
  headers.set('Content-Type', 'application/json');

  // Get current session and add to request (optional)
  if (includeCredentials && typeof window !== 'undefined') {
    const session = await getSession();
    if (session?.user) {
      // Optionally add user info to headers
      // This is just for reference - NextAuth handles auth via cookies
    }
  }

  let response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: includeCredentials ? 'include' : 'omit'
  });

  // If unauthorized, user is logged out by NextAuth middleware
  if (response.status === 401) {
    // NextAuth will automatically redirect to login
    throw new Error('Unauthorized - please log in again');
  }

  return response;
}
```

---

## ✅ Installation Checklist

```
SETUP & INSTALLATION
├─ [x] Install next-auth: pnpm add next-auth
├─ [x] Generate secret: openssl rand -base64 32
├─ [x] Create .env.local with NEXTAUTH_SECRET

PHASE 2: CONFIGURATION
├─ [x] Create app/api/auth/[...nextauth]/route.ts
├─ [x] Configure auth options with CredentialsProvider
├─ [x] Setup JWT callbacks

PHASE 3: TYPES
├─ [x] Create types/next-auth.d.ts
├─ [x] Extend Session and User types

PHASE 4: PROVIDER SETUP
├─ [x] Update app/ProviderWrapper.tsx
├─ [x] Add SessionProvider wrapper
├─ [x] Verify all providers in correct order

PHASE 5: HOOKS
├─ [x] Create hooks/useAuth.ts
├─ [x] Export useAuth function
├─ [x] Test in component

PHASE 6: MIDDLEWARE
├─ [x] Create middleware.ts at project root
├─ [x] Setup route protection with withAuth
├─ [x] Configure matcher for protected routes

PHASE 7: COMPONENTS
├─ [x] Update sections/auth/AuthLogin.tsx
├─ [x] Update app/(admin)/layout.tsx
├─ [x] Test login flow

PHASE 8: ERROR HANDLING
├─ [x] Create app/auth/error/page.tsx
├─ [x] Add error handling in components

PHASE 9: API
├─ [x] Create utils/api/client.ts (optional)

TESTING
├─ [x] Login with valid credentials
├─ [x] Login with invalid credentials
├─ [x] Verify redirect to /dashboard
├─ [x] Verify session persistence on refresh
├─ [x] Logout and verify redirect
├─ [x] Verify protected routes
├─ [x] Check browser cookies (httpOnly)
├─ [x] Test on mobile/different device
```

---

## 🧪 Testing

### Test 1: Login Flow

```typescript
// 1. Navigate to /auth/login
// 2. Enter test credentials (email: user@example.com, password: password123)
// 3. Click "Sign In"
// 4. Should redirect to /dashboard
// 5. Session should be available via useSession()
```

### Test 2: Session Persistence

```typescript
// 1. Login to the app
// 2. Refresh the page (F5)
// 3. Should still be logged in (no redirect to login)
// 4. User data should still be available
```

### Test 3: Protected Routes

```typescript
// 1. Open new incognito window
// 2. Try to navigate to /dashboard
// 3. Should redirect to /auth/login
// 4. Try to navigate to /admin
// 5. Should redirect to /auth/login
```

### Test 4: Logout

```typescript
// 1. Click logout button
// 2. Should clear session
// 3. Should redirect to /auth/login
// 4. Session should be unavailable
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Invalid NEXTAUTH_SECRET" | Generate new secret: `openssl rand -base64 32` |
| "Session is null on client" | Wrap app with `SessionProvider` |
| "useAuth returns undefined" | Make sure to use `'use client'` directive |
| "Middleware not protecting routes" | Check matcher config in middleware.ts |
| "Login keeps redirecting" | Check authorize callback returns user object |
| "CORS error on login" | Ensure backend API_BASE_URL is correct |
| "Cookies not being sent" | Add `credentials: 'include'` in fetch options |

---

## 📂 Final File Structure

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts         # Auth handler
├── (admin)/
│   └── layout.tsx               # Updated with useAuth
├── auth/
│   ├── error/
│   │   └── page.tsx            # Error page
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
└── ProviderWrapper.tsx          # Updated with SessionProvider

hooks/
└── useAuth.ts                   # New: Auth hook

sections/
└── auth/
    └── AuthLogin.tsx            # Updated

types/
└── next-auth.d.ts              # New: Type definitions

utils/
└── api/
    └── client.ts                # New: API wrapper

middleware.ts                    # New: Route protection

.env.local                        # New: Environment variables
```

---

## 🎓 Next Steps

1. **Install and setup** (30 min)
2. **Test login flow** (15 min)
3. **Verify routes** (15 min)
4. **Add social providers** (optional)
5. **Setup database adapter** (optional)
6. **Email verification** (optional)

