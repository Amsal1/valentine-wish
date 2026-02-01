/**
 * Hero Section Module Tests
 * Requirements: 6.4 - Romantic welcome animation on page load
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHero, triggerTitleSparkle } from './hero';

// Mock the motion utility
vi.mock('../utils/motion', () => ({
  prefersReducedMotion: vi.fn(() => false),
}));

describe('Hero Section Module', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Set up DOM structure
    container = document.createElement('div');
    container.innerHTML = `
      <section id="hero" class="hero-section">
        <div class="section-content">
          <h1 class="hero-title">💕 For My Love 💕</h1>
          <p class="hero-subtitle">A little something special, just for you</p>
          <div class="scroll-indicator" aria-hidden="true">
            <span class="scroll-arrow">↓</span>
            <span class="scroll-text">Scroll to explore</span>
          </div>
        </div>
      </section>
      <section id="reasons" class="reasons-section">
        <h2>Reasons I Love You</h2>
      </section>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('createHero', () => {
    it('should initialize hero section successfully', () => {
      const hero = createHero();
      hero.init();

      const state = hero.getState();
      expect(state.isAnimated).toBe(true);
      expect(state.isVisible).toBe(true);
    });

    it('should apply animation classes to hero elements', () => {
      const hero = createHero();
      hero.init();

      const title = document.querySelector('.hero-title');
      const subtitle = document.querySelector('.hero-subtitle');
      const scrollIndicator = document.querySelector('.scroll-indicator');

      expect(title?.classList.contains('hero-animate-in')).toBe(true);
      expect(subtitle?.classList.contains('hero-animate-in')).toBe(true);
      expect(scrollIndicator?.classList.contains('hero-animate-in')).toBe(true);
    });

    it('should set staggered animation delays', () => {
      const hero = createHero({ animationDelay: 200 });
      hero.init();

      const title = document.querySelector('.hero-title') as HTMLElement;
      const subtitle = document.querySelector('.hero-subtitle') as HTMLElement;
      const scrollIndicator = document.querySelector('.scroll-indicator') as HTMLElement;

      expect(title?.style.animationDelay).toBe('0ms');
      expect(subtitle?.style.animationDelay).toBe('200ms');
      expect(scrollIndicator?.style.animationDelay).toBe('400ms');
    });

    it('should make scroll indicator keyboard accessible', () => {
      const hero = createHero();
      hero.init();

      const scrollIndicator = document.querySelector('.scroll-indicator');
      expect(scrollIndicator?.getAttribute('role')).toBe('button');
      expect(scrollIndicator?.getAttribute('tabindex')).toBe('0');
    });

    it('should scroll to next section when scroll indicator is clicked', () => {
      const hero = createHero();
      hero.init();

      const scrollIndicator = document.querySelector('.scroll-indicator') as HTMLElement;
      const reasonsSection = document.querySelector('#reasons') as HTMLElement;
      
      // Mock scrollIntoView
      const scrollIntoViewMock = vi.fn();
      reasonsSection.scrollIntoView = scrollIntoViewMock;

      scrollIndicator.click();

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('should handle missing hero section gracefully', () => {
      // Remove the container first to avoid cleanup issues
      document.body.removeChild(container);
      container = document.createElement('div');
      document.body.appendChild(container);
      
      const hero = createHero();
      // Should not throw
      expect(() => hero.init()).not.toThrow();
      
      const state = hero.getState();
      expect(state.isAnimated).toBe(false);
    });

    it('should clean up event listeners on destroy', () => {
      const hero = createHero();
      hero.init();

      const scrollIndicator = document.querySelector('.scroll-indicator') as HTMLElement;
      const reasonsSection = document.querySelector('#reasons') as HTMLElement;
      const scrollIntoViewMock = vi.fn();
      reasonsSection.scrollIntoView = scrollIntoViewMock;

      hero.destroy();

      // After destroy, clicking should not trigger scroll
      scrollIndicator.click();
      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });

    it('should use custom configuration when provided', () => {
      const customConfig = {
        heroSelector: '#hero',
        animationDelay: 300,
      };

      const hero = createHero(customConfig);
      hero.init();

      const subtitle = document.querySelector('.hero-subtitle') as HTMLElement;
      expect(subtitle?.style.animationDelay).toBe('300ms');
    });
  });

  describe('triggerTitleSparkle', () => {
    it('should add sparkle class to title element', () => {
      const title = document.querySelector('.hero-title') as HTMLElement;
      
      triggerTitleSparkle(title);
      
      expect(title.classList.contains('hero-sparkle')).toBe(true);
    });

    it('should remove sparkle class after animation completes', async () => {
      vi.useFakeTimers();
      
      const title = document.querySelector('.hero-title') as HTMLElement;
      
      triggerTitleSparkle(title);
      expect(title.classList.contains('hero-sparkle')).toBe(true);
      
      vi.advanceTimersByTime(1000);
      expect(title.classList.contains('hero-sparkle')).toBe(false);
      
      vi.useRealTimers();
    });
  });

  describe('reduced motion preference', () => {
    it('should apply hero-animated class instead of animations when reduced motion is preferred', async () => {
      // Re-mock with reduced motion enabled
      const { prefersReducedMotion } = await import('../utils/motion');
      vi.mocked(prefersReducedMotion).mockReturnValue(true);

      const hero = createHero();
      hero.init();

      const title = document.querySelector('.hero-title');
      expect(title?.classList.contains('hero-animated')).toBe(true);
    });
  });
});
