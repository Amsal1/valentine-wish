/**
 * Hero Section Module
 * Requirements: 6.4 - Romantic welcome animation on page load
 * 
 * This module handles:
 * - Romantic welcome animation on page load
 * - Animated title with fade-in effect
 * - Interactive scroll-down indicator
 */

import { prefersReducedMotion } from '../utils/motion';

export interface HeroConfig {
  heroSelector: string;
  titleSelector: string;
  subtitleSelector: string;
  scrollIndicatorSelector: string;
  nextSectionSelector: string;
  animationDelay: number;
}

export interface HeroState {
  isAnimated: boolean;
  isVisible: boolean;
}

const defaultConfig: HeroConfig = {
  heroSelector: '#hero',
  titleSelector: '.hero-title',
  subtitleSelector: '.hero-subtitle',
  scrollIndicatorSelector: '.scroll-indicator',
  nextSectionSelector: '#reasons',
  animationDelay: 200,
};

/**
 * Creates and manages the hero section
 */
export function createHero(customConfig: Partial<HeroConfig> = {}): {
  init: () => void;
  getState: () => HeroState;
  destroy: () => void;
} {
  const config = { ...defaultConfig, ...customConfig };
  const state: HeroState = {
    isAnimated: false,
    isVisible: true,
  };

  let heroElement: HTMLElement | null = null;
  let titleElement: HTMLElement | null = null;
  let subtitleElement: HTMLElement | null = null;
  let scrollIndicator: HTMLElement | null = null;
  let scrollClickHandler: (() => void) | null = null;

  /**
   * Initializes the hero section with animations
   */
  function init(): void {
    heroElement = document.querySelector(config.heroSelector);
    if (!heroElement) {
      console.warn('Hero section not found');
      return;
    }

    titleElement = heroElement.querySelector(config.titleSelector);
    subtitleElement = heroElement.querySelector(config.subtitleSelector);
    scrollIndicator = heroElement.querySelector(config.scrollIndicatorSelector);

    // Apply entrance animations
    applyEntranceAnimations();

    // Set up scroll indicator click handler
    setupScrollIndicator();

    state.isAnimated = true;
  }

  /**
   * Applies entrance animations to hero elements
   * Respects reduced motion preference
   */
  function applyEntranceAnimations(): void {
    if (prefersReducedMotion()) {
      // For reduced motion, just ensure elements are visible
      if (titleElement) titleElement.classList.add('hero-animated');
      if (subtitleElement) subtitleElement.classList.add('hero-animated');
      if (scrollIndicator) scrollIndicator.classList.add('hero-animated');
      return;
    }

    // Stagger animations for a romantic reveal effect
    if (titleElement) {
      titleElement.classList.add('hero-animate-in');
      titleElement.style.animationDelay = '0ms';
    }

    if (subtitleElement) {
      subtitleElement.classList.add('hero-animate-in');
      subtitleElement.style.animationDelay = `${config.animationDelay}ms`;
    }

    if (scrollIndicator) {
      scrollIndicator.classList.add('hero-animate-in');
      scrollIndicator.style.animationDelay = `${config.animationDelay * 2}ms`;
    }
  }

  /**
   * Sets up the scroll indicator to scroll to the next section when clicked
   */
  function setupScrollIndicator(): void {
    if (!scrollIndicator) return;

    scrollClickHandler = () => {
      const nextSection = document.querySelector(config.nextSectionSelector);
      if (nextSection) {
        nextSection.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    };

    scrollIndicator.addEventListener('click', scrollClickHandler);
    
    // Add keyboard accessibility
    scrollIndicator.setAttribute('role', 'button');
    scrollIndicator.setAttribute('tabindex', '0');
    scrollIndicator.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollClickHandler?.();
      }
    });
  }

  /**
   * Returns the current state of the hero section
   */
  function getState(): HeroState {
    return { ...state };
  }

  /**
   * Cleans up event listeners
   */
  function destroy(): void {
    if (scrollIndicator && scrollClickHandler) {
      scrollIndicator.removeEventListener('click', scrollClickHandler);
    }
    state.isAnimated = false;
  }

  return {
    init,
    getState,
    destroy,
  };
}

/**
 * Triggers a sparkle effect on the hero title
 * Used for special occasions or interactions
 */
export function triggerTitleSparkle(titleElement: HTMLElement): void {
  if (prefersReducedMotion()) return;

  titleElement.classList.add('hero-sparkle');
  setTimeout(() => {
    titleElement.classList.remove('hero-sparkle');
  }, 1000);
}

export default createHero;
