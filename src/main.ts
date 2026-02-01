/**
 * Valentine Love Website - Main Entry Point
 * 
 * @module main
 * @description Initializes all modules and sets up the website
 * 
 * Validates: Requirements 6.4, 8.1
 * - 6.4: WHEN the page loads, THE Website SHALL present a romantic welcome animation
 * - 8.1: THE Website SHALL be built using Vite as the build tool with vanilla TypeScript
 */

import './style.css';

// Import all modules
import { initNavigation, Navigation } from './modules/navigation';
import { createHero } from './modules/hero';
import { createReasons } from './modules/reasons';
import { createGallery } from './modules/gallery';
import { createLoveGame } from './modules/love-game';
import { 
  initFloatingHearts, 
  initScrollReveal, 
  cleanupFloatingHearts, 
  cleanupScrollReveal 
} from './modules/animations';
import { siteConfig } from './config';

/**
 * Applies config values to HTML elements with data-config attributes
 * This allows the HTML to be updated dynamically from the config file
 */
function applyConfigToHTML(): void {
  // Update page title
  document.title = siteConfig.hero.title.replace(/💕/g, '').trim() + ' 💕';
  
  // Update elements with data-config attributes
  const elements = document.querySelectorAll('[data-config]');
  
  elements.forEach((element) => {
    const configPath = element.getAttribute('data-config');
    if (!configPath) return;
    
    // Parse the config path (e.g., "hero.title" -> siteConfig.hero.title)
    const value = getNestedValue(siteConfig as unknown as Record<string, unknown>, configPath);
    
    if (value !== undefined && typeof value === 'string') {
      element.textContent = value;
    }
  });
}

/**
 * Gets a nested value from an object using dot notation
 * @param obj - The object to get the value from
 * @param path - The dot-notation path (e.g., "hero.title")
 * @returns The value at the path, or undefined if not found
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Module instances for cleanup and access
 */
interface AppModules {
  navigation: Navigation | null;
  hero: ReturnType<typeof createHero> | null;
  reasons: ReturnType<typeof createReasons> | null;
  gallery: ReturnType<typeof createGallery> | null;
  loveGame: ReturnType<typeof createLoveGame> | null;
}

/**
 * Store module instances for potential cleanup
 */
const modules: AppModules = {
  navigation: null,
  hero: null,
  reasons: null,
  gallery: null,
  loveGame: null,
};

/**
 * Initialize all website modules in the correct order
 * 
 * Initialization order:
 * 1. Navigation - for smooth scrolling and menu functionality
 * 2. Hero - for welcome animation
 * 3. Reasons - for reason cards display
 * 4. Gallery - for photo reveal functionality
 * 5. Love Game - for interactive game
 * 6. Floating Hearts - background animation
 * 7. Scroll Reveal - section animations
 */
function initializeModules(): void {
  // 0. Apply config values to HTML elements
  // Updates all elements with data-config attributes from siteConfig
  applyConfigToHTML();
  
  // 1. Initialize Navigation
  // Handles hamburger menu, smooth scrolling, and active section detection
  modules.navigation = initNavigation();
  
  // 2. Initialize Hero Section
  // Creates romantic welcome animation on page load
  modules.hero = createHero();
  modules.hero.init();
  
  // 3. Initialize Reasons Section
  // Displays romantic reason cards with hover effects
  modules.reasons = createReasons();
  modules.reasons.init();
  
  // 4. Initialize Gallery Section
  // Sets up click-to-flip photo reveal mechanism
  modules.gallery = createGallery();
  modules.gallery.init();
  
  // 5. Initialize Love Game Section
  // Sets up evasive No button and Yes button celebration
  modules.loveGame = createLoveGame();
  modules.loveGame.init();
  
  // 6. Initialize Floating Hearts Animation
  // Creates background floating hearts (respects reduced motion)
  // Fewer hearts on mobile for better performance
  const isMobile = window.innerWidth < 768;
  initFloatingHearts(isMobile ? 12 : 30);
  
  // 7. Initialize Scroll Reveal Animations
  // Adds fade-in/slide-in effects when sections scroll into view
  initScrollReveal({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    once: true,
  });
}

/**
 * Clean up all modules and event listeners
 * Useful for hot module replacement or cleanup
 */
function cleanupModules(): void {
  // Clean up each module
  if (modules.navigation) {
    modules.navigation.destroy();
    modules.navigation = null;
  }
  
  if (modules.hero) {
    modules.hero.destroy();
    modules.hero = null;
  }
  
  if (modules.reasons) {
    modules.reasons.destroy();
    modules.reasons = null;
  }
  
  if (modules.gallery) {
    modules.gallery.destroy();
    modules.gallery = null;
  }
  
  if (modules.loveGame) {
    modules.loveGame.destroy();
    modules.loveGame = null;
  }
  
  // Clean up animations
  cleanupFloatingHearts();
  cleanupScrollReveal();
}

/**
 * Get access to initialized modules
 * Useful for debugging or external access
 */
export function getModules(): Readonly<AppModules> {
  return { ...modules };
}

/**
 * Main initialization function
 * Waits for DOM to be ready before initializing modules
 */
function main(): void {
  // Wait for DOM to be ready before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeModules();
      console.log('💕 Valentine Love Website initialized');
    });
  } else {
    // DOM is already ready
    initializeModules();
    console.log('💕 Valentine Love Website initialized');
  }
}

// Initialize the application
main();

// Export cleanup function for potential use
export { cleanupModules };

// Support for Vite HMR (Hot Module Replacement)
// Type assertion for Vite's HMR API
declare global {
  interface ImportMeta {
    hot?: {
      dispose: (callback: () => void) => void;
      accept: () => void;
    };
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanupModules();
  });
}
