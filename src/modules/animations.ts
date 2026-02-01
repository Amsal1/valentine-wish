/**
 * Animations Module
 * Handles floating hearts animation and other visual effects
 * 
 * @module animations
 * @description Creates and manages floating heart elements that animate
 * across the screen, respecting user's reduced motion preferences.
 * 
 * Validates: Requirements 6.3 (Floating_Hearts animation in background)
 * Validates: Requirements 7.3 (Floating_Hearts animate continuously without impacting performance)
 * Validates: Requirements 7.6 (Respect prefers-reduced-motion setting)
 */

import { prefersReducedMotion, onMotionPreferenceChange } from '../utils/motion';

/**
 * Interface representing a floating heart element
 */
export interface FloatingHeart {
  element: HTMLElement;
  speed: number;
  size: number;
  startX: number;
}

/**
 * Configuration options for floating hearts animation
 */
export interface FloatingHeartsConfig {
  /** Number of hearts to create */
  count: number;
  /** Minimum animation duration in seconds */
  minDuration: number;
  /** Maximum animation duration in seconds */
  maxDuration: number;
  /** Minimum heart size in pixels */
  minSize: number;
  /** Maximum heart size in pixels */
  maxSize: number;
  /** Heart emoji characters to use */
  heartEmojis: string[];
}

/**
 * Default configuration for floating hearts
 */
const DEFAULT_CONFIG: FloatingHeartsConfig = {
  count: 30,
  minDuration: 10,
  maxDuration: 20,
  minSize: 12,
  maxSize: 28,
  heartEmojis: ['💕', '💗', '💖', '💝', '❤️', '💓', '💞'],
};

/**
 * Array to track created floating heart elements for cleanup
 */
let activeHearts: FloatingHeart[] = [];

/**
 * Cleanup function for motion preference listener
 */
let motionPreferenceCleanup: (() => void) | null = null;

/**
 * Generate a random number between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random number between min and max
 */
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Get a random heart emoji from the available options
 * @param emojis - Array of heart emoji characters
 * @returns Random heart emoji
 */
function getRandomHeart(emojis: string[]): string {
  const index = Math.floor(Math.random() * emojis.length);
  return emojis[index] ?? '❤️';
}

/**
 * Create a single floating heart element
 * @param config - Configuration options
 * @returns FloatingHeart object with element and properties
 */
export function createFloatingHeartElement(config: Partial<FloatingHeartsConfig> = {}): FloatingHeart {
  const mergedConfig: FloatingHeartsConfig = { ...DEFAULT_CONFIG, ...config };
  
  const element = document.createElement('span');
  element.className = 'floating-heart';
  element.setAttribute('aria-hidden', 'true');
  
  // Random properties
  const size = randomBetween(mergedConfig.minSize, mergedConfig.maxSize);
  const startX = randomBetween(0, 100);
  const duration = randomBetween(mergedConfig.minDuration, mergedConfig.maxDuration);
  const delay = randomBetween(0, mergedConfig.maxDuration);
  const swayAmount = randomBetween(20, 60);
  
  // Set heart emoji
  element.textContent = getRandomHeart(mergedConfig.heartEmojis);
  
  // Apply styles - use fixed positioning for full page coverage
  element.style.cssText = `
    position: fixed;
    bottom: -${size}px;
    left: ${startX}%;
    font-size: ${size}px;
    opacity: 0;
    pointer-events: none;
    animation: floatingHeartRise ${duration}s ease-in-out ${delay}s infinite;
    --sway-amount: ${swayAmount}px;
    will-change: transform, opacity;
    z-index: 1100;
  `;
  
  return {
    element,
    speed: duration,
    size,
    startX,
  };
}

/**
 * Create floating hearts animation in the specified container
 * 
 * This function generates multiple floating heart elements that animate
 * upward from the bottom of the screen with random positions, sizes,
 * and animation delays. It respects the user's reduced motion preference.
 * 
 * @param container - The HTML element to append hearts to
 * @param count - Number of hearts to create (default: 15)
 * @returns Array of created FloatingHeart objects, or empty array if reduced motion is preferred
 * 
 * @example
 * ```typescript
 * const container = document.getElementById('floating-hearts');
 * if (container) {
 *   const hearts = createFloatingHearts(container, 20);
 *   console.log(`Created ${hearts.length} floating hearts`);
 * }
 * ```
 */
export function createFloatingHearts(
  container: HTMLElement,
  count: number = DEFAULT_CONFIG.count
): FloatingHeart[] {
  // Check reduced motion preference (Requirement 7.6)
  if (prefersReducedMotion()) {
    return [];
  }
  
  // Clear any existing hearts
  clearFloatingHearts(container);
  
  const hearts: FloatingHeart[] = [];
  
  for (let i = 0; i < count; i++) {
    const heart = createFloatingHeartElement({ count });
    container.appendChild(heart.element);
    hearts.push(heart);
  }
  
  // Store reference for cleanup
  activeHearts = hearts;
  
  // Set up listener for motion preference changes
  if (!motionPreferenceCleanup) {
    motionPreferenceCleanup = onMotionPreferenceChange((prefersReduced) => {
      if (prefersReduced) {
        clearFloatingHearts(container);
      } else {
        // Re-create hearts when motion is enabled again
        createFloatingHearts(container, count);
      }
    });
  }
  
  return hearts;
}

/**
 * Clear all floating hearts from the container
 * @param container - The container element to clear hearts from
 */
export function clearFloatingHearts(container: HTMLElement): void {
  // Remove all floating heart elements
  const existingHearts = container.querySelectorAll('.floating-heart');
  existingHearts.forEach((heart) => heart.remove());
  
  // Clear the active hearts array
  activeHearts = [];
}

/**
 * Get the currently active floating hearts
 * @returns Array of active FloatingHeart objects
 */
export function getActiveHearts(): FloatingHeart[] {
  return [...activeHearts];
}

/**
 * Clean up all floating hearts and event listeners
 * Call this when unmounting or cleaning up the animation
 */
export function cleanupFloatingHearts(): void {
  // Remove motion preference listener
  if (motionPreferenceCleanup) {
    motionPreferenceCleanup();
    motionPreferenceCleanup = null;
  }
  
  // Clear active hearts array
  activeHearts = [];
}

/**
 * Initialize floating hearts animation
 * Finds the floating-hearts container and creates the animation
 * 
 * @param count - Number of hearts to create (default: 15)
 * @returns Array of created FloatingHeart objects, or empty array if container not found or reduced motion
 */
export function initFloatingHearts(count: number = DEFAULT_CONFIG.count): FloatingHeart[] {
  const container = document.getElementById('floating-hearts');
  
  if (!container) {
    console.warn('Floating hearts container (#floating-hearts) not found');
    return [];
  }
  
  return createFloatingHearts(container, count);
}

/* ============================================
   Scroll Reveal Animation
   ============================================ */

/**
 * Configuration options for scroll reveal animations
 * 
 * Validates: Requirements 7.2 - WHEN sections scroll into view, 
 * THE Website SHALL animate them with fade-in or slide-in effects
 */
export interface ScrollRevealOptions {
  /** Intersection threshold (0-1) - how much of element must be visible */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Whether to only trigger once (true) or every time element enters viewport (false) */
  once?: boolean;
}

/**
 * Default scroll reveal options
 */
const DEFAULT_SCROLL_REVEAL_OPTIONS: Required<ScrollRevealOptions> = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
  once: true,
};

/**
 * CSS class applied to elements when they become visible
 */
export const SCROLL_REVEAL_VISIBLE_CLASS = 'scroll-reveal-visible';

/**
 * CSS class for elements that should be revealed on scroll
 */
export const SCROLL_REVEAL_CLASS = 'scroll-reveal';

/**
 * Store active observers for cleanup
 */
let activeObservers: IntersectionObserver[] = [];

/**
 * Create scroll reveal animations for the given elements
 * 
 * Uses the Intersection Observer API to detect when elements enter the viewport
 * and applies the `.scroll-reveal-visible` class to trigger CSS animations.
 * Respects the user's reduced motion preference.
 * 
 * @param elements - NodeList or array of elements to observe
 * @param options - Configuration options for the scroll reveal behavior
 * @returns The IntersectionObserver instance, or null if reduced motion is preferred
 * 
 * @example
 * ```typescript
 * // Reveal all section content on scroll
 * const sections = document.querySelectorAll('.section-content');
 * const observer = createScrollReveal(sections, { threshold: 0.2 });
 * 
 * // Clean up when done
 * if (observer) {
 *   observer.disconnect();
 * }
 * ```
 * 
 * Validates: Requirements 7.2 - WHEN sections scroll into view, 
 * THE Website SHALL animate them with fade-in or slide-in effects
 */
export function createScrollReveal(
  elements: NodeListOf<Element> | Element[],
  options: ScrollRevealOptions = {}
): IntersectionObserver | null {
  // Respect reduced motion preference (Requirement 7.6)
  if (prefersReducedMotion()) {
    // Make all elements visible immediately without animation
    const elementArray = Array.from(elements);
    elementArray.forEach((element) => {
      element.classList.add(SCROLL_REVEAL_VISIBLE_CLASS);
    });
    return null;
  }

  const mergedOptions: Required<ScrollRevealOptions> = {
    ...DEFAULT_SCROLL_REVEAL_OPTIONS,
    ...options,
  };

  const observerCallback: IntersectionObserverCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Element is in viewport - add visible class
        entry.target.classList.add(SCROLL_REVEAL_VISIBLE_CLASS);
        
        // If once is true, stop observing this element
        if (mergedOptions.once) {
          observer.unobserve(entry.target);
        }
      } else if (!mergedOptions.once) {
        // Element left viewport and we're not in "once" mode - remove visible class
        entry.target.classList.remove(SCROLL_REVEAL_VISIBLE_CLASS);
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, {
    threshold: mergedOptions.threshold,
    rootMargin: mergedOptions.rootMargin,
  });

  // Observe all elements
  const elementArray = Array.from(elements);
  elementArray.forEach((element) => {
    // Ensure element has the base scroll-reveal class
    if (!element.classList.contains(SCROLL_REVEAL_CLASS)) {
      element.classList.add(SCROLL_REVEAL_CLASS);
    }
    observer.observe(element);
  });

  // Store observer for cleanup
  activeObservers.push(observer);

  return observer;
}

/**
 * Initialize scroll reveal for all elements with the scroll-reveal class
 * 
 * @param options - Configuration options for the scroll reveal behavior
 * @returns The IntersectionObserver instance, or null if no elements found or reduced motion
 */
export function initScrollReveal(options: ScrollRevealOptions = {}): IntersectionObserver | null {
  const elements = document.querySelectorAll(`.${SCROLL_REVEAL_CLASS}`);
  
  if (elements.length === 0) {
    return null;
  }
  
  return createScrollReveal(elements, options);
}

/**
 * Clean up all scroll reveal observers
 * Call this when unmounting or cleaning up the animations
 */
export function cleanupScrollReveal(): void {
  activeObservers.forEach((observer) => {
    observer.disconnect();
  });
  activeObservers = [];
}

/**
 * Get the currently active scroll reveal observers
 * @returns Array of active IntersectionObserver instances
 */
export function getActiveScrollObservers(): IntersectionObserver[] {
  return [...activeObservers];
}
