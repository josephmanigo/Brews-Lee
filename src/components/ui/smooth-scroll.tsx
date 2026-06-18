import { ReactLenis } from 'lenis/react';
import React, { forwardRef, HTMLAttributes } from 'react';

interface SmoothScrollProps extends HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

const SmoothScroll = forwardRef<HTMLElement, SmoothScrollProps>(({ children, ...props }, ref) => {
  return (
    <ReactLenis root>
      <main ref={ref} {...props}>
        {children}
      </main>
    </ReactLenis>
  );
});

SmoothScroll.displayName = 'SmoothScroll';

export default SmoothScroll;
