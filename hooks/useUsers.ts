'use client';

import useSWR from 'swr';
import axiosInstance, { axiosFetcher } from '@/utils/axios';
import type { User, CreateUserInput, UpdateUserInput } from '@/types/user';

/***************************  HOOK - USERS  ***************************/

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: User[];
    message: string;
  }>('/User', axiosFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 10000,
  });

  const createUser = async (user: CreateUserInput) => {
    const res = await axiosInstance.post('/User', user);
    if (res.data.success) {
      mutate();
    }
    return res.data;
  };

  const updateUser = async (id: number, user: UpdateUserInput) => {
    const res = await axiosInstance.patch(`/User/${id}`, user);
    if (res.data.success) {
      mutate();
    }
    return res.data;
  };

  const deleteUser = async (id: number) => {
    const res = await axiosInstance.delete(`/User/${id}`);
    if (res.data.success) {
      mutate();
    }
    return res.data;
  };

  return {
    users: data?.data ?? [],
    isLoading,
    isError: !!error,
    mutate,
    createUser,
    updateUser,
    deleteUser,
  };
}
