'use client';

import { useEffect, type Dispatch, type SetStateAction } from 'react';

/***************************  TYPES  ***************************/

export type NavItemKind = 'group' | 'collapse' | 'item';

export interface NavItemType {
  id?: string;
  title?: string;
  type?: NavItemKind;
  icon?: string;
  url?: string;
  target?: boolean;
  disabled?: boolean;
  children?: NavItemType[];
}

type SetSelected = Dispatch<SetStateAction<string | null>>;
type SetOpen = Dispatch<SetStateAction<boolean>>;
type SetAnchorEl = Dispatch<SetStateAction<HTMLElement | null>> | undefined;

/***************************  MENU COLLAPSED - RECURSIVE FUNCTION  ***************************/

/**
 * Recursively traverses menu items to find and open the correct parent menu.
 * If a menu item matches the current pathname, it marks the corresponding menu as selected and opens it.
 */
function setParentOpenedMenu(
  items: NavItemType[],
  pathname: string,
  menuId: string | undefined,
  setSelected: SetSelected,
  setOpen: SetOpen
) {
  for (const item of items) {
    // Recursively check child menus
    if (item.children?.length) {
      setParentOpenedMenu(item.children, pathname, menuId, setSelected, setOpen);
    }

    if (item.url === pathname) {
      setSelected(menuId ?? null);
      setOpen(true);
    }
  }
}

/***************************  MENU COLLAPSED - HOOK  ***************************/

/**
 * Hook to handle menu collapse behavior based on the current route.
 * Automatically expands the parent menu of the active route item.
 */
export default function useMenuCollapse(
  menu: NavItemType,
  pathname: string,
  miniMenuOpened: boolean,
  setSelected: SetSelected,
  setOpen: SetOpen,
  setAnchorEl?: SetAnchorEl
) {
  useEffect(() => {
    setOpen(false); // Close the menu initially

    // Reset selection based on menu state
    if (!miniMenuOpened) {
      setSelected(null);
    } else {
      if (setAnchorEl) setAnchorEl(null);
    }

    // If menu has children, determine which should be opened
    if (menu.children?.length) {
      setParentOpenedMenu(menu.children, pathname, menu.id, setSelected, setOpen);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, menu.children]);
}
