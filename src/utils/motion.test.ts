/**
 * Unit tests for Motion Preference Detection Utility
 * 
 * Tests the prefersReducedMotion function and related utilities
 * Validates: Requirements 7.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  prefersReducedMotion,
  onMotionPreferenceChange,
  initMotionPreference,
  REDUCED_MOTION_CLASS,
  _resetMediaQueryListCache,
} from './motion';

describe('Motion Preference Detection', () => {
  // Store original matchMedia
  const originalMatchMedia = window.matchMedia;
  
  // Mock MediaQueryList
  let mockMediaQueryList: {
    matches: boolean;
    media: string;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
    onchange: null;
    dispatchEvent: ReturnType<typeof vi.fn>;
  };
  
  beforeEach(() => {
    // Reset the cached MediaQueryList before each test
    _resetMediaQueryListCache();
    
    // Create fresh mock for each test
    mockMediaQueryList = {
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    };
    
    // Mock window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue(mockMediaQueryList);
    
    // Clean up document classes
    document.documentElement.classList.remove(REDUCED_MOTION_CLASS);
  });
  
  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
    
    // Clean up document classes
    document.documentElement.classList.remove(REDUCED_MOTION_CLASS);
  });
  
  describe('prefersReducedMotion', () => {
    it('should return false when user does not prefer reduced motion', () => {
      mockMediaQueryList.matches = false;
      
      expect(prefersReducedMotion()).toBe(false);
    });
    
    it('should return true when user prefers reduced motion', () => {
      mockMediaQueryList.matches = true;
      
      // Reset cache to pick up new mock value
      _resetMediaQueryListCache();
      
      expect(prefersReducedMotion()).toBe(true);
    });
    
    it('should call matchMedia with correct query', () => {
      prefersReducedMotion();
      
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });
    
    it('should return false when matchMedia is not supported', () => {
      // Simulate environment without matchMedia
      window.matchMedia = undefined as unknown as typeof window.matchMedia;
      _resetMediaQueryListCache();
      
      expect(prefersReducedMotion()).toBe(false);
    });
  });
  
  describe('onMotionPreferenceChange', () => {
    it('should register a change listener', () => {
      const callback = vi.fn();
      
      onMotionPreferenceChange(callback);
      
      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
    
    it('should call callback when preference changes', () => {
      const callback = vi.fn();
      
      onMotionPreferenceChange(callback);
      
      // Get the registered handler
      const handler = mockMediaQueryList.addEventListener.mock.calls[0]?.[1];
      expect(handler).toBeDefined();
      
      // Simulate preference change to reduced motion
      handler!({ matches: true } as MediaQueryListEvent);
      
      expect(callback).toHaveBeenCalledWith(true);
    });
    
    it('should call callback with false when preference changes to no reduced motion', () => {
      const callback = vi.fn();
      
      onMotionPreferenceChange(callback);
      
      // Get the registered handler
      const handler = mockMediaQueryList.addEventListener.mock.calls[0]?.[1];
      expect(handler).toBeDefined();
      
      // Simulate preference change to no reduced motion
      handler!({ matches: false } as MediaQueryListEvent);
      
      expect(callback).toHaveBeenCalledWith(false);
    });
    
    it('should return a cleanup function that removes the listener', () => {
      const callback = vi.fn();
      
      const unsubscribe = onMotionPreferenceChange(callback);
      
      // Call cleanup
      unsubscribe();
      
      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
    
    it('should return no-op cleanup when matchMedia is not supported', () => {
      window.matchMedia = undefined as unknown as typeof window.matchMedia;
      _resetMediaQueryListCache();
      
      const callback = vi.fn();
      const unsubscribe = onMotionPreferenceChange(callback);
      
      // Should not throw
      expect(() => unsubscribe()).not.toThrow();
    });
    
    it('should use addListener fallback for older browsers', () => {
      // Simulate older browser without addEventListener
      mockMediaQueryList.addEventListener = undefined as unknown as ReturnType<typeof vi.fn>;
      _resetMediaQueryListCache();
      
      const callback = vi.fn();
      onMotionPreferenceChange(callback);
      
      expect(mockMediaQueryList.addListener).toHaveBeenCalledWith(expect.any(Function));
    });
  });
  
  describe('initMotionPreference', () => {
    it('should add reduced-motion class when user prefers reduced motion', () => {
      mockMediaQueryList.matches = true;
      _resetMediaQueryListCache();
      
      initMotionPreference();
      
      expect(document.documentElement.classList.contains(REDUCED_MOTION_CLASS)).toBe(true);
    });
    
    it('should not add reduced-motion class when user does not prefer reduced motion', () => {
      mockMediaQueryList.matches = false;
      
      initMotionPreference();
      
      expect(document.documentElement.classList.contains(REDUCED_MOTION_CLASS)).toBe(false);
    });
    
    it('should update class when preference changes to reduced motion', () => {
      mockMediaQueryList.matches = false;
      
      initMotionPreference();
      
      // Get the registered handler
      const handler = mockMediaQueryList.addEventListener.mock.calls[0]?.[1];
      expect(handler).toBeDefined();
      
      // Simulate preference change to reduced motion
      handler!({ matches: true } as MediaQueryListEvent);
      
      expect(document.documentElement.classList.contains(REDUCED_MOTION_CLASS)).toBe(true);
    });
    
    it('should remove class when preference changes to no reduced motion', () => {
      mockMediaQueryList.matches = true;
      _resetMediaQueryListCache();
      
      initMotionPreference();
      
      // Verify class is initially added
      expect(document.documentElement.classList.contains(REDUCED_MOTION_CLASS)).toBe(true);
      
      // Get the registered handler
      const handler = mockMediaQueryList.addEventListener.mock.calls[0]?.[1];
      expect(handler).toBeDefined();
      
      // Simulate preference change to no reduced motion
      handler!({ matches: false } as MediaQueryListEvent);
      
      expect(document.documentElement.classList.contains(REDUCED_MOTION_CLASS)).toBe(false);
    });
    
    it('should return cleanup function that removes listener and class', () => {
      mockMediaQueryList.matches = true;
      _resetMediaQueryListCache();
      
      const cleanup = initMotionPreference();
      
      // Verify class is added
      expect(document.documentElement.classList.contains(REDUCED_MOTION_CLASS)).toBe(true);
      
      // Call cleanup
      cleanup();
      
      // Verify listener is removed
      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalled();
      
      // Verify class is removed
      expect(document.documentElement.classList.contains(REDUCED_MOTION_CLASS)).toBe(false);
    });
  });
  
  describe('REDUCED_MOTION_CLASS constant', () => {
    it('should be "reduced-motion"', () => {
      expect(REDUCED_MOTION_CLASS).toBe('reduced-motion');
    });
  });
});


/**
 * Property-based tests for Motion Preference Detection
 * 
 * Feature: valentine-love-website, Property 12: Reduced Motion Preference
 * Validates: Requirements 7.6
 */
import * as fc from 'fast-check';

/**
 * Helper to create a mock MediaQueryList for property tests
 */
function createMockMediaQueryList(matches: boolean) {
  let changeHandler: ((event: { matches: boolean }) => void) | null = null;
  
  return {
    mql: {
      matches,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: (event: string, handler: (event: { matches: boolean }) => void) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      },
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => true,
    },
    triggerChange: (newMatches: boolean) => {
      if (changeHandler) {
        changeHandler({ matches: newMatches });
      }
    },
  };
}

describe('Property 12: Reduced Motion Preference', () => {
  // Store original matchMedia
  const originalMatchMedia = window.matchMedia;
  
  beforeEach(() => {
    // Reset the cached MediaQueryList before each test
    _resetMediaQueryListCache();
    
    // Clean up document classes
    document.documentElement.classList.remove(REDUCED_MOTION_CLASS);
  });
  
  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
    
    // Clean up document classes
    document.documentElement.classList.remove(REDUCED_MOTION_CLASS);
    
    // Reset cache
    _resetMediaQueryListCache();
  });
  
  /**
   * Property test: For any boolean motion preference value, the initMotionPreference
   * function SHALL correctly apply or remove the REDUCED_MOTION_CLASS based on the preference.
   * 
   * **Validates: Requirements 7.6**
   */
  it('should correctly apply REDUCED_MOTION_CLASS based on motion preference', () => {
    // Feature: valentine-love-website, Property 12: Reduced Motion Preference
    fc.assert(
      fc.property(
        fc.boolean(),
        (prefersReduced: boolean) => {
          // Reset state before each iteration
          _resetMediaQueryListCache();
          document.documentElement.classList.remove(REDUCED_MOTION_CLASS);
          
          // Create mock MediaQueryList with the generated preference
          const { mql } = createMockMediaQueryList(prefersReduced);
          
          // Mock window.matchMedia
          window.matchMedia = () => mql as unknown as MediaQueryList;
          
          // Initialize motion preference
          const cleanup = initMotionPreference();
          
          // Property: When prefers-reduced-motion is true, REDUCED_MOTION_CLASS should be applied
          // When prefers-reduced-motion is false, REDUCED_MOTION_CLASS should NOT be applied
          const hasClass = document.documentElement.classList.contains(REDUCED_MOTION_CLASS);
          
          // Clean up
          cleanup();
          
          // Assert the property
          return hasClass === prefersReduced;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property test: For any sequence of motion preference changes, the class state
   * SHALL always reflect the most recent preference value.
   * 
   * **Validates: Requirements 7.6**
   */
  it('should correctly update REDUCED_MOTION_CLASS when preference changes', () => {
    // Feature: valentine-love-website, Property 12: Reduced Motion Preference
    fc.assert(
      fc.property(
        fc.boolean(), // initial preference
        fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }), // sequence of preference changes
        (initialPreference: boolean, preferenceChanges: boolean[]) => {
          // Reset state
          _resetMediaQueryListCache();
          document.documentElement.classList.remove(REDUCED_MOTION_CLASS);
          
          // Create mock MediaQueryList
          const { mql, triggerChange } = createMockMediaQueryList(initialPreference);
          
          // Mock window.matchMedia
          window.matchMedia = () => mql as unknown as MediaQueryList;
          
          // Initialize motion preference
          const cleanup = initMotionPreference();
          
          // Verify initial state
          let expectedState = initialPreference;
          let currentState = document.documentElement.classList.contains(REDUCED_MOTION_CLASS);
          
          if (currentState !== expectedState) {
            cleanup();
            return false;
          }
          
          // Simulate preference changes
          for (const newPreference of preferenceChanges) {
            triggerChange(newPreference);
            expectedState = newPreference;
            currentState = document.documentElement.classList.contains(REDUCED_MOTION_CLASS);
            
            if (currentState !== expectedState) {
              cleanup();
              return false;
            }
          }
          
          // Clean up
          cleanup();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property test: The prefersReducedMotion function SHALL return the correct
   * boolean value matching the media query state.
   * 
   * **Validates: Requirements 7.6**
   */
  it('should correctly detect motion preference via prefersReducedMotion function', () => {
    // Feature: valentine-love-website, Property 12: Reduced Motion Preference
    fc.assert(
      fc.property(
        fc.boolean(),
        (prefersReduced: boolean) => {
          // Reset state
          _resetMediaQueryListCache();
          
          // Create mock MediaQueryList with the generated preference
          const { mql } = createMockMediaQueryList(prefersReduced);
          
          // Mock window.matchMedia
          window.matchMedia = () => mql as unknown as MediaQueryList;
          
          // Property: prefersReducedMotion() should return the same value as matches
          const result = prefersReducedMotion();
          
          return result === prefersReduced;
        }
      ),
      { numRuns: 100 }
    );
  });
});
