'use client';

import { useEffect, useMemo } from 'react';

// @next
import { usePathname } from 'next/navigation';

// @third-party
import useSWR, { mutate } from 'swr';

/***************************  TYPES  ***************************/

export interface BreadcrumbItem {
  title: string;
  to?: string;
  [key: string]: unknown;
}

export interface BreadcrumbsMaster {
  activePath: string;
  data: BreadcrumbItem[];
}

const initialState: BreadcrumbsMaster = {
  activePath: '',
  data: []
};

export const endpoints = {
  key: 'api/breadcrumbs',
  master: 'master'
};

/***************************  STATE - BREADCRUMBS  ***************************/

export function useGetBreadcrumbsMaster() {
  const { data, isLoading } = useSWR<BreadcrumbsMaster>(endpoints.key + endpoints.master, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  // reset cache if currentPath doesn't match activePath
  const currentPath = usePathname();
  useEffect(() => {
    if (data && data.activePath !== currentPath) {
      mutate(endpoints.key + endpoints.master, initialState, false);
    }
  }, [currentPath, data]);

  const memoizedValue = useMemo(
    () => ({
      breadcrumbsMaster: data,
      breadcrumbsMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerBreadcrumbs(activePath: string, data: BreadcrumbItem[]) {
  mutate<BreadcrumbsMaster>(
    endpoints.key + endpoints.master,
    (currentBreadcrumbsMaster = initialState) => {
      return { ...currentBreadcrumbsMaster, activePath, data };
    },
    false
  );
}
