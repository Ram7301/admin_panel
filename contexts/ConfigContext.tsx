'use client';

import { createContext, useMemo, type ReactNode, type Dispatch, type SetStateAction } from 'react';

// @project
import config, { type AppConfig } from '@/config';
import useLocalStorage from '@/hooks/useLocalStorage';

/***************************  CONFIG CONTEXT  ***************************/

export interface ConfigContextType {
  state: AppConfig;
  setState: Dispatch<SetStateAction<AppConfig>>;
  setField: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
  resetState: () => void;
}

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

/***************************  CONFIG PROVIDER  ***************************/

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const { state, setState, setField, resetState } = useLocalStorage<AppConfig>(
    'sass-able-react-mui-admin-next-free',
    config
  );

  const memoizedValue = useMemo<ConfigContextType>(
    () => ({ state, setState, setField, resetState }),
    [state, setField, setState, resetState]
  );

  return <ConfigContext.Provider value={memoizedValue}>{children}</ConfigContext.Provider>;
}
