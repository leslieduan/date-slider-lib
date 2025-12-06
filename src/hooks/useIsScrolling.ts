import { useEffect, useRef, useState } from 'react';

type Target = Window | HTMLElement | null;

export function useIsScrolling(target: Target, delay = 150) {
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!target) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element: any = target === window ? document : target;

    function onScroll() {
      setIsScrolling(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, delay);
    }

    element.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', onScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [target, delay]);

  return isScrolling;
}
