import type { NavItemType } from '@/hooks/useMenuCollapse';

/***************************  MENU ITEMS - APPLICATIONS  ***************************/

const manage: NavItemType = {
  id: 'group-manage',
  title: 'Manage',
  icon: 'IconBrandAsana',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: 'IconLayoutGrid'
    }
  ]
};

export default manage;
