'use client';

import useSWR from 'swr';
import axiosInstance, { axiosFetcher } from '@/utils/axios';
import type { DriverPayment } from '@/types/driverPayment';

/***************************  HOOK - DRIVER PAYMENTS  ***************************/

export function useDriverPayments() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: DriverPayment[];
    message: string;
  }>('/DriverPayments', axiosFetcher, {
    revalidateOnFocus: false,      // Don't refetch when tab regains focus
    revalidateOnReconnect: false,  // Don't refetch on network reconnect
    dedupingInterval: 10000,       // Deduplicate requests within 10s
  });

  const createPayment = async (payment: Partial<DriverPayment>) => {
    const res = await axiosInstance.post('/DriverPayments', payment);
    if (res.data.success) {
      mutate();
    }
    return res.data;
  };

  const updatePayment = async (id: number, payment: Partial<DriverPayment>) => {
    const res = await axiosInstance.patch(`/DriverPayments/${id}`, payment);
    if (res.data.success) {
      mutate();
    }
    return res.data;
  };

  const deletePayment = async (id: number) => {
    const res = await axiosInstance.delete(`/DriverPayments/${id}`);
    if (res.data.success) {
      mutate();
    }
    return res.data;
  };

  return {
    payments: data?.data ?? [],
    isLoading,
    isError: !!error,
    mutate,
    createPayment,
    updatePayment,
    deletePayment
  };
}
