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
        redirect: true
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