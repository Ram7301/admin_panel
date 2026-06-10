// @project
import { withAlpha } from '@/utils/colorUtils';

/***************************  UTILS - FOCUS STYLE  ***************************/

/**
 * Generate the focus-visible outline style used across interactive components.
 *
 * @param color - The base color (hex / rgb / css var) of the focused element.
 * @returns A style object with an outline/box-shadow ring.
 */
export function generateFocusStyle(color: string) {
  return {
    boxShadow: `0px 0px 0px 3px ${withAlpha(color, 0.2)}`
  };
}
