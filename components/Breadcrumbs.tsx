'use client';

import { Activity, useEffect, useState } from 'react';

// @next
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// @mui
import { useTheme } from '@mui/material/styles';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';

// @project
import { APP_DEFAULT_PATH } from '@/config';
import menuItems from '@/menu';
import { useGetBreadcrumbsMaster, type BreadcrumbItem } from '@/states/breadcrumbs';
import { generateFocusStyle } from '@/utils/generateFocusStyle';
import type { NavItemType } from '@/hooks/useMenuCollapse';

// @assets
import { IconChevronRight } from '@tabler/icons-react';

// @data
const homeBreadcrumb: BreadcrumbItem = { title: 'Home', url: APP_DEFAULT_PATH };

/***************************  BREADCRUMBS  ***************************/

export default function Breadcrumbs() {
  const theme = useTheme();
  const location = usePathname();
  const { breadcrumbsMaster } = useGetBreadcrumbsMaster();

  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);
  const [activeItem, setActiveItem] = useState<BreadcrumbItem | undefined>();

  useEffect(() => {
    if (breadcrumbsMaster && breadcrumbsMaster.data?.length && breadcrumbsMaster.activePath === location) {
      dataHandler(breadcrumbsMaster.data);
    } else {
      for (const menu of menuItems?.items ?? []) {
        if (menu.type && menu.type === 'group') {
          const matchedParents = findParentElements(menu.children || [], location);
          dataHandler((matchedParents as BreadcrumbItem[]) || []);
          if (matchedParents) break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breadcrumbsMaster, location]);

  const dataHandler = (data: BreadcrumbItem[]) => {
    const active = data.at(-1);
    const linkItems = data.slice(0, -1);
    if (active && active.url !== homeBreadcrumb.url) {
      linkItems.unshift(homeBreadcrumb);
    }
    setActiveItem(active);
    setBreadcrumbItems(linkItems);
  };

  function findParentElements(
    navItems: NavItemType[],
    targetUrl: string,
    parents: NavItemType[] = []
  ): NavItemType[] | null {
    for (const item of navItems) {
      const newParents = [...parents, item];

      if (item.url && targetUrl.includes(item.url)) {
        return newParents;
      }

      if (item.children) {
        const result = findParentElements(item.children, targetUrl, newParents);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  return (
    <MuiBreadcrumbs aria-label="breadcrumb" separator={<IconChevronRight size={16} />}>
      {breadcrumbItems.length > 0 &&
        breadcrumbItems.map((item, index) => (
          <Typography
            {...(item.url ? { component: Link as React.ElementType, href: item.url } : {})}
            variant="body2"
            sx={{
              p: 0.5,
              color: 'grey.700',
              textDecoration: 'none',
              ...(item.url ? { cursor: 'pointer', ':hover': { color: 'primary.main' } } : {}),
              ':focus-visible': {
                outline: 'none',
                borderRadius: 0.25,
                ...generateFocusStyle(theme.vars.palette.primary.main)
              }
            }}
            key={index}
          >
            {item.title}
          </Typography>
        ))}
      <Activity mode={activeItem ? 'visible' : 'hidden'}>
        <Typography variant="body2" sx={{ p: 0.5 }}>
          {activeItem?.title}
        </Typography>
      </Activity>
    </MuiBreadcrumbs>
  );
}
