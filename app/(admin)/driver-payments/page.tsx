'use client';

import dynamic from 'next/dynamic';

const DriverPaymentsSection = dynamic(
  () => import('@/sections/driver-payments/DriverPaymentsSection'),
  { ssr: false }
);

/***************************  DRIVER PAYMENTS PAGE  ***************************/

export default function DriverPaymentsPage() {
  return <DriverPaymentsSection />;
}
