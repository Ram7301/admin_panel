
// @style
import './globals.css';

// @mui
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

// @project
import branding from '@/branding.json';
import ProviderWrapper from './ProviderWrapper';

/***************************  METADATA - MAIN  ***************************/

// Configures the viewport settings for the application.
export const viewport = {
  userScalable: false // Disables user scaling of the viewport.
};

export const metadata = {
  title: `${branding.brandName} Admin Panel`,
  description: `${branding.brandName} Admin Panel`,
  icons:{
    icon: '/favicon.png'
  }
};

/***************************  LAYOUT - ROOT  ***************************/

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning >
      <head>
        <script src="https://fomo.codedthemes.com/pixel/gkPddwTcjNYydfr7v3FcZuToUb9ZAevo" defer data-nscript="lazyOnload"></script>
       
      </head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ProviderWrapper>{children}</ProviderWrapper>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}


