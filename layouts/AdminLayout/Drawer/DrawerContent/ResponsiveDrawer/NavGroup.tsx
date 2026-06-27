'use client';

// @mui
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

// @next-auth
import { useSession } from 'next-auth/react';

// @project
import NavCollapse from './NavCollapse';
import NavItem from './NavItem';
import type { NavItemType } from '@/hooks/useMenuCollapse';

interface NavGroupProps {
  item: NavItemType;
}

/***************************  RESPONSIVE DRAWER - GROUP  ***************************/

export default function NavGroup({ item }: NavGroupProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? '';

  const renderNavItem = (menuItem: NavItemType) => {
    // Role-based filtering: skip items the user doesn't have access to
    if (menuItem.roles && menuItem.roles.length > 0) {
      if (!menuItem.roles.includes(userRole)) {
        return null;
      }
    }

    // Render items based on the type
    switch (menuItem.type) {
      case 'collapse':
        return <NavCollapse key={menuItem.id} item={menuItem} />;
      case 'item':
        return <NavItem key={menuItem.id} item={menuItem} />;
      default:
        return (
          <Typography key={menuItem.id} variant="h6" color="error" align="center">
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  };

  return (
    <List
      component="div"
      subheader={
        <Typography component="div" variant="caption" sx={{ mb: 0.75, color: 'grey.700' }}>
          {item.title}
        </Typography>
      }
      sx={{ '&:not(:first-of-type)': { pt: 1, borderTop: '1px solid', borderColor: 'divider' } }}
    >
      {item.children?.map((menuItem) => renderNavItem(menuItem))}
    </List>
  );
}

