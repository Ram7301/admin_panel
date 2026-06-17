'use client';

import useSWR from 'swr';
import type { DriverPayment } from '@/types/driverPayment';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/***************************  HOOK - DRIVER PAYMENTS  ***************************/

export function useDriverPayments() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: DriverPayment[];
    total: number;
  }>('/api/driver-payments', fetcher);

  const createPayment = async (payment: Partial<DriverPayment>) => {
    const res = await fetch('/api/driver-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    });
    const result = await res.json();
    if (result.success) {
      mutate();
    }
    return result;
  };

  const updatePayment = async (id: number, payment: Partial<DriverPayment>) => {
    const res = await fetch(`/api/driver-payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    });
    const result = await res.json();
    if (result.success) {
      mutate();
    }
    return result;
  };

  const deletePayment = async (id: number) => {
    const res = await fetch(`/api/driver-payments/${id}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (result.success) {
      mutate();
    }
    return result;
  };

  return {
    payments: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    mutate,
    createPayment,
    updatePayment,
    deletePayment
  };
}
