// @project
import type { NavItemType } from '@/hooks/useMenuCollapse';
import manage from './manage';
import other from './other';
import pages from './pages';
import uiElements from './ui-elements';

interface MenuItems {
  items: NavItemType[];
}

/***************************  MENU ITEMS  ***************************/

const menuItems: MenuItems = {
  items: [manage, uiElements, pages, other]
};

export default menuItems;
