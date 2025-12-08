import { type ClassValue, clsx } from 'clsx';

/**
 * Combines class names using clsx.
 * Note: Does not use tailwind-merge to keep bundle size small.
 * When multiple classes are provided, later classes override earlier ones via CSS specificity.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
