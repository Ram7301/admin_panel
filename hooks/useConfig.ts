'use client';

import { use } from 'react';

// @project
import { ConfigContext, type ConfigContextType } from '@/contexts/ConfigContext';

/***************************  HOOKS - CONFIG  ***************************/

/**
 * Custom hook to access the application's configuration context.
 *
 * @throws if used outside a `ConfigProvider`.
 */
export default function useConfig(): ConfigContextType {
  const context = use(ConfigContext);

  if (!context) throw new Error('useConfig must be used inside ConfigProvider');

  return context;
}
