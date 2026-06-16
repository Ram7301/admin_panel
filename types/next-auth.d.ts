import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: string;
      email?: string;
      name?: string;
      image?: string;
    } & DefaultSession['user'];
    accessToken?: string;
    error?: string;
  }

  interface User {
    id?: string;
    role?: string;
    accessToken?: string;
    accessTokenExpiry?: string;
    refreshToken?: string;
    refreshTokenExpiry?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    email?: string;
    accessToken?: string;
    accessTokenExpiry?: string;
    refreshToken?: string;
    refreshTokenExpiry?: string;
    error?: string;
  }
}