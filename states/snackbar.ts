'use client';

import { useMemo } from 'react';

// @third-party
import useSWR, { mutate } from 'swr';

/***************************  TYPES  ***************************/

export interface SnackbarAnchorOrigin {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';
export type SnackbarTransition = 'Fade' | 'Grow' | 'Slide' | 'Zoom';
export type SnackbarVariant = 'default' | 'alert';

export interface SnackbarAlert {
  variant: 'filled' | 'outlined' | 'standard';
}

export interface SnackbarState {
  action: boolean | (() => void);
  open: boolean;
  message: string;
  anchorOrigin: SnackbarAnchorOrigin;
  severity: SnackbarSeverity;
  variant: SnackbarVariant;
  alert: SnackbarAlert;
  transition: SnackbarTransition;
  close: boolean;
  actionButton: boolean;
  maxStack: number;
  dense: boolean;
  iconVariant: string;
  hideIconVariant: boolean;
}

export type OpenSnackbarPayload = Partial<SnackbarState>;

const endpoints = {
  key: 'snackbar'
};

const initialState: SnackbarState = {
  action: false,
  open: false,
  message: 'Note archived',
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'right'
  },
  severity: 'success',
  variant: 'default',
  alert: {
    variant: 'filled'
  },
  transition: 'Zoom',
  close: false,
  actionButton: false,
  maxStack: 3,
  dense: false,
  iconVariant: 'useemojis',
  hideIconVariant: false
};

/***************************  STATE - SNACKBAR  ***************************/

export function useGetSnackbar() {
  const { data } = useSWR<SnackbarState>(endpoints.key, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(() => ({ snackbar: data }), [data]);

  return memoizedValue;
}

export function openSnackbar(snackbar: OpenSnackbarPayload) {
  const { action, open, message, anchorOrigin, variant, alert, transition, close, actionButton, severity } = snackbar;

  mutate<SnackbarState>(
    endpoints.key,
    (currentSnackbar) => {
      const safeSnackbar = currentSnackbar || initialState;
      return {
        ...safeSnackbar,
        action: action || initialState.action,
        open: open || initialState.open,
        message: message || initialState.message,
        anchorOrigin: anchorOrigin || initialState.anchorOrigin,
        variant: variant || initialState.variant,
        alert: { variant: alert?.variant || initialState.alert.variant },
        severity: severity || initialState.severity,
        transition: transition || initialState.transition,
        close: close || initialState.close,
        actionButton: actionButton || initialState.actionButton
      };
    },
    false
  );
}

export function closeSnackbar() {
  mutate<SnackbarState>(
    endpoints.key,
    (currentSnackbar) => {
      const safeSnackbar = currentSnackbar || initialState;
      return { ...safeSnackbar, open: false };
    },
    false
  );
}

export function handlerIncrease(maxStack: number) {
  mutate<SnackbarState>(
    endpoints.key,
    (currentSnackbar) => {
      const safeSnackbar = currentSnackbar || initialState;
      return { ...safeSnackbar, maxStack };
    },
    false
  );
}

export function handlerDense(dense: boolean) {
  mutate<SnackbarState>(
    endpoints.key,
    (currentSnackbar) => {
      const safeSnackbar = currentSnackbar || initialState;
      return { ...safeSnackbar, dense };
    },
    false
  );
}

export function handlerIconVariants(iconVariant: string) {
  mutate<SnackbarState>(
    endpoints.key,
    (currentSnackbar) => {
      const safeSnackbar = currentSnackbar || initialState;
      return { ...safeSnackbar, iconVariant, hideIconVariant: iconVariant === 'hide' };
    },
    false
  );
}
