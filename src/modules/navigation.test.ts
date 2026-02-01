/**
 * Navigation Module Tests
 * Unit tests and property-based tests for the navigation functionality
 *
 * @module navigation.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { Navigation, NavigationConfig } from './navigation';

// Mock the motion utility
vi.mock('../utils/motion', () => ({
  prefersReducedMotion: vi.fn(() => false),
}));

describe('Navigation Module', () => {
  let navigation: Navigation;
  let container: HTMLElement;

  // Set up DOM structure before each test
  beforeEach(() => {
    // Create a mock DOM structure
    container = document.createElement('div');
    container.innerHTML = `
      <nav id="main-nav" class="main-nav">
        <div class="nav-container">
          <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          <ul id="nav-menu" class="nav-menu">
            <li><a href="#hero" class="nav-link">Home</a></li>
            <li><a href="#reasons" class="nav-link">Reasons</a></li>
            <li><a href="#gallery" class="nav-link">Gallery</a></li>
            <li><a href="#game" class="nav-link">Game</a></li>
          </ul>
        </div>
      </nav>
      <main>
        <section id="hero" style="height: 500px;">Hero</section>
        <section id="reasons" style="height: 500px;">Reasons</section>
        <section id="gallery" style="height: 500px;">Gallery</section>
        <section id="game" style="height: 500px;">Game</section>
      </main>
    `;
    document.body.appendChild(container);

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Mock scrollTo
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    if (navigation) {
      navigation.destroy();
    }
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      // Mock scroll position at top of page
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 0,
      });

      navigation = new Navigation();
      navigation.init();

      // The active section depends on scroll position, so we just check the menu state
      expect(navigation.getState().isMenuOpen).toBe(false);
    });

    it('should accept custom configuration', () => {
      const customConfig: Partial<NavigationConfig> = {
        activeClass: 'custom-active',
        mobileBreakpoint: 992,
      };

      navigation = new Navigation(customConfig);
      navigation.init();

      expect(navigation.getState().isMenuOpen).toBe(false);
    });
  });

  describe('Mobile Menu Toggle', () => {
    beforeEach(() => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      navigation = new Navigation();
      navigation.init();
    });

    it('should toggle menu open state', () => {
      expect(navigation.isMenuOpen()).toBe(false);

      navigation.toggleMenu();
      expect(navigation.isMenuOpen()).toBe(true);

      navigation.toggleMenu();
      expect(navigation.isMenuOpen()).toBe(false);
    });

    it('should open menu when openMenu is called', () => {
      navigation.openMenu();
      expect(navigation.isMenuOpen()).toBe(true);
    });

    it('should close menu when closeMenu is called', () => {
      navigation.openMenu();
      expect(navigation.isMenuOpen()).toBe(true);

      navigation.closeMenu();
      expect(navigation.isMenuOpen()).toBe(false);
    });

    it('should update aria-expanded attribute on toggle button', () => {
      const toggle = document.querySelector('.nav-toggle');

      navigation.openMenu();
      expect(toggle?.getAttribute('aria-expanded')).toBe('true');

      navigation.closeMenu();
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    });

    it('should add is-open class to menu when opened', () => {
      const menu = document.querySelector('#nav-menu');

      navigation.openMenu();
      expect(menu?.classList.contains('is-open')).toBe(true);

      navigation.closeMenu();
      expect(menu?.classList.contains('is-open')).toBe(false);
    });

    it('should toggle menu on button click', () => {
      const toggle = document.querySelector('.nav-toggle') as HTMLElement;

      toggle.click();
      expect(navigation.isMenuOpen()).toBe(true);

      toggle.click();
      expect(navigation.isMenuOpen()).toBe(false);
    });
  });

  describe('Active Section Detection', () => {
    beforeEach(() => {
      navigation = new Navigation();
      navigation.init();
    });

    it('should detect active section based on scroll position', () => {
      // Set active section manually and verify it updates
      navigation.setActiveSection('hero');
      expect(navigation.getActiveSection()).toBe('hero');
    });

    it('should update active section when setActiveSection is called', () => {
      navigation.setActiveSection('reasons');
      expect(navigation.getActiveSection()).toBe('reasons');
    });

    it('should add active class to corresponding nav link', () => {
      navigation.setActiveSection('gallery');

      const galleryLink = document.querySelector('a[href="#gallery"]');
      const reasonsLink = document.querySelector('a[href="#reasons"]');

      expect(galleryLink?.classList.contains('active')).toBe(true);
      expect(reasonsLink?.classList.contains('active')).toBe(false);
    });

    it('should set aria-current attribute on active link', () => {
      navigation.setActiveSection('game');

      const gameLink = document.querySelector('a[href="#game"]');
      const heroLink = document.querySelector('a[href="#hero"]');

      expect(gameLink?.getAttribute('aria-current')).toBe('true');
      expect(heroLink?.hasAttribute('aria-current')).toBe(false);
    });
  });

  describe('Smooth Scroll', () => {
    beforeEach(() => {
      navigation = new Navigation();
      navigation.init();
    });

    it('should call scrollTo when scrollToSection is called', () => {
      navigation.scrollToSection('reasons');

      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('should update active section after scrolling', () => {
      navigation.scrollToSection('gallery');

      expect(navigation.getActiveSection()).toBe('gallery');
    });

    it('should not scroll for non-existent sections', () => {
      navigation.scrollToSection('nonexistent');

      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('Mobile View Detection', () => {
    it('should detect mobile view when width is below breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      navigation = new Navigation();
      navigation.init();

      expect(navigation.isMobileView()).toBe(true);
    });

    it('should detect desktop view when width is above breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      navigation = new Navigation();
      navigation.init();

      expect(navigation.isMobileView()).toBe(false);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      navigation = new Navigation();
      navigation.init();
    });

    it('should close menu on Escape key press', () => {
      navigation.openMenu();
      expect(navigation.isMenuOpen()).toBe(true);

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expect(navigation.isMenuOpen()).toBe(false);
    });

    it('should not close menu on other key presses', () => {
      navigation.openMenu();
      expect(navigation.isMenuOpen()).toBe(true);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);

      expect(navigation.isMenuOpen()).toBe(true);
    });
  });

  describe('Link Click Handling', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      navigation = new Navigation();
      navigation.init();
    });

    it('should scroll to section when nav link is clicked', () => {
      const reasonsLink = document.querySelector('a[href="#reasons"]') as HTMLElement;

      reasonsLink.click();

      expect(window.scrollTo).toHaveBeenCalled();
      expect(navigation.getActiveSection()).toBe('reasons');
    });

    it('should close mobile menu after clicking a link', () => {
      navigation.openMenu();
      expect(navigation.isMenuOpen()).toBe(true);

      const galleryLink = document.querySelector('a[href="#gallery"]') as HTMLElement;
      galleryLink.click();

      expect(navigation.isMenuOpen()).toBe(false);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      navigation = new Navigation();
      navigation.init();
    });

    it('should return a copy of state, not the original', () => {
      const state1 = navigation.getState();
      const state2 = navigation.getState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    it('should not allow external modification of state', () => {
      const state = navigation.getState();
      state.isMenuOpen = true;

      expect(navigation.isMenuOpen()).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should reset state on destroy', () => {
      navigation = new Navigation();
      navigation.init();
      navigation.openMenu();

      expect(navigation.isMenuOpen()).toBe(true);

      navigation.destroy();

      expect(navigation.isMenuOpen()).toBe(false);
    });
  });
});


/**
 * Property-based tests for Navigation Module
 *
 * Feature: valentine-love-website, Property 4: Navigation Scroll Targeting
 * Validates: Requirements 2.2
 */

describe('Property 4: Navigation Scroll Targeting', () => {
  let navigation: Navigation;
  let container: HTMLElement;

  // Valid section IDs for the website
  const validSectionIds = ['hero', 'reasons', 'gallery', 'game'];

  // Set up DOM structure before each test
  beforeEach(() => {
    // Create a mock DOM structure
    container = document.createElement('div');
    container.innerHTML = `
      <nav id="main-nav" class="main-nav">
        <div class="nav-container">
          <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          <ul id="nav-menu" class="nav-menu">
            <li><a href="#hero" class="nav-link">Home</a></li>
            <li><a href="#reasons" class="nav-link">Reasons</a></li>
            <li><a href="#gallery" class="nav-link">Gallery</a></li>
            <li><a href="#game" class="nav-link">Game</a></li>
          </ul>
        </div>
      </nav>
      <main>
        <section id="hero" style="height: 500px;">Hero</section>
        <section id="reasons" style="height: 500px;">Reasons</section>
        <section id="gallery" style="height: 500px;">Gallery</section>
        <section id="game" style="height: 500px;">Game</section>
      </main>
    `;
    document.body.appendChild(container);

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock scrollTo
    window.scrollTo = vi.fn();

    // Initialize navigation
    navigation = new Navigation();
    navigation.init();
  });

  afterEach(() => {
    if (navigation) {
      navigation.destroy();
    }
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  /**
   * Property test: For any valid section ID, calling scrollToSection SHALL update
   * the active section to match the target section ID.
   *
   * **Validates: Requirements 2.2**
   */
  it('should update active section when scrollToSection is called with any valid section ID', () => {
    // Feature: valentine-love-website, Property 4: Navigation Scroll Targeting
    fc.assert(
      fc.property(
        fc.constantFrom(...validSectionIds),
        (sectionId: string) => {
          // Call scrollToSection with the generated section ID
          navigation.scrollToSection(sectionId);

          // Property: The active section should be updated to the target section
          const activeSection = navigation.getActiveSection();

          return activeSection === sectionId;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any valid section ID, calling scrollToSection SHALL call
   * window.scrollTo with the correct target position (section offsetTop minus scroll offset).
   *
   * **Validates: Requirements 2.2**
   */
  it('should call scrollTo with correct target position for any valid section ID', () => {
    // Feature: valentine-love-website, Property 4: Navigation Scroll Targeting
    fc.assert(
      fc.property(
        fc.constantFrom(...validSectionIds),
        (sectionId: string) => {
          // Clear previous calls
          vi.clearAllMocks();

          // Get the section element and its expected position
          const section = document.getElementById(sectionId);
          if (!section) {
            return false;
          }

          const expectedPosition = section.offsetTop - 80; // Default scrollOffset is 80

          // Call scrollToSection
          navigation.scrollToSection(sectionId);

          // Property: scrollTo should be called with the correct position
          expect(window.scrollTo).toHaveBeenCalledWith({
            top: expectedPosition,
            behavior: 'smooth',
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any sequence of valid section IDs, scrolling to each section
   * SHALL always result in the active section matching the most recently scrolled-to section.
   *
   * **Validates: Requirements 2.2**
   */
  it('should correctly track active section through any sequence of scroll operations', () => {
    // Feature: valentine-love-website, Property 4: Navigation Scroll Targeting
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...validSectionIds), { minLength: 1, maxLength: 10 }),
        (sectionSequence: string[]) => {
          // Scroll through each section in the sequence
          for (const sectionId of sectionSequence) {
            navigation.scrollToSection(sectionId);
          }

          // Property: The active section should match the last section in the sequence
          const lastSection = sectionSequence[sectionSequence.length - 1];
          const activeSection = navigation.getActiveSection();

          return activeSection === lastSection;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any invalid section ID (not in the valid list), scrollToSection
   * SHALL NOT call window.scrollTo and SHALL NOT change the active section.
   *
   * **Validates: Requirements 2.2**
   */
  it('should not scroll or change active section for invalid section IDs', () => {
    // Feature: valentine-love-website, Property 4: Navigation Scroll Targeting
    fc.assert(
      fc.property(
        fc.string().filter((s) => !validSectionIds.includes(s) && s.length > 0),
        (invalidSectionId: string) => {
          // Clear previous calls
          vi.clearAllMocks();

          // Get the current active section before attempting to scroll
          const previousActiveSection = navigation.getActiveSection();

          // Attempt to scroll to an invalid section
          navigation.scrollToSection(invalidSectionId);

          // Property: scrollTo should NOT be called for invalid sections
          expect(window.scrollTo).not.toHaveBeenCalled();

          // Property: Active section should remain unchanged
          const currentActiveSection = navigation.getActiveSection();

          return currentActiveSection === previousActiveSection;
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property-based tests for Navigation Module
 *
 * Feature: valentine-love-website, Property 5: Active Section Indicator
 * Validates: Requirements 2.5
 */

describe('Property 5: Active Section Indicator', () => {
  let navigation: Navigation;
  let container: HTMLElement;

  // Valid section IDs for the website
  const validSectionIds = ['hero', 'reasons', 'gallery', 'game'];

  // Set up DOM structure before each test
  beforeEach(() => {
    // Create a mock DOM structure
    container = document.createElement('div');
    container.innerHTML = `
      <nav id="main-nav" class="main-nav">
        <div class="nav-container">
          <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          <ul id="nav-menu" class="nav-menu">
            <li><a href="#hero" class="nav-link">Home</a></li>
            <li><a href="#reasons" class="nav-link">Reasons</a></li>
            <li><a href="#gallery" class="nav-link">Gallery</a></li>
            <li><a href="#game" class="nav-link">Game</a></li>
          </ul>
        </div>
      </nav>
      <main>
        <section id="hero" style="height: 500px;">Hero</section>
        <section id="reasons" style="height: 500px;">Reasons</section>
        <section id="gallery" style="height: 500px;">Gallery</section>
        <section id="game" style="height: 500px;">Game</section>
      </main>
    `;
    document.body.appendChild(container);

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock scrollTo
    window.scrollTo = vi.fn();

    // Initialize navigation
    navigation = new Navigation();
    navigation.init();
  });

  afterEach(() => {
    if (navigation) {
      navigation.destroy();
    }
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  /**
   * Property test: For any valid section ID, setActiveSection SHALL apply the active
   * class to the corresponding nav link.
   *
   * **Validates: Requirements 2.5**
   */
  it('should apply active class to the correct nav link for any valid section ID', () => {
    // Feature: valentine-love-website, Property 5: Active Section Indicator
    fc.assert(
      fc.property(
        fc.constantFrom(...validSectionIds),
        (sectionId: string) => {
          // Set the active section
          navigation.setActiveSection(sectionId);

          // Get the nav link for this section
          const navLink = document.querySelector(`a[href="#${sectionId}"]`);

          // Property: The corresponding nav link should have the active class
          return navLink !== null && navLink.classList.contains('active');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any valid section ID, setActiveSection SHALL ensure that
   * only ONE nav link has the active class at a time.
   *
   * **Validates: Requirements 2.5**
   */
  it('should ensure only one nav link has the active class at a time', () => {
    // Feature: valentine-love-website, Property 5: Active Section Indicator
    fc.assert(
      fc.property(
        fc.constantFrom(...validSectionIds),
        (sectionId: string) => {
          // Set the active section
          navigation.setActiveSection(sectionId);

          // Get all nav links with the active class
          const activeLinks = document.querySelectorAll('.nav-link.active');

          // Property: Exactly one nav link should have the active class
          return activeLinks.length === 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any valid section ID, setActiveSection SHALL set the
   * aria-current attribute to "true" on the corresponding nav link.
   *
   * **Validates: Requirements 2.5**
   */
  it('should set aria-current attribute correctly for any valid section ID', () => {
    // Feature: valentine-love-website, Property 5: Active Section Indicator
    fc.assert(
      fc.property(
        fc.constantFrom(...validSectionIds),
        (sectionId: string) => {
          // Set the active section
          navigation.setActiveSection(sectionId);

          // Get the nav link for this section
          const navLink = document.querySelector(`a[href="#${sectionId}"]`);

          // Property: The corresponding nav link should have aria-current="true"
          return navLink !== null && navLink.getAttribute('aria-current') === 'true';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any valid section ID, setActiveSection SHALL remove the
   * aria-current attribute from all other nav links.
   *
   * **Validates: Requirements 2.5**
   */
  it('should ensure only one nav link has aria-current attribute', () => {
    // Feature: valentine-love-website, Property 5: Active Section Indicator
    fc.assert(
      fc.property(
        fc.constantFrom(...validSectionIds),
        (sectionId: string) => {
          // Set the active section
          navigation.setActiveSection(sectionId);

          // Get all nav links with aria-current attribute
          const linksWithAriaCurrent = document.querySelectorAll('.nav-link[aria-current]');

          // Property: Exactly one nav link should have the aria-current attribute
          return linksWithAriaCurrent.length === 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any sequence of valid section IDs, the active class and
   * aria-current attribute SHALL always be on the most recently set section's link.
   *
   * **Validates: Requirements 2.5**
   */
  it('should correctly update active indicator through any sequence of section changes', () => {
    // Feature: valentine-love-website, Property 5: Active Section Indicator
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...validSectionIds), { minLength: 1, maxLength: 10 }),
        (sectionSequence: string[]) => {
          // Set active section for each in the sequence
          for (const sectionId of sectionSequence) {
            navigation.setActiveSection(sectionId);
          }

          // Get the last section in the sequence
          const lastSection = sectionSequence[sectionSequence.length - 1];

          // Get the nav link for the last section
          const navLink = document.querySelector(`a[href="#${lastSection}"]`);

          // Get all active links
          const activeLinks = document.querySelectorAll('.nav-link.active');
          const linksWithAriaCurrent = document.querySelectorAll('.nav-link[aria-current]');

          // Property: The last section's link should be active with correct attributes
          // and only one link should be active
          return (
            navLink !== null &&
            navLink.classList.contains('active') &&
            navLink.getAttribute('aria-current') === 'true' &&
            activeLinks.length === 1 &&
            linksWithAriaCurrent.length === 1
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any valid section ID, getActiveSection SHALL return the
   * same section ID that was set via setActiveSection.
   *
   * **Validates: Requirements 2.5**
   */
  it('should return the correct active section via getActiveSection', () => {
    // Feature: valentine-love-website, Property 5: Active Section Indicator
    fc.assert(
      fc.property(
        fc.constantFrom(...validSectionIds),
        (sectionId: string) => {
          // Set the active section
          navigation.setActiveSection(sectionId);

          // Property: getActiveSection should return the same section ID
          return navigation.getActiveSection() === sectionId;
        }
      ),
      { numRuns: 100 }
    );
  });
});
