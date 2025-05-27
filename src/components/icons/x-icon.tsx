import { siX } from 'simple-icons';
import { SVGProps } from 'react';

interface XIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const XIcon = ({ size = 24, color = `#${siX.hex}`, className, ...props }: XIconProps) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>X</title>
    <path d={siX.path} />
  </svg>
);