'use client';

import { useMemo } from 'react';

// @third-party
import useSWR, { mutate } from 'swr';

/***************************  TYPES  ***************************/

export interface MenuMaster {
  openedItem: string;
  isDashboardDrawerOpened: boolean;
}

const initialState: MenuMaster = {
  openedItem: '',
  isDashboardDrawerOpened: false
};

export const endpoints = {
  key: 'api/menu',
  master: 'master'
};

/***************************  STATE - MENU  ***************************/

export function useGetMenuMaster() {
  const { data, isLoading } = useSWR<MenuMaster>(endpoints.key + endpoints.master, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      menuMaster: data ?? initialState,
      menuMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerDrawerOpen(isDashboardDrawerOpened: boolean) {
  mutate<MenuMaster>(
    endpoints.key + endpoints.master,
    (currentMenuMaster = initialState) => {
      return { ...currentMenuMaster, isDashboardDrawerOpened };
    },
    false
  );
}

export function handlerActiveItem(openedItem: string) {
  mutate<MenuMaster>(
    endpoints.key + endpoints.master,
    (currentMenuMaster = initialState) => {
      return { ...currentMenuMaster, openedItem };
    },
    false
  );
}
