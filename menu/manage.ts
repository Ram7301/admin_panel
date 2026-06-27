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
    },
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/users',
      icon: 'IconUsers',
      roles: ['Super Admin']
    },
    {
      id: 'driver-payments',
      title: 'Driver Payments',
      type: 'item',
      url: '/driver-payments',
      icon: 'IconTruck'
    }
  ]
};

export default manage;
