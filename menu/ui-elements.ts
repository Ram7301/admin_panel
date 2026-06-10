import type { NavItemType } from '@/hooks/useMenuCollapse';

/***************************  MENU ITEMS - UI ELEMENTS  ***************************/

const uiElements: NavItemType = {
  id: 'group-ui-elements',
  title: 'Ui Elements',
  icon: 'IconDotsVertical',
  type: 'group',
  children: [
    {
      id: 'components',
      title: 'Components',
      type: 'collapse',
      icon: 'IconAppWindow',
      children: [
        {
          id: 'color',
          title: 'Color',
          type: 'item',
          url: '/utils/color'
        },
        {
          id: 'shadow',
          title: 'Shadow',
          type: 'item',
          url: '/utils/shadow'
        },
        {
          id: 'typography',
          title: 'Typography',
          type: 'item',
          url: '/utils/typography'
        }
      ]
    }
  ]
};

export default uiElements;
