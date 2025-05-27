import { siFacebook } from 'simple-icons';
import { SVGProps } from 'react';

interface FacebookIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const FacebookIcon = ({ size = 24, color = `#${siFacebook.hex}`, className, ...props }: FacebookIconProps) => (
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
    <path d={siFacebook.path} />
  </svg>
);
