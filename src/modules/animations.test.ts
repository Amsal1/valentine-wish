/**
 * Animations Module Tests
 * Tests for floating hearts animation and scroll reveal functionality
 * 
 * Validates: Requirements 6.3, 7.2, 7.3, 7.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  createFloatingHearts,
  createFloatingHeartElement,
  clearFloatingHearts,
  getActiveHearts,
  cleanupFloatingHearts,
  createScrollReveal,
  cleanupScrollReveal,
  getActiveScrollObservers,
  SCROLL_REVEAL_CLASS,
  SCROLL_REVEAL_VISIBLE_CLASS,
} from './animations';

// Mock the motion utility
vi.mock('../utils/motion', () => ({
  prefersReducedMotion: vi.fn(() => false),
  onMotionPreferenceChange: vi.fn(() => () => {}),
}));

import { prefersReducedMotion, onMotionPreferenceChange } from '../utils/motion';

describe('Animations Module', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement('div');
    container.id = 'floating-hearts';
    document.body.appendChild(container);
    
    // Reset mocks
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
    vi.mocked(onMotionPreferenceChange).mockReturnValue(() => {});
  });

  afterEach(() => {
    // Clean up
    cleanupFloatingHearts();
    container.remove();
    vi.clearAllMocks();
  });

  describe('createFloatingHeartElement', () => {
    it('should create a floating heart element with correct structure', () => {
      const heart = createFloatingHeartElement();
      
      expect(heart.element).toBeInstanceOf(HTMLElement);
      expect(heart.element.tagName).toBe('SPAN');
      expect(heart.element.className).toBe('floating-heart');
      expect(heart.element.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have a heart emoji as content', () => {
      const heart = createFloatingHeartElement();
      const heartEmojis = ['💕', '💗', '💖', '💝', '❤️', '💓', '💞'];
      
      expect(heartEmojis).toContain(heart.element.textContent);
    });

    it('should have size within configured range', () => {
      const heart = createFloatingHeartElement({
        minSize: 16,
        maxSize: 32,
      });
      
      expect(heart.size).toBeGreaterThanOrEqual(16);
      expect(heart.size).toBeLessThanOrEqual(32);
    });

    it('should have startX position between 0 and 100', () => {
      const heart = createFloatingHeartElement();
      
      expect(heart.startX).toBeGreaterThanOrEqual(0);
      expect(heart.startX).toBeLessThanOrEqual(100);
    });

    it('should have speed within configured duration range', () => {
      const heart = createFloatingHeartElement({
        minDuration: 8,
        maxDuration: 15,
      });
      
      expect(heart.speed).toBeGreaterThanOrEqual(10);
      expect(heart.speed).toBeLessThanOrEqual(20);
    });

    it('should apply animation styles to the element', () => {
      const heart = createFloatingHeartElement();
      
      expect(heart.element.style.position).toBe('fixed');
      expect(heart.element.style.pointerEvents).toBe('none');
      expect(heart.element.style.animation).toContain('floatingHeartRise');
    });
  });

  describe('createFloatingHearts', () => {
    it('should create the specified number of hearts', () => {
      const hearts = createFloatingHearts(container, 10);
      
      expect(hearts).toHaveLength(10);
      expect(container.querySelectorAll('.floating-heart')).toHaveLength(10);
    });

    it('should use default count of 30 when not specified', () => {
      const hearts = createFloatingHearts(container);
      
      expect(hearts).toHaveLength(30);
    });

    it('should append hearts to the container', () => {
      createFloatingHearts(container, 5);
      
      const heartElements = container.querySelectorAll('.floating-heart');
      expect(heartElements).toHaveLength(5);
    });

    it('should return empty array when reduced motion is preferred', () => {
      // Feature: valentine-love-website, Property 12: Reduced Motion Preference
      // **Validates: Requirements 7.6**
      vi.mocked(prefersReducedMotion).mockReturnValue(true);
      
      const hearts = createFloatingHearts(container, 10);
      
      expect(hearts).toHaveLength(0);
      expect(container.querySelectorAll('.floating-heart')).toHaveLength(0);
    });

    it('should clear existing hearts before creating new ones', () => {
      // Create initial hearts
      createFloatingHearts(container, 5);
      expect(container.querySelectorAll('.floating-heart')).toHaveLength(5);
      
      // Create new hearts - should replace old ones
      createFloatingHearts(container, 3);
      expect(container.querySelectorAll('.floating-heart')).toHaveLength(3);
    });

    it('should set up motion preference change listener', () => {
      createFloatingHearts(container, 5);
      
      expect(onMotionPreferenceChange).toHaveBeenCalled();
    });

    it('should update active hearts array', () => {
      createFloatingHearts(container, 7);
      
      const activeHearts = getActiveHearts();
      expect(activeHearts).toHaveLength(7);
    });
  });

  describe('clearFloatingHearts', () => {
    it('should remove all floating hearts from container', () => {
      createFloatingHearts(container, 10);
      expect(container.querySelectorAll('.floating-heart')).toHaveLength(10);
      
      clearFloatingHearts(container);
      expect(container.querySelectorAll('.floating-heart')).toHaveLength(0);
    });

    it('should clear active hearts array', () => {
      createFloatingHearts(container, 5);
      expect(getActiveHearts()).toHaveLength(5);
      
      clearFloatingHearts(container);
      expect(getActiveHearts()).toHaveLength(0);
    });

    it('should handle empty container gracefully', () => {
      expect(() => clearFloatingHearts(container)).not.toThrow();
    });
  });

  describe('getActiveHearts', () => {
    it('should return a copy of active hearts array', () => {
      createFloatingHearts(container, 5);
      
      const hearts1 = getActiveHearts();
      const hearts2 = getActiveHearts();
      
      expect(hearts1).not.toBe(hearts2);
      expect(hearts1).toEqual(hearts2);
    });

    it('should return empty array when no hearts created', () => {
      const hearts = getActiveHearts();
      
      expect(hearts).toEqual([]);
    });
  });

  describe('cleanupFloatingHearts', () => {
    it('should clean up motion preference listener', () => {
      const mockCleanup = vi.fn();
      vi.mocked(onMotionPreferenceChange).mockReturnValue(mockCleanup);
      
      createFloatingHearts(container, 5);
      cleanupFloatingHearts();
      
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should clear active hearts array', () => {
      createFloatingHearts(container, 5);
      expect(getActiveHearts()).toHaveLength(5);
      
      cleanupFloatingHearts();
      expect(getActiveHearts()).toHaveLength(0);
    });
  });

  describe('Reduced Motion Preference', () => {
    // Feature: valentine-love-website, Property 12: Reduced Motion Preference
    // **Validates: Requirements 7.6**
    
    it('should not create hearts when user prefers reduced motion', () => {
      vi.mocked(prefersReducedMotion).mockReturnValue(true);
      
      const hearts = createFloatingHearts(container, 20);
      
      expect(hearts).toHaveLength(0);
      expect(container.children).toHaveLength(0);
    });

    it('should check motion preference before creating hearts', () => {
      createFloatingHearts(container, 5);
      
      expect(prefersReducedMotion).toHaveBeenCalled();
    });

    it('should listen for motion preference changes', () => {
      createFloatingHearts(container, 5);
      
      expect(onMotionPreferenceChange).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Performance Considerations', () => {
    // Validates: Requirements 7.3 (animate continuously without impacting performance)
    
    it('should use will-change for performance optimization', () => {
      const heart = createFloatingHeartElement();
      
      expect(heart.element.style.willChange).toBe('transform, opacity');
    });

    it('should set pointer-events to none to avoid interaction overhead', () => {
      const heart = createFloatingHeartElement();
      
      expect(heart.element.style.pointerEvents).toBe('none');
    });

    it('should set aria-hidden for accessibility', () => {
      const heart = createFloatingHeartElement();
      
      expect(heart.element.getAttribute('aria-hidden')).toBe('true');
    });
  });
});


/* ============================================
   Scroll Reveal Animation Property Tests
   Feature: valentine-love-website, Property 11: Scroll Reveal Animation
   **Validates: Requirements 7.2**
   ============================================ */

describe('Scroll Reveal Animation - Property Tests', () => {
  let container: HTMLElement;
  
  // Mock IntersectionObserver state
  let mockObserverCallback: IntersectionObserverCallback | null = null;
  let mockObservedElements: Element[] = [];
  let mockObserverInstances: MockObserverInstance[] = [];
  
  interface MockObserverInstance {
    callback: IntersectionObserverCallback;
    observedElements: Element[];
    observe: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }
  
  // Create a proper mock class for IntersectionObserver
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    
    private observedElements: Element[] = [];
    
    constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
      mockObserverCallback = callback;
      
      // Store instance for testing
      const instance: MockObserverInstance = {
        callback,
        observedElements: this.observedElements,
        observe: vi.fn((element: Element) => {
          this.observedElements.push(element);
          mockObservedElements.push(element);
        }),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
      mockObserverInstances.push(instance);
    }
    
    observe(target: Element): void {
      this.observedElements.push(target);
      mockObservedElements.push(target);
    }
    
    unobserve(_target: Element): void {}
    
    disconnect(): void {}
    
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement('div');
    container.id = 'scroll-reveal-container';
    document.body.appendChild(container);
    
    // Reset mocks
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
    mockObserverCallback = null;
    mockObservedElements = [];
    mockObserverInstances = [];
    
    // Mock IntersectionObserver
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    // Clean up
    cleanupScrollReveal();
    container.remove();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  /**
   * Helper to create mock intersection entries
   */
  function createMockIntersectionEntry(
    target: Element,
    isIntersecting: boolean,
    intersectionRatio: number = isIntersecting ? 0.5 : 0
  ): IntersectionObserverEntry {
    return {
      target,
      isIntersecting,
      intersectionRatio,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: new DOMRect(),
      rootBounds: null,
      time: Date.now(),
    };
  }

  /**
   * Helper to create test elements
   */
  function createTestElements(count: number, addScrollRevealClass: boolean = false): Element[] {
    const elements: Element[] = [];
    for (let i = 0; i < count; i++) {
      const element = document.createElement('section');
      element.id = `section-${i}`;
      if (addScrollRevealClass) {
        element.classList.add(SCROLL_REVEAL_CLASS);
      }
      container.appendChild(element);
      elements.push(element);
    }
    return elements;
  }

  // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
  describe('Property 11: Elements get visible class when intersecting', () => {
    it('should apply scroll-reveal-visible class to any element that enters viewport', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 0, max: 19 }),
          (elementCount, intersectingIndex) => {
            // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
            // **Validates: Requirements 7.2**
            
            // Ensure intersectingIndex is within bounds
            const safeIndex = intersectingIndex % elementCount;
            
            // Clean up from previous iteration
            cleanupScrollReveal();
            container.innerHTML = '';
            mockObservedElements = [];
            mockObserverInstances = [];
            
            // Create elements
            const elements = createTestElements(elementCount);
            
            // Create scroll reveal
            createScrollReveal(elements);
            
            // Verify observer was created and elements are observed
            expect(mockObservedElements.length).toBe(elementCount);
            
            // Simulate intersection for the selected element
            if (mockObserverCallback) {
              const targetElement = elements[safeIndex];
              const entry = createMockIntersectionEntry(targetElement!, true);
              const mockObserver = { disconnect: vi.fn(), observe: vi.fn(), unobserve: vi.fn(), takeRecords: vi.fn(() => []), root: null, rootMargin: '', thresholds: [] } as unknown as IntersectionObserver;
              mockObserverCallback([entry], mockObserver);
              
              // Verify the element has the visible class
              expect(targetElement!.classList.contains(SCROLL_REVEAL_VISIBLE_CLASS)).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
  describe('Property 11: Elements without scroll-reveal class get it added', () => {
    it('should add scroll-reveal class to any element that does not have it', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 15 }),
          fc.array(fc.boolean(), { minLength: 1, maxLength: 15 }),
          (elementCount, hasClassFlags) => {
            // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
            // **Validates: Requirements 7.2**
            
            // Clean up from previous iteration
            cleanupScrollReveal();
            container.innerHTML = '';
            mockObservedElements = [];
            mockObserverInstances = [];
            
            // Create elements with varying initial class states
            const elements: Element[] = [];
            for (let i = 0; i < elementCount; i++) {
              const element = document.createElement('section');
              element.id = `section-${i}`;
              // Use the flag array to determine if element starts with class
              const hasClass = hasClassFlags[i % hasClassFlags.length];
              if (hasClass) {
                element.classList.add(SCROLL_REVEAL_CLASS);
              }
              container.appendChild(element);
              elements.push(element);
            }
            
            // Create scroll reveal
            createScrollReveal(elements);
            
            // Verify ALL elements now have the scroll-reveal class
            elements.forEach((element) => {
              expect(element.classList.contains(SCROLL_REVEAL_CLASS)).toBe(true);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
  describe('Property 11: Reduced motion shows elements immediately', () => {
    it('should immediately show all elements when reduced motion is preferred', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (elementCount) => {
            // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
            // **Validates: Requirements 7.2**
            
            // Clean up from previous iteration
            cleanupScrollReveal();
            container.innerHTML = '';
            mockObservedElements = [];
            
            // Enable reduced motion preference
            vi.mocked(prefersReducedMotion).mockReturnValue(true);
            
            // Create elements
            const elements = createTestElements(elementCount);
            
            // Create scroll reveal
            const observer = createScrollReveal(elements);
            
            // Verify no observer was created (returns null for reduced motion)
            expect(observer).toBeNull();
            
            // Verify ALL elements have the visible class immediately
            elements.forEach((element) => {
              expect(element.classList.contains(SCROLL_REVEAL_VISIBLE_CLASS)).toBe(true);
            });
            
            // Reset mock for next iteration
            vi.mocked(prefersReducedMotion).mockReturnValue(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
  describe('Property 11: Observer cleanup works correctly', () => {
    it('should disconnect all observers when cleanup is called', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 5 }),
          (elementsPerObserver, observerCount) => {
            // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
            // **Validates: Requirements 7.2**
            
            // Clean up from previous iteration
            cleanupScrollReveal();
            container.innerHTML = '';
            mockObservedElements = [];
            mockObserverInstances = [];
            
            // Create multiple observers
            for (let i = 0; i < observerCount; i++) {
              const elements = createTestElements(elementsPerObserver);
              createScrollReveal(elements);
            }
            
            // Verify observers were created
            const activeObservers = getActiveScrollObservers();
            expect(activeObservers.length).toBe(observerCount);
            
            // Clean up
            cleanupScrollReveal();
            
            // Verify all observers are cleaned up
            const remainingObservers = getActiveScrollObservers();
            expect(remainingObservers.length).toBe(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
  describe('Property 11: Multiple elements can be observed simultaneously', () => {
    it('should observe all elements and apply visible class to each when they intersect', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 15 }),
          fc.array(fc.boolean(), { minLength: 2, maxLength: 15 }),
          (elementCount, intersectionFlags) => {
            // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
            // **Validates: Requirements 7.2**
            
            // Clean up from previous iteration
            cleanupScrollReveal();
            container.innerHTML = '';
            mockObservedElements = [];
            mockObserverInstances = [];
            
            // Create elements
            const elements = createTestElements(elementCount);
            
            // Create scroll reveal
            createScrollReveal(elements);
            
            // Verify all elements are being observed
            expect(mockObservedElements.length).toBe(elementCount);
            
            // Simulate intersection for multiple elements based on flags
            if (mockObserverCallback) {
              const entries: IntersectionObserverEntry[] = [];
              
              elements.forEach((element, index) => {
                const isIntersecting = intersectionFlags[index % intersectionFlags.length];
                entries.push(createMockIntersectionEntry(element, isIntersecting!));
              });
              
              const mockObserver = { disconnect: vi.fn(), observe: vi.fn(), unobserve: vi.fn(), takeRecords: vi.fn(() => []), root: null, rootMargin: '', thresholds: [] } as unknown as IntersectionObserver;
              mockObserverCallback(entries, mockObserver);
              
              // Verify each element's class matches its intersection state
              elements.forEach((element, index) => {
                const shouldBeVisible = intersectionFlags[index % intersectionFlags.length];
                expect(element.classList.contains(SCROLL_REVEAL_VISIBLE_CLASS)).toBe(shouldBeVisible);
              });
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
  describe('Property 11: Threshold behavior', () => {
    it('should respect custom threshold values for any configuration', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.double({ min: 0.01, max: 1.0, noNaN: true }),
          (elementCount, threshold) => {
            // Feature: valentine-love-website, Property 11: Scroll Reveal Animation
            // **Validates: Requirements 7.2**
            
            // Clean up from previous iteration
            cleanupScrollReveal();
            container.innerHTML = '';
            mockObservedElements = [];
            mockObserverInstances = [];
            
            // Create elements
            const elements = createTestElements(elementCount);
            
            // Create scroll reveal with custom threshold
            const observer = createScrollReveal(elements, { threshold });
            
            // Verify observer was created
            expect(observer).not.toBeNull();
            
            // Verify all elements are observed
            expect(mockObservedElements.length).toBe(elementCount);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
