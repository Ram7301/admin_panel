# NextAuth.js Advanced Features

## 🌍 Adding Social Providers

### Google OAuth Setup

#### Step 1: Create Google OAuth App
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

#### Step 2: Add to Environment Variables

**File**: `.env.local`

```env
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
```

#### Step 3: Add Google Provider

**File**: `app/api/auth/[...nextauth]/route.ts`

```typescript
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
      allowDangerousEmailAccountLinking: true
    }),
    // Your other providers...
  ],
  // ... rest of config
};
```

#### Step 4: Update Login Component

```typescript
// In AuthLogin.tsx
import { signIn } from 'next-auth/react';

// Add button for Google login
<Button
  fullWidth
  variant="outlined"
  sx={{ mt: 2 }}
  onClick={() => signIn('google', { redirect: true, callbackUrl: '/dashboard' })}
>
  Sign in with Google
</Button>
```

---

### GitHub OAuth Setup

#### Step 1: Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Application name: Your App Name
4. Authorization callback URL:
   - Development: `http://localhost:3000/api/auth/callback/github`
   - Production: `https://yourdomain.com/api/auth/callback/github`
5. Copy Client ID and Client Secret

#### Step 2: Add to Environment Variables

```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

#### Step 3: Add GitHub Provider

```typescript
import GithubProvider from 'next-auth/providers/github';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || ''
    }),
    // ... other providers
  ],
};
```

---

### Multiple Providers Setup

**File**: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials (username/password)
    CredentialsProvider({
      // ... your existing config
    }),

    // Google
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || ''
    }),

    // GitHub
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || ''
    }),

    // Email Magic Link
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'user';
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).provider = token.provider;
      }
      return session;
    }
  }
};
```

---

### Social Login UI Component

**File**: `components/SocialLoginButtons.tsx`

```typescript
'use client';

import { signIn } from 'next-auth/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// @icons
import { IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';

/***************************  SOCIAL LOGIN BUTTONS  ***************************/

export default function SocialLoginButtons() {
  const handleSocialLogin = (provider: string) => {
    signIn(provider, {
      redirect: true,
      callbackUrl: '/dashboard'
    });
  };

  return (
    <Stack sx={{ gap: 2, my: 3 }}>
      <Stack sx={{ position: 'relative', textAlign: 'center' }}>
        <Divider>
          <Typography variant="caption" color="textSecondary">
            OR
          </Typography>
        </Divider>
      </Stack>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<IconBrandGoogle size={18} />}
        onClick={() => handleSocialLogin('google')}
      >
        Continue with Google
      </Button>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<IconBrandGithub size={18} />}
        onClick={() => handleSocialLogin('github')}
      >
        Continue with GitHub
      </Button>
    </Stack>
  );
}
```

Usage in login component:
```typescript
// In AuthLogin.tsx
<SocialLoginButtons />
```

---

## 📧 Email Verification

### Setup Email Provider

**File**: `app/api/auth/[...nextauth]/route.ts`

```typescript
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM // e.g., 'noreply@example.com'
    })
  ],

  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error'
  }
};
```

**Environment Variables**:
```env
# Gmail Example
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@example.com

# Or use SendGrid, Mailgun, etc.
```

**Verify Request Page**:

```typescript
// app/auth/verify-request/page.tsx
'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

// @project
import { NextLink } from '@/components/routes';

export default function VerifyRequest() {
  return (
    <Container maxWidth="sm">
      <Stack sx={{ py: 10, gap: 3 }}>
        <Alert severity="success">
          Check your email! We've sent you a magic link to sign in.
        </Alert>

        <Typography variant="h5">Verification Email Sent</Typography>

        <Typography variant="body1">
          We've sent a sign-in email to your address. Click the link in the email to complete your login.
        </Typography>

        <Typography variant="body2" color="textSecondary">
          The link will expire in 24 hours.
        </Typography>

        <Button
          fullWidth
          variant="contained"
          component={NextLink}
          href="/auth/signin"
        >
          Back to Sign In
        </Button>
      </Stack>
    </Container>
  );
}
```

---

## 💾 Database Sessions (Prisma)

### Setup with Prisma

#### Step 1: Install Prisma Adapter

```bash
pnpm add @auth/prisma-adapter
pnpm add @prisma/client
pnpm add -D prisma
```

#### Step 2: Initialize Prisma

```bash
npx prisma init
```

#### Step 3: Configure Database

**File**: `.env.local`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

#### Step 4: Update Prisma Schema

**File**: `prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          String?   @default("user")
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

#### Step 5: Run Migrations

```bash
npx prisma migrate dev --name init
```

#### Step 6: Update NextAuth Configuration

```typescript
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Validate against database
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email }
        });

        if (user && await validatePassword(credentials?.password, user.passwordHash)) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        }

        throw new Error('Invalid credentials');
      }
    })
  ],

  session: {
    strategy: 'database' // Use database sessions now
  },

  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      (session.user as any).role = user.role;
      return session;
    }
  }
};
```

---

## 🔒 Custom Authorization & Permissions

### Role-Based Access Control

**File**: `app/api/auth/[...nextauth]/route.ts`

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = (user as any).role;
      token.permissions = (user as any).permissions || [];
    }
    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).permissions = token.permissions;
    }
    return session;
  }
}
```

### Role-Protected Component

**File**: `components/ProtectedByRole.tsx`

```typescript
'use client';

import { useSession } from 'next-auth/react';
import Alert from '@mui/material/Alert';

interface ProtectedByRoleProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
}

export function ProtectedByRole({
  children,
  requiredRole,
  requiredPermissions = []
}: ProtectedByRoleProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const userRole = (session?.user as any)?.role;
  const userPermissions = (session?.user as any)?.permissions || [];

  // Check role
  if (requiredRole && userRole !== requiredRole) {
    return <Alert severity="error">You don't have permission to view this content.</Alert>;
  }

  // Check permissions
  const hasAllPermissions = requiredPermissions.every((perm) =>
    userPermissions.includes(perm)
  );

  if (requiredPermissions.length > 0 && !hasAllPermissions) {
    return <Alert severity="error">Insufficient permissions.</Alert>;
  }

  return <>{children}</>;
}
```

**Usage**:

```typescript
// Only admins can see this
<ProtectedByRole requiredRole="admin">
  <AdminPanel />
</ProtectedByRole>

// Need multiple permissions
<ProtectedByRole requiredPermissions={['view_users', 'edit_users']}>
  <UserManagement />
</ProtectedByRole>
```

---

## 🔄 Logout & Session Management

### Enhanced Logout with Cleanup

```typescript
// In hooks/useAuth.ts
const logout = useCallback(async () => {
  // Optional: Clear any client-side data
  localStorage.removeItem('preference');
  sessionStorage.clear();

  // Sign out from NextAuth
  await signOut({
    redirect: true,
    callbackUrl: '/auth/login'
  });
}, []);
```

### Revoke Session Endpoint

**File**: `app/api/auth/sessions/revoke/route.ts`

```typescript
import { getSession } from 'next-auth/react';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getSession({ req });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete all sessions for this user
  await prisma.session.deleteMany({
    where: { userId: (session.user as any).id }
  });

  return NextResponse.json({ message: 'All sessions revoked' });
}
```

---

## 📱 Callback URL Handling

### Redirect After Login

```typescript
// In AuthLogin.tsx or login button
const handleLogin = async () => {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false
  });

  if (result?.ok) {
    // Get redirect URL from query params
    const redirectUrl = searchParams.get('callbackUrl') || '/dashboard';
    router.push(redirectUrl);
  }
};
```

### Save Redirect Target

```typescript
// Store where user wants to go after login
const handleProtectedAction = () => {
  // User not authenticated, redirect to login with callback
  signIn('credentials', {
    callbackUrl: '/admin/users' // Where to go after login
  });
};
```

---

## 🧪 Testing Authentication

### Test Utils

**File**: `utils/test/auth.ts`

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getTestSession(userId: string) {
  return {
    user: {
      id: userId,
      email: `user${userId}@test.com`,
      name: 'Test User',
      role: 'admin'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

export async function mockGetServerSession() {
  return getServerSession(authOptions);
}
```

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import AdminPanel from '@/components/AdminPanel';
import { getTestSession } from '@/utils/test/auth';

describe('AdminPanel', () => {
  it('renders for authenticated users', async () => {
    const session = await getTestSession('user123');

    render(
      <SessionProvider session={session}>
        <AdminPanel />
      </SessionProvider>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
});
```

---

## 📊 Session Monitoring

### Track Active Sessions

**File**: `app/api/sessions/active/route.ts`

```typescript
import { getSession } from 'next-auth/react';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSession({ req });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    where: { userId: (session.user as any).id },
    select: {
      sessionToken: true,
      expires: true,
      createdAt: true
    }
  });

  return NextResponse.json({
    totalSessions: sessions.length,
    sessions,
    currentSessionExpires: session.expires
  });
}
```

---

## 🔐 API Route Protection

### Protected API Endpoint

```typescript
// app/api/admin/users/route.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = (session.user as any)?.role;

  if (userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get users logic here
  const users = await getUsers();
  return NextResponse.json(users);
}
```

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Configure social provider credentials (if using)
- [ ] Setup email provider (if using)
- [ ] Configure database (if using database sessions)
- [ ] Update CORS/CSP headers if needed
- [ ] Test authentication flow on production
- [ ] Setup monitoring/logging for auth events
- [ ] Create database backups strategy
- [ ] Document authentication setup

---

## 📚 Additional Resources

- [NextAuth.js Providers](https://next-auth.js.org/providers/)
- [NextAuth.js Adapters](https://next-auth.js.org/adapters/overview)
- [NextAuth.js Security](https://next-auth.js.org/security)
- [NextAuth.js Callbacks](https://next-auth.js.org/configuration/callbacks)
- [NextAuth.js Events](https://next-auth.js.org/configuration/events)

