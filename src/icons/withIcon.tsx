import React, { forwardRef } from 'react';
import { cn } from '@/utils';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function withIcon(
  IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>
): React.FC<IconProps> {
  const WrappedIcon = forwardRef<SVGSVGElement, IconProps>(({ className, ...rest }, ref) => {
    //size-X is to override shadcn/ui button's behavior to force all direct SVG children to have a consistent size.
    const defaultClass = 'size-X';

    return <IconComponent ref={ref} className={cn(defaultClass, className)} {...rest} />;
  });

  return WrappedIcon;
}
