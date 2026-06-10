// @next
import { Archivo } from 'next/font/google';

/***************************  THEME CONSTANT  ***************************/

export const APP_DEFAULT_PATH = '/dashboard';

export const DRAWER_WIDTH = 254;
export const MINI_DRAWER_WIDTH = 76 + 1; // 1px - for right-side border

export const CSS_VAR_PREFIX = '';

/***************************  THEME ENUM  ***************************/

export enum Themes {
  THEME_HOSTING = 'hosting'
}

export enum ThemeMode {
  LIGHT = 'light'
}

export enum ThemeDirection {
  LTR = 'ltr'
}

export enum ThemeI18n {
  EN = 'en',
  FR = 'fr',
  RO = 'ro',
  ZH = 'zh'
}

/***************************  CONFIG  ***************************/

export interface AppConfig {
  currentTheme: Themes;
  themeDirection: ThemeDirection;
  miniDrawer: boolean;
  i18n: ThemeI18n;
}

const config: AppConfig = {
  currentTheme: Themes.THEME_HOSTING,
  themeDirection: ThemeDirection.LTR,
  miniDrawer: false,
  i18n: ThemeI18n.EN
};

export default config;

/***************************  THEME - FONT FAMILY  ***************************/

const fontArchivo = Archivo({ subsets: ['latin'], display: 'swap', weight: ['400', '500', '600', '700'] });

export const FONT_ARCHIVO = fontArchivo.style.fontFamily;
