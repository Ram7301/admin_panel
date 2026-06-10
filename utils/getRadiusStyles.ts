/***************************  CARD RADIUS - STYLES  ***************************/

export type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

interface RadiusStyles {
  borderTopLeftRadius?: number | string;
  borderTopRightRadius?: number | string;
  borderBottomLeftRadius?: number | string;
  borderBottomRightRadius?: number | string;
  '& .MuiPaper-root': {
    borderTopLeftRadius?: number | string;
    borderTopRightRadius?: number | string;
    borderBottomLeftRadius?: number | string;
    borderBottomRightRadius?: number | string;
  };
}

export function getRadiusStyles(radius: number | string, ...corners: Corner[]): RadiusStyles {
  const borderRadiusStyles: RadiusStyles = {
    '& .MuiPaper-root': {}
  };

  corners.forEach((corner) => {
    switch (corner) {
      case 'topLeft':
        borderRadiusStyles.borderTopLeftRadius = radius;
        borderRadiusStyles['& .MuiPaper-root'] = {
          borderTopLeftRadius: radius
        };
        break;
      case 'topRight':
        borderRadiusStyles.borderTopRightRadius = radius;
        borderRadiusStyles['& .MuiPaper-root'] = {
          borderTopRightRadius: radius
        };
        break;
      case 'bottomLeft':
        borderRadiusStyles.borderBottomLeftRadius = radius;
        borderRadiusStyles['& .MuiPaper-root'] = {
          borderBottomLeftRadius: radius
        };
        break;
      case 'bottomRight':
        borderRadiusStyles.borderBottomRightRadius = radius;
        borderRadiusStyles['& .MuiPaper-root'] = {
          borderBottomRightRadius: radius
        };
        break;
      default:
        break;
    }
  });

  return borderRadiusStyles;
}
