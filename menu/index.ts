// @project
import type { NavItemType } from '@/hooks/useMenuCollapse';
import manage from './manage';

interface MenuItems {
  items: NavItemType[];
}

/***************************  MENU ITEMS  ***************************/

const menuItems: MenuItems = {
  items: [manage]
};

export default menuItems;
