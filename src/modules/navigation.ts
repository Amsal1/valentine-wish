/**
 * Navigation Module
 * Handles hamburger menu toggle, smooth scrolling, and active section detection
 *
 * @module navigation
 * @description Provides navigation functionality for the Valentine Love Website
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 * - 2.1: Navigation SHALL provide links to all main sections
 * - 2.2: WHEN a navigation link is clicked, THE Website SHALL smoothly scroll to the target section
 * - 2.3: Navigation SHALL remain accessible on all screen sizes
 * - 2.4: WHEN on mobile devices, THE Navigation SHALL collapse into a hamburger menu
 * - 2.5: WHEN scrolling, THE Navigation SHALL indicate the current active section
 */

import { getById, addClass, removeClass, toggleClass } from '../utils/dom';
import { prefersReducedMotion } from '../utils/motion';

/**
 * Configuration options for the navigation module
 */
export interface NavigationConfig {
  /** CSS selector for the navigation menu container */
  menuSelector: string;
  /** CSS selector for navigation links */
  linkSelector: string;
  /** CSS class applied to active navigation links */
  activeClass: string;
  /** Viewport width below which mobile menu is shown */
  mobileBreakpoint: number;
  /** CSS selector for the hamburger toggle button */
  toggleSelector: string;
  /** Offset from top when scrolling to sections (for fixed nav) */
  scrollOffset: number;
}

/**
 * State of the navigation component
 */
export interface NavigationState {
  /** Whether the mobile menu is currently open */
  isMenuOpen: boolean;
  /** ID of the currently active section */
  activeSection: string;
}

/**
 * Default configuration for navigation
 */
const DEFAULT_CONFIG: NavigationConfig = {
  menuSelector: '#nav-menu',
  linkSelector: '.nav-link',
  activeClass: 'active',
  mobileBreakpoint: 768,
  toggleSelector: '.nav-toggle',
  scrollOffset: 80,
};

/**
 * Navigation class that manages all navigation functionality
 */
export class Navigation {
  private config: NavigationConfig;
  private state: NavigationState;
  private menu: HTMLElement | null = null;
  private toggle: HTMLElement | null = null;
  private links: NodeListOf<Element> | null = null;
  private sections: HTMLElement[] = [];
  private scrollHandler: (() => void) | null = null;
  private resizeHandler: (() => void) | null = null;

  constructor(config: Partial<NavigationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      isMenuOpen: false,
      activeSection: 'hero',
    };
  }

  /**
   * Initialize the navigation module
   * Sets up event listeners and initial state
   */
  public init(): void {
    this.cacheElements();
    this.bindEvents();
    this.updateActiveSection();
  }

  /**
   * Cache DOM elements for performance
   */
  private cacheElements(): void {
    this.menu = document.querySelector(this.config.menuSelector) as HTMLElement;
    this.toggle = document.querySelector(this.config.toggleSelector) as HTMLElement;
    this.links = document.querySelectorAll(this.config.linkSelector);

    // Get all sections that have corresponding nav links
    const sectionIds = ['hero', 'reasons', 'gallery', 'game'];
    this.sections = sectionIds
      .map((id) => getById(id))
      .filter((el): el is HTMLElement => el !== null);
  }

  /**
   * Bind all event listeners
   */
  private bindEvents(): void {
    // Hamburger menu toggle
    if (this.toggle) {
      this.toggle.addEventListener('click', this.handleToggleClick.bind(this));
    }

    // Navigation link clicks
    if (this.links) {
      this.links.forEach((link) => {
        link.addEventListener('click', this.handleLinkClick.bind(this));
      });
    }

    // Scroll event for active section detection
    this.scrollHandler = this.throttle(this.updateActiveSection.bind(this), 100);
    window.addEventListener('scroll', this.scrollHandler, { passive: true });

    // Resize event to handle breakpoint changes
    this.resizeHandler = this.debounce(this.handleResize.bind(this), 150);
    window.addEventListener('resize', this.resizeHandler);

    // Close menu when clicking outside
    document.addEventListener('click', this.handleOutsideClick.bind(this));

    // Close menu on escape key
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Handle hamburger menu toggle click
   */
  private handleToggleClick(event: Event): void {
    event.preventDefault();
    this.toggleMenu();
  }

  /**
   * Toggle the mobile menu open/closed state
   */
  public toggleMenu(force?: boolean): void {
    this.state.isMenuOpen = force !== undefined ? force : !this.state.isMenuOpen;

    if (this.menu) {
      toggleClass(this.menu, 'is-open', this.state.isMenuOpen);
    }

    if (this.toggle) {
      this.toggle.setAttribute('aria-expanded', String(this.state.isMenuOpen));
      toggleClass(this.toggle, 'is-active', this.state.isMenuOpen);
    }

    // Prevent body scroll when menu is open on mobile
    if (this.state.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Close the mobile menu
   */
  public closeMenu(): void {
    this.toggleMenu(false);
  }

  /**
   * Open the mobile menu
   */
  public openMenu(): void {
    this.toggleMenu(true);
  }

  /**
   * Handle navigation link click
   * Implements smooth scroll to target section
   */
  private handleLinkClick(event: Event): void {
    const link = event.currentTarget as HTMLAnchorElement;
    const href = link.getAttribute('href');

    if (!href || !href.startsWith('#')) {
      return;
    }

    event.preventDefault();

    const targetId = href.substring(1);
    this.scrollToSection(targetId);

    // Close mobile menu after clicking a link
    if (this.isMobileView()) {
      this.closeMenu();
    }
  }

  /**
   * Scroll to a specific section
   * @param sectionId - The ID of the section to scroll to
   */
  public scrollToSection(sectionId: string): void {
    const section = getById(sectionId);

    if (!section) {
      return;
    }

    const targetPosition = section.offsetTop - this.config.scrollOffset;

    // Use smooth scroll unless user prefers reduced motion
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';

    window.scrollTo({
      top: targetPosition,
      behavior: behavior,
    });

    // Update active section immediately for better UX
    this.setActiveSection(sectionId);
  }

  /**
   * Update the active section based on scroll position
   * Called on scroll events
   */
  public updateActiveSection(): void {
    const scrollPosition = window.scrollY + this.config.scrollOffset + 100;

    let currentSection = 'hero';

    for (const section of this.sections) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.id;
        break;
      }
    }

    // Also check if we're at the bottom of the page
    const isAtBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
    if (isAtBottom && this.sections.length > 0) {
      const lastSection = this.sections[this.sections.length - 1];
      if (lastSection) {
        currentSection = lastSection.id;
      }
    }

    if (currentSection !== this.state.activeSection) {
      this.setActiveSection(currentSection);
    }
  }

  /**
   * Set the active section and update navigation links
   * @param sectionId - The ID of the active section
   */
  public setActiveSection(sectionId: string): void {
    this.state.activeSection = sectionId;

    if (!this.links) {
      return;
    }

    this.links.forEach((link) => {
      const href = link.getAttribute('href');
      const linkSectionId = href ? href.substring(1) : '';

      if (linkSectionId === sectionId) {
        addClass(link, this.config.activeClass);
        link.setAttribute('aria-current', 'true');
      } else {
        removeClass(link, this.config.activeClass);
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Handle clicks outside the navigation menu
   */
  private handleOutsideClick(event: Event): void {
    if (!this.state.isMenuOpen) {
      return;
    }

    const target = event.target as HTMLElement;
    const nav = document.querySelector('#main-nav');

    if (nav && !nav.contains(target)) {
      this.closeMenu();
    }
  }

  /**
   * Handle keyboard events (escape to close menu)
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.state.isMenuOpen) {
      this.closeMenu();
      if (this.toggle && 'focus' in this.toggle) {
        (this.toggle as HTMLElement).focus();
      }
    }
  }

  /**
   * Handle window resize events
   */
  private handleResize(): void {
    // Close menu when resizing to desktop view
    if (!this.isMobileView() && this.state.isMenuOpen) {
      this.closeMenu();
    }
  }

  /**
   * Check if current viewport is mobile
   */
  public isMobileView(): boolean {
    return window.innerWidth < this.config.mobileBreakpoint;
  }

  /**
   * Get the current navigation state
   */
  public getState(): NavigationState {
    return { ...this.state };
  }

  /**
   * Get the current active section ID
   */
  public getActiveSection(): string {
    return this.state.activeSection;
  }

  /**
   * Check if the menu is currently open
   */
  public isMenuOpen(): boolean {
    return this.state.isMenuOpen;
  }

  /**
   * Throttle function to limit execution rate
   */
  private throttle<T extends (...args: unknown[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Debounce function to delay execution
   */
  private debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  /**
   * Clean up event listeners and reset state
   */
  public destroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    document.removeEventListener('click', this.handleOutsideClick.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));

    // Reset state
    this.closeMenu();
    document.body.style.overflow = '';
  }
}

/**
 * Create and initialize a navigation instance with default settings
 * @param config - Optional configuration overrides
 * @returns Initialized Navigation instance
 */
export function initNavigation(config?: Partial<NavigationConfig>): Navigation {
  const navigation = new Navigation(config);
  navigation.init();
  return navigation;
}

/**
 * Export default instance for simple usage
 */
let defaultNavigation: Navigation | null = null;

/**
 * Get or create the default navigation instance
 */
export function getNavigation(): Navigation {
  if (!defaultNavigation) {
    defaultNavigation = new Navigation();
  }
  return defaultNavigation;
}
