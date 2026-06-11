'use client';

// @mui
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import { SessionProvider } from 'next-auth/react';

// @project
import Notistack from '@/components/third-party/Notistack';
import { ConfigProvider } from '@/contexts/ConfigContext';
import ThemeCustomization from '@/themes';

/***************************  LAYOUT - CONFIG, THEME  ***************************/

export default function ProviderWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <InitColorSchemeScript attribute="data-color-scheme" defaultMode="light" />
      <SessionProvider>
        <ConfigProvider>
          <ThemeCustomization>
            <Notistack>{children}</Notistack>
          </ThemeCustomization>
        </ConfigProvider>
      </SessionProvider>
    </>
  );
}

