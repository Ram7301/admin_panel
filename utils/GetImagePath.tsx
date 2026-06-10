'use client';

// @mui
import { useColorScheme } from '@mui/material/styles';

/***************************  IMAGE - TYPES  ***************************/

export interface ImageComponentProps<T = string> {
  light: T;
  dark: T;
}

type ImageInput<T> = T | ImageComponentProps<T>;

/***************************  IMAGE - TYPE IDENTIFY ***************************/

function isImageComponentProps<T>(value: ImageInput<T>): value is ImageComponentProps<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as ImageComponentProps<T>).light !== undefined &&
    (value as ImageComponentProps<T>).dark !== undefined
  );
}

/***************************  COMMON - IMAGE PATH  ***************************/

export default function GetImagePath<T = string>(image: ImageInput<T>): T {
  const { colorScheme } = useColorScheme();

  return isImageComponentProps(image) ? image[(colorScheme as 'light' | 'dark') || 'light'] : image;
}
