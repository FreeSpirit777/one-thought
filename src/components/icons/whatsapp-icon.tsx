import { siWhatsapp } from 'simple-icons';
import { SVGProps } from 'react';

interface WhatsappIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export const WhatsappIcon = ({ size = 24, color = `#${siWhatsapp.hex}`, className, ...props }: WhatsappIconProps) => (
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
    <path d={siWhatsapp.path} />
  </svg>
);
