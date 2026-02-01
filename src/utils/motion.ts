/**
 * Motion Preference Detection Utility
 * Detects and monitors the user's prefers-reduced-motion preference
 * 
 * @module motion
 * @description Provides functions to check if the user prefers reduced motion
 * and to listen for changes to this preference.
 * 
 * Validates: Requirements 7.6 - IF the user prefers reduced motion, 
 * THEN THE Website SHALL respect the prefers-reduced-motion setting
 */

/**
 * The media query string for detecting reduced motion preference
 */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Cached MediaQueryList for the reduced motion preference
 * Lazily initialized to support SSR/testing environments
 */
let mediaQueryList: MediaQueryList | null = null;

/**
 * Get or create the MediaQueryList for reduced motion detection
 * @returns MediaQueryList instance or null if not supported
 */
function getMediaQueryList(): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }
  
  if (!mediaQueryList) {
    mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  }
  
  return mediaQueryList;
}

/**
 * Check if the user prefers reduced motion
 * 
 * This function checks the `prefers-reduced-motion: reduce` media query
 * to determine if the user has indicated a preference for reduced motion
 * in their operating system or browser settings.
 * 
 * @returns {boolean} True if the user prefers reduced motion, false otherwise
 * 
 * @example
 * ```typescript
 * import { prefersReducedMotion } from './utils/motion';
 * 
 * if (prefersReducedMotion()) {
 *   // Disable or reduce animations
 *   element.classList.add('no-animation');
 * } else {
 *   // Enable full animations
 *   element.classList.add('animate');
 * }
 * ```
 */
export function prefersReducedMotion(): boolean {
  const mql = getMediaQueryList();
  return mql ? mql.matches : false;
}

/**
 * Callback type for motion preference change listeners
 */
export type MotionPreferenceCallback = (prefersReduced: boolean) => void;

/**
 * Subscribe to changes in the user's motion preference
 * 
 * This function allows you to register a callback that will be invoked
 * whenever the user's reduced motion preference changes. This can happen
 * when the user changes their system settings while the page is open.
 * 
 * @param callback - Function to call when the preference changes
 * @returns A cleanup function to unsubscribe from changes
 * 
 * @example
 * ```typescript
 * import { onMotionPreferenceChange } from './utils/motion';
 * 
 * const unsubscribe = onMotionPreferenceChange((prefersReduced) => {
 *   if (prefersReduced) {
 *     stopAllAnimations();
 *   } else {
 *     startAnimations();
 *   }
 * });
 * 
 * // Later, to stop listening:
 * unsubscribe();
 * ```
 */
export function onMotionPreferenceChange(callback: MotionPreferenceCallback): () => void {
  const mql = getMediaQueryList();
  
  if (!mql) {
    // Return a no-op cleanup function if media queries aren't supported
    return () => {};
  }
  
  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };
  
  // Use addEventListener for modern browsers (preferred)
  // addListener is deprecated but may be needed for older browsers
  if (mql.addEventListener) {
    mql.addEventListener('change', handler);
  } else if (mql.addListener) {
    // Fallback for older browsers
    mql.addListener(handler);
  }
  
  // Return cleanup function
  return () => {
    if (mql.removeEventListener) {
      mql.removeEventListener('change', handler);
    } else if (mql.removeListener) {
      // Fallback for older browsers
      mql.removeListener(handler);
    }
  };
}

/**
 * CSS class name applied to the document when reduced motion is preferred
 */
export const REDUCED_MOTION_CLASS = 'reduced-motion';

/**
 * Initialize motion preference detection and apply appropriate CSS class
 * 
 * This function checks the current motion preference and applies the
 * 'reduced-motion' class to the document element if reduced motion is
 * preferred. It also sets up a listener to update the class when the
 * preference changes.
 * 
 * @returns A cleanup function to remove the listener and class
 * 
 * @example
 * ```typescript
 * import { initMotionPreference } from './utils/motion';
 * 
 * // Initialize on page load
 * const cleanup = initMotionPreference();
 * 
 * // The document will have 'reduced-motion' class if user prefers it
 * // CSS can then use: .reduced-motion .animated { animation: none; }
 * ```
 */
export function initMotionPreference(): () => void {
  // Apply initial state
  if (prefersReducedMotion()) {
    document.documentElement.classList.add(REDUCED_MOTION_CLASS);
  }
  
  // Listen for changes
  const unsubscribe = onMotionPreferenceChange((prefersReduced) => {
    if (prefersReduced) {
      document.documentElement.classList.add(REDUCED_MOTION_CLASS);
    } else {
      document.documentElement.classList.remove(REDUCED_MOTION_CLASS);
    }
  });
  
  // Return cleanup function
  return () => {
    unsubscribe();
    document.documentElement.classList.remove(REDUCED_MOTION_CLASS);
  };
}

/**
 * Reset the cached MediaQueryList (useful for testing)
 * @internal
 */
export function _resetMediaQueryListCache(): void {
  mediaQueryList = null;
}
