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