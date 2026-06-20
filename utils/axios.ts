'use client';

import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

/***************************  AXIOS INSTANCE  ***************************/

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

/***************************  TOKEN CACHE  ***************************/

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/** Get token from cache, only call getSession() when expired */
async function getAccessToken(): Promise<string | null> {
  const now = Date.now();

  // Return cached token if still valid (cache for 5 minutes)
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const session = await getSession();
  if (session) {
    cachedToken = (session as any).accessToken ?? null;
    // Cache for 5 minutes — NextAuth JWT callback handles refresh
    tokenExpiresAt = now + 5 * 60 * 1000;
  } else {
    cachedToken = null;
    tokenExpiresAt = 0;
  }

  return cachedToken;
}

/** Call this on logout to clear the cached token */
export function clearTokenCache() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

/***************************  REQUEST INTERCEPTOR  ***************************/

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/***************************  RESPONSE INTERCEPTOR  ***************************/

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear cache so next request fetches a fresh token
      clearTokenCache();
      console.error('⛔ Unauthorized – signing out...');
      await signOut({ redirect: true, callbackUrl: '/auth/login' });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

/***************************  SWR FETCHER  ***************************/

/** Use this as the global SWR fetcher */
export const axiosFetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);
