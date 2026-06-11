# NextAuth.js Authentication Architecture

## 📋 Why NextAuth.js?

### Before (Custom JWT)
- Manual token generation and validation
- Token refresh logic
- Session management
- Cookie handling
- CSRF protection
- **~500+ lines of code**

### After (NextAuth.js)
- Built-in token generation and validation
- Automatic token refresh
- Session management
- Cookie handling
- CSRF protection included
- **~100 lines of code**

---

## 🏗️ NextAuth.js Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      NextAuth.js Flow                            │
└─────────────────────────────────────────────────────────────────┘

1. USER LOGIN
   User → /login → AuthLogin Component → signIn('credentials', {...})
                                              ↓
2. NEXTAUTH PROCESS
   signIn() → [...nextauth].ts → authorize() callback
                                     ↓
                          Verify credentials
                                     ↓
3. SESSION CREATION
   JWT created (signed with secret)
                                     ↓
                          httpOnly cookie set
                                     ↓
4. REQUEST WITH SESSION
   Browser sends cookie automatically
                                     ↓
5. SESSION VERIFICATION
   getSession() or useSession() hook
                                     ↓
   Session valid? → Continue : Redirect to login
                                     ↓
6. TOKEN REFRESH (Automatic)
   NextAuth.js handles automatically (no manual refresh needed)
                                     ↓
7. LOGOUT
   signOut() → Clear session → Redirect to login
```

---

## 🔐 Key Differences: NextAuth vs Custom JWT

| Feature | Custom JWT | NextAuth.js |
|---------|-----------|-------------|
| Token Generation | Manual | Automatic |
| Token Validation | Manual on each request | Built-in middleware |
| Token Refresh | Manual via API endpoint | Automatic & transparent |
| Session Storage | localStorage + cookie | Secure session by default |
| CSRF Protection | Must implement | Built-in |
| Session Management | Manual state | useSession() hook |
| Middleware | Create custom | Built-in |
| Logout | Manual cleanup | signOut() function |
| Multiple Providers | Must handle | Built-in support |
| Email Verification | Manual | Optional built-in |

---

## 📦 Installation & Setup

### 1. Install NextAuth.js

```bash
npm install next-auth
# or
pnpm add next-auth
```

### 2. Generate Secret Key

```bash
openssl rand -base64 32
# or use online: https://generate-secret.vercel.app/32
```

### 3. Environment Variables

**File**: `.env.local`

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# For production
# NEXTAUTH_URL=https://yourdomain.com
# NEXTAUTH_SECRET=your_production_secret

# Optional: For credentials provider
API_BASE_URL=http://localhost:5000  # Your backend URL
```

---

## 🔧 Core Implementation

### 1. NextAuth Configuration

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

      // This function is called when user submits login form
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          // Call your backend API to verify credentials
          const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const user = await response.json();

          // Return user object if authentication successful
          // This will be available in session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.avatar
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      }
    })
  ],

  // Configure JWT tokens
  session: {
    strategy: 'jwt', // Use JWT instead of database sessions
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  callbacks: {
    // Called when JWT is created or updated
    async jwt({ token, user }) {
      if (user) {
        // Add user info to token on first login
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },

    // Called when session is requested
    async session({ session, token }) {
      // Add token data to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
      }
      return session;
    },

    // Redirect after signin
    async redirect({ url, baseUrl }) {
      // Only allow redirects to same origin
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return baseUrl + '/dashboard';
    }
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },

  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.email);
    },
    async signOut() {
      console.log('User signed out');
    }
  },

  // Security settings
  useSecureCookies: process.env.NODE_ENV === 'production',
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## 🪝 useSession Hook

**File**: `hooks/useAuth.ts`

```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';
import type { Session } from 'next-auth';

/***************************  USE AUTH HOOK  ***************************/

export interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Session['user'] | null;
}

export function useAuth() {
  const { data: session, status } = useSession();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false // Don't auto redirect, handle manually
      });

      if (!result?.ok) {
        throw new Error(result?.error || 'Login failed');
      }

      return result;
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  }, []);

  return {
    session,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user: session?.user || null,
    login,
    logout,
    status // 'authenticated' | 'unauthenticated' | 'loading'
  };
}
```

---

## 🔐 SessionProvider Setup

**File**: `app/ProviderWrapper.tsx` (UPDATED)

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

## 📝 Updated Login Component

**File**: `sections/auth/AuthLogin.tsx` (UPDATED)

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
      await login(formData.email, formData.password);
      // Redirect happens automatically in useAuth hook or NextAuth
      router.push('/dashboard');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const commonIconProps = { size: 16, color: theme.vars.palette.grey[700] };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Error Alert */}
      {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}

      {/* Email Field */}
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

      {/* Password Field */}
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

      {/* Submit Button */}
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

      {/* Register Link */}
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

---

## 🛡️ Protected Layout Component

**File**: `app/(admin)/layout.tsx` (UPDATED)

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
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loader while checking authentication
  if (isLoading) {
    return <Loader />;
  }

  // Render admin layout only if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
```

---

## 🔌 Middleware for Route Protection

**File**: `middleware.ts` (at project root)

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

/***************************  NEXTAUTH MIDDLEWARE  ***************************/

export default withAuth(
  function middleware(request: NextRequest) {
    // Get the token from the request
    const token = request.nextauth.token;

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith('/auth/login') && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/(admin)')) {
          return !!token; // Must have token to access
        }

        // Allow all other routes
        return true;
      }
    },
    pages: {
      signIn: '/auth/login'
    }
  }
);

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

## 👤 Component: User Profile Header

**File**: `components/header/UserMenu.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// @mui
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// @project
import { useAuth } from '@/hooks/useAuth';

// @icons
import { IconLogout, IconSettings } from '@tabler/icons-react';

/***************************  USER MENU  ***************************/

export default function UserMenu() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  const handleProfile = () => {
    handleClose();
    router.push('/profile');
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <Avatar sx={{ width: 32, height: 32 }}>
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">{user.name}</Typography>
        </MenuItem>

        <MenuItem disabled>
          <Typography variant="caption" color="textSecondary">
            {user.email}
          </Typography>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <IconSettings size={18} />
          </ListItemIcon>
          Profile Settings
        </MenuItem>

        <MenuItem onClick={handleLogout} disabled={isLoading}>
          <ListItemIcon>
            <IconLogout size={18} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
```

---

## 🔄 API Interceptor with NextAuth

**File**: `utils/api/client.ts`

```typescript
/***************************  API CLIENT WITH NEXTAUTH  ***************************/

import { getSession } from 'next-auth/react';

interface FetchOptions extends RequestInit {
  includeCredentials?: boolean;
}

export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { includeCredentials = true, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});
  headers.set('Content-Type', 'application/json');

  // Get session and add token to requests (optional, NextAuth sends cookie)
  if (includeCredentials && typeof window !== 'undefined') {
    const session = await getSession();
    if (session?.accessToken) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: includeCredentials ? 'include' : 'omit'
  });

  // NextAuth handles 401 responses with automatic session refresh
  if (response.status === 401) {
    // Session will be automatically refreshed by NextAuth
    // If this fails, user will be logged out
    throw new Error('Unauthorized - please log in again');
  }

  return response;
}

/***************************  USAGE EXAMPLE  ***************************/

// const response = await apiFetch('/api/users');
// const data = await response.json();
```

---

## 🌐 Type Definitions

**File**: `types/next-auth.d.ts`

```typescript
import type { DefaultSession } from 'next-auth';

/***************************  EXTEND NEXTAUTH TYPES  ***************************/

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'user' | 'moderator';
      email: string;
      name: string;
      image?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'admin' | 'user' | 'moderator';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'user' | 'moderator';
    email: string;
  }
}
```

---

## 📊 NextAuth.js Flow Comparison

### Custom JWT Approach
```
Login → Generate JWT → Store in localStorage + Cookie
        ↓
Request → Check token in localStorage
         ↓
         If expired → Call refresh endpoint
         ↓
         Get new token → Retry request
```

### NextAuth.js Approach
```
Login → Generate JWT → Store in secure httpOnly cookie
        ↓
Request → NextAuth checks session automatically
         ↓
         If expired → Refresh token automatically (transparent)
         ↓
         Session valid → Continue
```

---

## 🛠️ Advanced: Custom Database Session Store

If you want to use database sessions instead of JWT:

**File**: `app/api/auth/[...nextauth]/route.ts` (Alternative)

```typescript
import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';

export const authOptions: NextAuthOptions = {
  // Use database adapter instead of JWT
  adapter: MongoDBAdapter(clientPromise),

  session: {
    strategy: 'database' // Use database sessions
  },

  providers: [
    // Your providers...
  ],

  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    }
  }
};
```

---

## 🔒 Security Features (Built-in)

### 1. CSRF Protection
- ✅ Automatic CSRF token validation
- ✅ Double-submit cookie pattern
- ✅ SameSite cookie attribute

### 2. Secure Cookies
- ✅ httpOnly (JavaScript cannot access)
- ✅ Secure (HTTPS only in production)
- ✅ SameSite=Lax (default)

### 3. Session Security
- ✅ Session cookies have short maxAge
- ✅ JWT tokens are signed
- ✅ Token rotation on refresh

### 4. XSS Protection
- ✅ Refresh token in httpOnly cookie (cannot be stolen via XSS)
- ✅ Access token only in memory
- ✅ No sensitive data in localStorage

---

## 📋 Environment Setup Checklist

- [ ] `npm install next-auth`
- [ ] Generate secret with `openssl rand -base64 32`
- [ ] Create `.env.local` with NEXTAUTH_SECRET and NEXTAUTH_URL
- [ ] Create `app/api/auth/[...nextauth]/route.ts`
- [ ] Update `app/ProviderWrapper.tsx` to include SessionProvider
- [ ] Create custom `hooks/useAuth.ts`
- [ ] Create `middleware.ts` for route protection
- [ ] Create `types/next-auth.d.ts` for types
- [ ] Update login component to use `useAuth()` hook
- [ ] Update admin layout to check session
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test protected routes

---

## 🚀 Comparison Table

| Feature | Lines of Code | Implementation Time |
|---------|---------------|---------------------|
| **Custom JWT** | 500+ | 2-3 days |
| **NextAuth.js** | 100-150 | 2-4 hours |
| **Maintenance** | High | Low |
| **Security Issues** | Possible | Minimal (battle-tested) |

---

## 📚 Key Benefits

1. **Simplicity**: Less code to write and maintain
2. **Security**: Battle-tested by thousands of projects
3. **Features**: Built-in email verification, multiple providers
4. **Performance**: Optimized session handling
5. **Developer Experience**: Great TypeScript support
6. **Community**: Large community and great docs

---

## 🔗 Additional Resources

- **Official Docs**: https://next-auth.js.org
- **Providers**: Email, Google, GitHub, Discord, etc.
- **Database Adapters**: MongoDB, PostgreSQL, Prisma, etc.
- **Examples**: https://github.com/nextauthjs/next-auth-example

