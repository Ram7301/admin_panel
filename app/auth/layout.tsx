// @next
import dynamic from 'next/dynamic';

// @project
const AuthLayout = dynamic(() => import('@/layouts/AuthLayout'));

/***************************  LAYOUT - AUTH PAGES  ***************************/

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
