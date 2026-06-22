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
          const response = await fetch(`${process.env.API_BASE_URL}/Auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.message || 'Invalid credentials');
          }

          const userData = result.data;
 

          return {
            id: String(userData.userId),
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`.trim(),
            role: userData.role,
            accessToken: userData.accessToken,
            accessTokenExpiry: userData.accessTokenExpiry,
            refreshToken: userData.refreshToken,
            refreshTokenExpiry: userData.refreshTokenExpiry
          };
        } catch (error) {
          console.log('❌ Auth error:', error);
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
        
      }
    })
  ],

  // JWT Configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  // Callbacks
  callbacks: {
    // Called whenever JWT is created or updated
    async jwt({ token, user }) {
      // Initial sign-in: copy user data into the token
      if (user) {
        token.id = user.id;
        token.email = user.email || undefined;
        token.name = user.name;
        token.role = (user as any).role || 'User';
        token.accessToken = (user as any).accessToken;
        token.accessTokenExpiry = (user as any).accessTokenExpiry;
        token.refreshToken = (user as any).refreshToken;
        token.refreshTokenExpiry = (user as any).refreshTokenExpiry;
      }
  
      // Check if access token has expired and refresh it
      if (token.accessTokenExpiry) {
        const expiryTime = new Date(token.accessTokenExpiry as string).getTime();
        const now = Date.now();

        // If token expires within 60 seconds, refresh it
        if (now >= expiryTime - 60 * 1000) {
          console.log('🔄 Access token expired, refreshing...');
          try {
            const response = await fetch(`${process.env.API_BASE_URL}/Auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                refreshToken: token.refreshToken
              })
            });

            const result = await response.json();

            if (response.ok && result.success) {
              const refreshedData = result.data;

              token.accessToken = refreshedData.accessToken;
              token.accessTokenExpiry = refreshedData.accessTokenExpiry;
              token.refreshToken = refreshedData.refreshToken;
              token.refreshTokenExpiry = refreshedData.refreshTokenExpiry;
              token.error = undefined;
            } else {
              token.error = 'RefreshTokenError';
            }
          } catch (error) {
            token.error = 'RefreshTokenError';
          }
        }
      }


      return token;
    },

    // Called when session is requested (useSession hook)
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      // Expose accessToken and error to the client session
      (session as any).accessToken = token.accessToken;
      (session as any).error = token.error;
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
  useSecureCookies: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };