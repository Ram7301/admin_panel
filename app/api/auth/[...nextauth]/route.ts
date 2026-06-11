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
        token.email = user.email || undefined;
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