// @third-party
import * as TablerIcons from '@tabler/icons-react';

interface DynamicIconProps {
  name: keyof typeof TablerIcons;
  size?: number;
  color?: string;
  stroke?: number;
}

/***************************  DYNAMIC - TABLER ICONS  ***************************/

export default function DynamicIcon({ name, size = 24, color = 'black', stroke = 2 }: DynamicIconProps) {
  // Dynamically get the icon component based on the `name` prop
  const IconComponent = TablerIcons[name] as React.ComponentType<{
    size?: number;
    color?: string;
    stroke?: number;
  }>;

  // If the provided `name` does not match any icon in TablerIcons, return null to avoid rendering errors
  if (!IconComponent) {
    return null;
  }

  return <IconComponent {...{ size, color, stroke }} />;
}
