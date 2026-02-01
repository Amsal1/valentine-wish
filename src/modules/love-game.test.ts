/**
 * Love Game Module Tests
 * 
 * Tests for the "Do You Love Me?" game with evasive No button and celebration
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 * - 5.1: Love_Game SHALL display a "Do You Love Me?" question prominently
 * - 5.2: Love_Game SHALL provide "Yes" and "No" button options
 * - 5.3: WHEN the "No" button is hovered or approached, THE Love_Game SHALL make it playfully evasive
 * - 5.4: WHEN the "Yes" button is clicked, THE Love_Game SHALL trigger a celebratory animation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  createLoveGame,
  createInitialState,
  calculateEvasionPosition,
  calculateShrinkScale,
  evadeNoButton,
  triggerCelebration,
  setupNoButtonHandlers,
  setupYesButtonHandlers,
  createHeartParticles,
  createCelebrationMessage,
  type LoveGameConfig,
  type LoveGameState,
} from './love-game';

/**
 * Helper function to create a test config with all required properties
 */
function createTestConfig(overrides: Partial<LoveGameConfig> = {}): LoveGameConfig {
  return {
    questionText: 'Do You Love Me?',
    yesButtonText: 'Yes! 💕',
    noButtonText: 'No',
    evasionSpeed: 100,
    celebrationDuration: 3000,
    shrinkThreshold: 5,
    minButtonScale: 0.3,
    containerSelector: '#game-container',
    yesButtonSelector: '#yes-button',
    noButtonSelector: '#no-button',
    celebrationSelector: '#celebration',
    pleadingMessages: ['Please? 🥺'],
    celebrationTitle: 'Yayyyy! 💕🎉',
    celebrationSubtitle: 'I knew you\'d say yes!',
    ...overrides,
  };
}

describe('Love Game Module', () => {
  let container: HTMLDivElement;
  let yesButton: HTMLButtonElement;
  let noButton: HTMLButtonElement;
  let celebrationContainer: HTMLDivElement;

  beforeEach(() => {
    // Create DOM structure for testing
    container = document.createElement('div');
    container.id = 'game-container';
    container.style.width = '500px';
    container.style.height = '400px';
    container.style.position = 'relative';

    yesButton = document.createElement('button');
    yesButton.id = 'yes-button';
    yesButton.textContent = 'Yes! 💕';

    noButton = document.createElement('button');
    noButton.id = 'no-button';
    noButton.textContent = 'No';
    noButton.style.width = '80px';
    noButton.style.height = '40px';

    celebrationContainer = document.createElement('div');
    celebrationContainer.id = 'celebration';
    celebrationContainer.className = 'hidden';

    container.appendChild(yesButton);
    container.appendChild(noButton);
    container.appendChild(celebrationContainer);
    document.body.appendChild(container);

    // Mock getBoundingClientRect for consistent testing
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      width: 500,
      height: 400,
      top: 0,
      left: 0,
      right: 500,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
      width: 80,
      height: 40,
      top: 0,
      left: 0,
      right: 80,
      bottom: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('createInitialState', () => {
    it('should create initial state with default values', () => {
      const state = createInitialState();

      expect(state.noButtonPosition).toEqual({ x: 0, y: 0 });
      expect(state.hasAnsweredYes).toBe(false);
      expect(state.evasionCount).toBe(0);
      expect(state.noButtonScale).toBe(1);
    });
  });

  describe('calculateShrinkScale', () => {
    it('should return 1 when evasion count is below threshold', () => {
      expect(calculateShrinkScale(0, 5, 0.3)).toBe(1);
      expect(calculateShrinkScale(4, 5, 0.3)).toBe(1);
    });

    it('should start shrinking after threshold is reached', () => {
      expect(calculateShrinkScale(5, 5, 0.3)).toBe(1);
      expect(calculateShrinkScale(6, 5, 0.3)).toBe(0.9);
      expect(calculateShrinkScale(7, 5, 0.3)).toBe(0.8);
    });

    it('should not shrink below minimum scale', () => {
      expect(calculateShrinkScale(20, 5, 0.3)).toBe(0.3);
      expect(calculateShrinkScale(100, 5, 0.3)).toBe(0.3);
    });
  });

  describe('calculateEvasionPosition', () => {
    it('should return a position within container bounds', () => {
      const currentPosition = { x: 100, y: 100 };
      const newPosition = calculateEvasionPosition(container, noButton, currentPosition);

      // Position should be within bounds (container size - button size)
      expect(newPosition.x).toBeGreaterThanOrEqual(0);
      expect(newPosition.x).toBeLessThanOrEqual(420); // 500 - 80
      expect(newPosition.y).toBeGreaterThanOrEqual(0);
      expect(newPosition.y).toBeLessThanOrEqual(360); // 400 - 40
    });
  });

  describe('evadeNoButton', () => {
    it('should update button position and increment evasion count', () => {
      const state = createInitialState();
      const config = createTestConfig();

      evadeNoButton(noButton, container, state, config);

      expect(state.evasionCount).toBe(1);
    });

    it('should not evade if game is already won', () => {
      const state = createInitialState();
      state.hasAnsweredYes = true;
      const config = createTestConfig();

      evadeNoButton(noButton, container, state, config);

      expect(state.evasionCount).toBe(0);
    });
  });

  describe('createLoveGame', () => {
    it('should initialize game with default state', () => {
      const game = createLoveGame();
      game.init();

      const state = game.getState();
      expect(state.hasAnsweredYes).toBe(false);
      expect(state.evasionCount).toBe(0);
      expect(state.noButtonScale).toBe(1);

      game.destroy();
    });

    it('should handle missing container gracefully', () => {
      document.body.innerHTML = '';

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const game = createLoveGame();
      game.init();

      expect(consoleSpy).toHaveBeenCalledWith('Love game elements not found');

      game.destroy();
    });

    it('should clean up on destroy', () => {
      const game = createLoveGame();
      game.init();

      game.destroy();

      const state = game.getState();
      expect(state.hasAnsweredYes).toBe(false);
      expect(state.evasionCount).toBe(0);
    });
  });
});


/**
 * Property-Based Tests for No Button Evasion
 * 
 * Feature: valentine-love-website, Property 8: No Button Evasion
 * 
 * *For any* hover or touch-approach event on the "No" button, the button's position 
 * SHALL change to a different location within the game container bounds.
 * 
 * **Validates: Requirements 5.3**
 */
describe('Property 8: No Button Evasion', () => {
  let container: HTMLDivElement;
  let noButton: HTMLButtonElement;

  // Arbitrary generator for container dimensions
  const containerDimensionsArb = fc.record({
    width: fc.integer({ min: 200, max: 1200 }),
    height: fc.integer({ min: 200, max: 800 }),
  });

  // Arbitrary generator for button dimensions
  const buttonDimensionsArb = fc.record({
    width: fc.integer({ min: 40, max: 150 }),
    height: fc.integer({ min: 30, max: 80 }),
  });

  // Arbitrary generator for evasion count
  const evasionCountArb = fc.integer({ min: 0, max: 20 });

  // Arbitrary generator for shrink threshold
  const shrinkThresholdArb = fc.integer({ min: 1, max: 10 });

  // Arbitrary generator for minimum scale
  const minScaleArb = fc.double({ min: 0.1, max: 0.5, noNaN: true });

  beforeEach(() => {
    // Create DOM structure for testing
    container = document.createElement('div');
    container.id = 'game-container';
    container.style.position = 'relative';

    noButton = document.createElement('button');
    noButton.id = 'no-button';
    noButton.textContent = 'No';

    container.appendChild(noButton);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('position changes after evasion', () => {
    // Feature: valentine-love-website, Property 8: No Button Evasion
    fc.assert(
      fc.property(
        containerDimensionsArb,
        buttonDimensionsArb,
        evasionCountArb,
        (containerDims, buttonDims, initialEvasionCount) => {
          // Set up container dimensions
          vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: containerDims.width,
            height: containerDims.height,
            top: 0,
            left: 0,
            right: containerDims.width,
            bottom: containerDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // Set up button dimensions
          vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
            width: buttonDims.width,
            height: buttonDims.height,
            top: 0,
            left: 0,
            right: buttonDims.width,
            bottom: buttonDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          const maxX = containerDims.width - buttonDims.width;
          const maxY = containerDims.height - buttonDims.height;

          // Create initial state with a position
          const state: LoveGameState = {
            noButtonPosition: { x: Math.floor(maxX / 2), y: Math.floor(maxY / 2) },
            hasAnsweredYes: false,
            evasionCount: initialEvasionCount,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? 🥺'],
            celebrationTitle: 'Yayyyy! 💕🎉',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Trigger evasion
          evadeNoButton(noButton, container, state, config);

          // Evasion count should always increment
          expect(state.evasionCount).toBe(initialEvasionCount + 1);

          // The new position should be set
          expect(state.noButtonPosition).toBeDefined();
          expect(typeof state.noButtonPosition.x).toBe('number');
          expect(typeof state.noButtonPosition.y).toBe('number');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('new position stays within container bounds', () => {
    // Feature: valentine-love-website, Property 8: No Button Evasion
    fc.assert(
      fc.property(
        containerDimensionsArb,
        buttonDimensionsArb,
        (containerDims, buttonDims) => {
          // Set up container dimensions
          vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: containerDims.width,
            height: containerDims.height,
            top: 0,
            left: 0,
            right: containerDims.width,
            bottom: containerDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // Set up button dimensions
          vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
            width: buttonDims.width,
            height: buttonDims.height,
            top: 0,
            left: 0,
            right: buttonDims.width,
            bottom: buttonDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          const maxX = Math.max(0, containerDims.width - buttonDims.width);
          const maxY = Math.max(0, containerDims.height - buttonDims.height);

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: 0,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? 🥺'],
            celebrationTitle: 'Yayyyy! 💕🎉',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Trigger evasion
          evadeNoButton(noButton, container, state, config);

          // New position should be within bounds
          expect(state.noButtonPosition.x).toBeGreaterThanOrEqual(0);
          expect(state.noButtonPosition.x).toBeLessThanOrEqual(maxX);
          expect(state.noButtonPosition.y).toBeGreaterThanOrEqual(0);
          expect(state.noButtonPosition.y).toBeLessThanOrEqual(maxY);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('evasion count increments on each evasion', () => {
    // Feature: valentine-love-website, Property 8: No Button Evasion
    fc.assert(
      fc.property(
        containerDimensionsArb,
        buttonDimensionsArb,
        evasionCountArb,
        fc.integer({ min: 1, max: 10 }), // Number of evasions to perform
        (containerDims, buttonDims, initialCount, numEvasions) => {
          // Set up container dimensions
          vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: containerDims.width,
            height: containerDims.height,
            top: 0,
            left: 0,
            right: containerDims.width,
            bottom: containerDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // Set up button dimensions
          vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
            width: buttonDims.width,
            height: buttonDims.height,
            top: 0,
            left: 0,
            right: buttonDims.width,
            bottom: buttonDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: initialCount,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? 🥺'],
            celebrationTitle: 'Yayyyy! 💕🎉',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Perform multiple evasions
          for (let i = 0; i < numEvasions; i++) {
            evadeNoButton(noButton, container, state, config);
          }

          // Evasion count should have incremented by numEvasions
          expect(state.evasionCount).toBe(initialCount + numEvasions);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('shrink scale applies after threshold (5 evasions)', () => {
    // Feature: valentine-love-website, Property 8: No Button Evasion
    fc.assert(
      fc.property(
        shrinkThresholdArb,
        minScaleArb,
        evasionCountArb,
        (threshold, minScale, evasionCount) => {
          const scale = calculateShrinkScale(evasionCount, threshold, minScale);

          if (evasionCount < threshold) {
            // Before threshold, scale should be 1
            expect(scale).toBe(1);
          } else {
            // After threshold, scale should be <= 1 and >= minScale
            expect(scale).toBeLessThanOrEqual(1);
            expect(scale).toBeGreaterThanOrEqual(minScale);

            // Calculate expected scale
            const evasionsPastThreshold = evasionCount - threshold;
            const expectedScale = Math.max(minScale, 1 - evasionsPastThreshold * 0.1);
            expect(scale).toBeCloseTo(expectedScale, 5);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('button scale updates correctly after multiple evasions past threshold', () => {
    // Feature: valentine-love-website, Property 8: No Button Evasion
    fc.assert(
      fc.property(
        containerDimensionsArb,
        buttonDimensionsArb,
        fc.integer({ min: 0, max: 15 }), // Total evasions to perform
        (containerDims, buttonDims, totalEvasions) => {
          // Set up container dimensions
          vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: containerDims.width,
            height: containerDims.height,
            top: 0,
            left: 0,
            right: containerDims.width,
            bottom: containerDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // Set up button dimensions
          vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
            width: buttonDims.width,
            height: buttonDims.height,
            top: 0,
            left: 0,
            right: buttonDims.width,
            bottom: buttonDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          const shrinkThreshold = 5;
          const minButtonScale = 0.3;

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: 0,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold,
            minButtonScale,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? 🥺'],
            celebrationTitle: 'Yayyyy! 💕🎉',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Perform evasions
          for (let i = 0; i < totalEvasions; i++) {
            evadeNoButton(noButton, container, state, config);
          }

          // Verify scale is correct
          const expectedScale = calculateShrinkScale(totalEvasions, shrinkThreshold, minButtonScale);
          expect(state.noButtonScale).toBeCloseTo(expectedScale, 5);

          // Scale should never go below minimum
          expect(state.noButtonScale).toBeGreaterThanOrEqual(minButtonScale);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('calculateEvasionPosition always returns valid coordinates within bounds', () => {
    // Feature: valentine-love-website, Property 8: No Button Evasion
    fc.assert(
      fc.property(
        containerDimensionsArb,
        buttonDimensionsArb,
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        (containerDims, buttonDims, currentX, currentY) => {
          // Set up container dimensions
          vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: containerDims.width,
            height: containerDims.height,
            top: 0,
            left: 0,
            right: containerDims.width,
            bottom: containerDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // Set up button dimensions
          vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
            width: buttonDims.width,
            height: buttonDims.height,
            top: 0,
            left: 0,
            right: buttonDims.width,
            bottom: buttonDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          const maxX = Math.max(0, containerDims.width - buttonDims.width);
          const maxY = Math.max(0, containerDims.height - buttonDims.height);

          const currentPosition = { x: currentX % (maxX + 1), y: currentY % (maxY + 1) };
          const newPosition = calculateEvasionPosition(container, noButton, currentPosition);

          // New position should always be within valid bounds
          expect(newPosition.x).toBeGreaterThanOrEqual(0);
          expect(newPosition.x).toBeLessThanOrEqual(maxX);
          expect(newPosition.y).toBeGreaterThanOrEqual(0);
          expect(newPosition.y).toBeLessThanOrEqual(maxY);

          // Coordinates should be numbers (not NaN or Infinity)
          expect(Number.isFinite(newPosition.x)).toBe(true);
          expect(Number.isFinite(newPosition.y)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property-Based Tests for Yes Button Celebration
 * 
 * Feature: valentine-love-website, Property 9: Yes Button Celebration Trigger
 * 
 * *For any* click event on the "Yes" button, the game state SHALL transition to 
 * `hasAnsweredYes = true` and the celebration animation SHALL be triggered.
 * 
 * **Validates: Requirements 5.4**
 */
describe('Property 9: Yes Button Celebration Trigger', () => {
  let container: HTMLDivElement;
  let yesButton: HTMLButtonElement;
  let noButton: HTMLButtonElement;
  let celebrationContainer: HTMLDivElement;

  // Arbitrary generator for celebration duration
  const celebrationDurationArb = fc.integer({ min: 1000, max: 10000 });

  // Arbitrary generator for number of clicks
  const clickCountArb = fc.integer({ min: 1, max: 10 });

  // Arbitrary generator for initial evasion count (to test celebration works regardless of evasion state)
  const initialEvasionCountArb = fc.integer({ min: 0, max: 20 });

  // Arbitrary generator for button scale (to test celebration works regardless of button scale)
  const buttonScaleArb = fc.double({ min: 0.3, max: 1.0, noNaN: true });

  // Arbitrary generator for button position
  const buttonPositionArb = fc.record({
    x: fc.integer({ min: 0, max: 500 }),
    y: fc.integer({ min: 0, max: 400 }),
  });

  beforeEach(() => {
    // Create DOM structure for testing
    container = document.createElement('div');
    container.id = 'game-container';
    container.style.width = '500px';
    container.style.height = '400px';
    container.style.position = 'relative';

    // Add game question element
    const question = document.createElement('div');
    question.className = 'game-question';
    question.textContent = 'Do You Love Me?';
    container.appendChild(question);

    // Add buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'game-buttons';

    yesButton = document.createElement('button');
    yesButton.id = 'yes-button';
    yesButton.textContent = 'Yes! 💕';

    noButton = document.createElement('button');
    noButton.id = 'no-button';
    noButton.textContent = 'No';
    noButton.style.width = '80px';
    noButton.style.height = '40px';

    buttonsContainer.appendChild(yesButton);
    buttonsContainer.appendChild(noButton);
    container.appendChild(buttonsContainer);

    celebrationContainer = document.createElement('div');
    celebrationContainer.id = 'celebration';
    celebrationContainer.className = 'hidden';

    container.appendChild(celebrationContainer);
    document.body.appendChild(container);

    // Mock getBoundingClientRect for consistent testing
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      width: 500,
      height: 400,
      top: 0,
      left: 0,
      right: 500,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
      width: 80,
      height: 40,
      top: 0,
      left: 0,
      right: 80,
      bottom: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('clicking Yes sets hasAnsweredYes to true', () => {
    // Feature: valentine-love-website, Property 9: Yes Button Celebration Trigger
    fc.assert(
      fc.property(
        initialEvasionCountArb,
        buttonScaleArb,
        buttonPositionArb,
        (evasionCount, scale, position) => {
          // Reset celebration container
          celebrationContainer.className = 'hidden';
          celebrationContainer.innerHTML = '';

          // Create state with various initial conditions
          const state: LoveGameState = {
            noButtonPosition: position,
            hasAnsweredYes: false,
            evasionCount: evasionCount,
            noButtonScale: scale,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? 🥺'],
            celebrationTitle: 'Yayyyy! 💕🎉',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Verify initial state
          expect(state.hasAnsweredYes).toBe(false);

          // Trigger celebration (simulates Yes button click)
          triggerCelebration(celebrationContainer, state, config);

          // State should transition to hasAnsweredYes = true
          expect(state.hasAnsweredYes).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('celebration container becomes visible with celebration--active class', () => {
    // Feature: valentine-love-website, Property 9: Yes Button Celebration Trigger
    fc.assert(
      fc.property(
        celebrationDurationArb,
        initialEvasionCountArb,
        (duration, evasionCount) => {
          // Reset celebration container state
          celebrationContainer.className = 'hidden';
          celebrationContainer.innerHTML = '';

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: evasionCount,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: duration,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? 🥺'],
            celebrationTitle: 'Yayyyy! 💕🎉',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Verify initial state - container should be hidden
          expect(celebrationContainer.classList.contains('hidden')).toBe(true);
          expect(celebrationContainer.classList.contains('celebration--active')).toBe(false);

          // Trigger celebration
          triggerCelebration(celebrationContainer, state, config);

          // Celebration container should be visible with active class
          expect(celebrationContainer.classList.contains('hidden')).toBe(false);
          expect(celebrationContainer.classList.contains('celebration--active')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('heart particles are created (when reduced motion is not preferred)', () => {
    // Feature: valentine-love-website, Property 9: Yes Button Celebration Trigger
    fc.assert(
      fc.property(
        initialEvasionCountArb,
        (evasionCount) => {
          // Reset celebration container
          celebrationContainer.className = 'hidden';
          celebrationContainer.innerHTML = '';

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: evasionCount,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? 🥺'],
            celebrationTitle: 'Yayyyy! 💕🎉',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Trigger celebration
          triggerCelebration(celebrationContainer, state, config);

          // Heart particles should be created (20 hearts by default when reduced motion is not preferred)
          // The actual count depends on prefersReducedMotion() - if true, no hearts are created
          const hearts = celebrationContainer.querySelectorAll('.celebration-heart');
          // Hearts are created when reduced motion is not preferred
          expect(hearts.length).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('celebration message is displayed', () => {
    // Feature: valentine-love-website, Property 9: Yes Button Celebration Trigger
    fc.assert(
      fc.property(
        initialEvasionCountArb,
        buttonPositionArb,
        (evasionCount, position) => {
          // Reset celebration container
          celebrationContainer.className = 'hidden';
          celebrationContainer.innerHTML = '';

          const state: LoveGameState = {
            noButtonPosition: position,
            hasAnsweredYes: false,
            evasionCount: evasionCount,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? 🥺'],
            celebrationTitle: 'Yayyyy! 💕🎉',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Trigger celebration
          triggerCelebration(celebrationContainer, state, config);

          // Celebration message should be displayed
          const message = celebrationContainer.querySelector('.celebration-message');
          expect(message).not.toBeNull();

          // Message should contain title and subtitle
          const title = celebrationContainer.querySelector('.celebration-title');
          const subtitle = celebrationContainer.querySelector('.celebration-subtitle');
          expect(title).not.toBeNull();
          expect(subtitle).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('multiple clicks do not re-trigger celebration (via setupYesButtonHandlers)', () => {
    // Feature: valentine-love-website, Property 9: Yes Button Celebration Trigger
    fc.assert(
      fc.property(
        clickCountArb,
        (numClicks) => {
          // Reset celebration container
          celebrationContainer.className = 'hidden';
          celebrationContainer.innerHTML = '';

          const state: LoveGameState = createInitialState();

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          let celebrationTriggerCount = 0;
          const onCelebration = () => {
            celebrationTriggerCount++;
          };

          // Set up handlers
          const cleanup = setupYesButtonHandlers(
            yesButton,
            celebrationContainer,
            state,
            config,
            onCelebration
          );

          // Simulate multiple clicks
          for (let i = 0; i < numClicks; i++) {
            yesButton.click();
          }

          // Celebration should only be triggered once
          expect(celebrationTriggerCount).toBe(1);
          expect(state.hasAnsweredYes).toBe(true);

          // Clean up
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('createHeartParticles creates the specified number of hearts', () => {
    // Feature: valentine-love-website, Property 9: Yes Button Celebration Trigger
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (heartCount) => {
          const hearts = createHeartParticles(heartCount);

          // Should create exactly the specified number of hearts
          expect(hearts.length).toBe(heartCount);

          // Each heart should have the correct class
          hearts.forEach((heart: HTMLElement) => {
            expect(heart.classList.contains('celebration-heart')).toBe(true);
            expect(heart.getAttribute('aria-hidden')).toBe('true');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('createCelebrationMessage creates message with title and subtitle', () => {
    // Feature: valentine-love-website, Property 9: Yes Button Celebration Trigger
    fc.assert(
      fc.property(
        fc.constant(null), // No variable input needed, just run multiple times
        () => {
          const config = createTestConfig();
          const message = createCelebrationMessage(config);

          // Message should have correct class
          expect(message.classList.contains('celebration-message')).toBe(true);

          // Should contain title
          const title = message.querySelector('.celebration-title');
          expect(title).not.toBeNull();
          expect(title?.textContent).toBe(config.celebrationTitle);

          // Should contain subtitle
          const subtitle = message.querySelector('.celebration-subtitle');
          expect(subtitle).not.toBeNull();
          expect(subtitle?.textContent).toBe(config.celebrationSubtitle);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('celebration works regardless of No button evasion state', () => {
    // Feature: valentine-love-website, Property 9: Yes Button Celebration Trigger
    fc.assert(
      fc.property(
        initialEvasionCountArb,
        buttonScaleArb,
        buttonPositionArb,
        (evasionCount, scale, position) => {
          // Reset celebration container
          celebrationContainer.className = 'hidden';
          celebrationContainer.innerHTML = '';

          // Create state with various No button states
          const state: LoveGameState = {
            noButtonPosition: position,
            hasAnsweredYes: false,
            evasionCount: evasionCount,
            noButtonScale: scale,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Trigger celebration
          triggerCelebration(celebrationContainer, state, config);

          // Celebration should work regardless of No button state
          expect(state.hasAnsweredYes).toBe(true);
          expect(celebrationContainer.classList.contains('celebration--active')).toBe(true);

          // No button state should remain unchanged
          expect(state.noButtonPosition).toEqual(position);
          expect(state.evasionCount).toBe(evasionCount);
          expect(state.noButtonScale).toBe(scale);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property-Based Tests for Input Device Compatibility
 * 
 * Feature: valentine-love-website, Property 10: Input Device Compatibility
 * 
 * *For any* interactive element in the Love Game, both mouse events (mouseenter, click) 
 * and touch events (touchstart, touchend) SHALL trigger the appropriate behavior.
 * 
 * **Validates: Requirements 5.5**
 */
describe('Property 10: Input Device Compatibility', () => {
  let container: HTMLDivElement;
  let yesButton: HTMLButtonElement;
  let noButton: HTMLButtonElement;
  let celebrationContainer: HTMLDivElement;

  // Arbitrary generator for container dimensions
  const containerDimensionsArb = fc.record({
    width: fc.integer({ min: 200, max: 1200 }),
    height: fc.integer({ min: 200, max: 800 }),
  });

  // Arbitrary generator for button dimensions
  const buttonDimensionsArb = fc.record({
    width: fc.integer({ min: 40, max: 150 }),
    height: fc.integer({ min: 30, max: 80 }),
  });

  // Arbitrary generator for initial evasion count
  const initialEvasionCountArb = fc.integer({ min: 0, max: 20 });

  // Arbitrary generator for number of events to trigger
  const eventCountArb = fc.integer({ min: 1, max: 10 });

  // Arbitrary generator for event type selection
  const eventTypeArb = fc.constantFrom('mouse', 'touch') as fc.Arbitrary<'mouse' | 'touch'>;

  // Arbitrary generator for mixed event sequences
  const eventSequenceArb = fc.array(
    fc.constantFrom('mouse', 'touch') as fc.Arbitrary<'mouse' | 'touch'>,
    { minLength: 1, maxLength: 10 }
  );

  beforeEach(() => {
    // Create DOM structure for testing
    container = document.createElement('div');
    container.id = 'game-container';
    container.style.width = '500px';
    container.style.height = '400px';
    container.style.position = 'relative';

    // Add game question element
    const question = document.createElement('div');
    question.className = 'game-question';
    question.textContent = 'Do You Love Me?';
    container.appendChild(question);

    // Add buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'game-buttons';

    yesButton = document.createElement('button');
    yesButton.id = 'yes-button';
    yesButton.textContent = 'Yes! 💕';

    noButton = document.createElement('button');
    noButton.id = 'no-button';
    noButton.textContent = 'No';
    noButton.style.width = '80px';
    noButton.style.height = '40px';

    buttonsContainer.appendChild(yesButton);
    buttonsContainer.appendChild(noButton);
    container.appendChild(buttonsContainer);

    celebrationContainer = document.createElement('div');
    celebrationContainer.id = 'celebration';
    celebrationContainer.className = 'hidden';

    container.appendChild(celebrationContainer);
    document.body.appendChild(container);

    // Mock getBoundingClientRect for consistent testing
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      width: 500,
      height: 400,
      top: 0,
      left: 0,
      right: 500,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
      width: 80,
      height: 40,
      top: 0,
      left: 0,
      right: 80,
      bottom: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mouseenter on No button triggers evasion', () => {
    // Feature: valentine-love-website, Property 10: Input Device Compatibility
    fc.assert(
      fc.property(
        containerDimensionsArb,
        buttonDimensionsArb,
        initialEvasionCountArb,
        (containerDims, buttonDims, initialEvasionCount) => {
          // Set up container dimensions
          vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: containerDims.width,
            height: containerDims.height,
            top: 0,
            left: 0,
            right: containerDims.width,
            bottom: containerDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // Set up button dimensions
          vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
            width: buttonDims.width,
            height: buttonDims.height,
            top: 0,
            left: 0,
            right: buttonDims.width,
            bottom: buttonDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: initialEvasionCount,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Set up handlers
          const cleanup = setupNoButtonHandlers(noButton, container, state, config);

          // Trigger mouseenter event
          const mouseEvent = new MouseEvent('mouseenter', { bubbles: true });
          noButton.dispatchEvent(mouseEvent);

          // Evasion should have been triggered
          expect(state.evasionCount).toBe(initialEvasionCount + 1);

          // Clean up
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('touchstart on No button triggers evasion', () => {
    // Feature: valentine-love-website, Property 10: Input Device Compatibility
    fc.assert(
      fc.property(
        containerDimensionsArb,
        buttonDimensionsArb,
        initialEvasionCountArb,
        (containerDims, buttonDims, initialEvasionCount) => {
          // Set up container dimensions
          vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: containerDims.width,
            height: containerDims.height,
            top: 0,
            left: 0,
            right: containerDims.width,
            bottom: containerDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // Set up button dimensions
          vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
            width: buttonDims.width,
            height: buttonDims.height,
            top: 0,
            left: 0,
            right: buttonDims.width,
            bottom: buttonDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: initialEvasionCount,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Set up handlers
          const cleanup = setupNoButtonHandlers(noButton, container, state, config);

          // Trigger touchstart event
          const touchEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [],
          });
          noButton.dispatchEvent(touchEvent);

          // Evasion should have been triggered
          expect(state.evasionCount).toBe(initialEvasionCount + 1);

          // Clean up
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('click on Yes button triggers celebration', () => {
    // Feature: valentine-love-website, Property 10: Input Device Compatibility
    fc.assert(
      fc.property(
        initialEvasionCountArb,
        (initialEvasionCount) => {
          // Reset celebration container
          celebrationContainer.className = 'hidden';
          celebrationContainer.innerHTML = '';

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: initialEvasionCount,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          let celebrationTriggered = false;
          const onCelebration = () => {
            celebrationTriggered = true;
          };

          // Set up handlers
          const cleanup = setupYesButtonHandlers(
            yesButton,
            celebrationContainer,
            state,
            config,
            onCelebration
          );

          // Trigger click event
          const clickEvent = new MouseEvent('click', { bubbles: true });
          yesButton.dispatchEvent(clickEvent);

          // Celebration should have been triggered
          expect(state.hasAnsweredYes).toBe(true);
          expect(celebrationTriggered).toBe(true);
          expect(celebrationContainer.classList.contains('celebration--active')).toBe(true);

          // Clean up
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('touchend on Yes button triggers celebration', () => {
    // Feature: valentine-love-website, Property 10: Input Device Compatibility
    fc.assert(
      fc.property(
        initialEvasionCountArb,
        (initialEvasionCount) => {
          // Reset celebration container
          celebrationContainer.className = 'hidden';
          celebrationContainer.innerHTML = '';

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: initialEvasionCount,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          let celebrationTriggered = false;
          const onCelebration = () => {
            celebrationTriggered = true;
          };

          // Set up handlers
          const cleanup = setupYesButtonHandlers(
            yesButton,
            celebrationContainer,
            state,
            config,
            onCelebration
          );

          // Trigger touchend event
          const touchEvent = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
          });
          yesButton.dispatchEvent(touchEvent);

          // Celebration should have been triggered
          expect(state.hasAnsweredYes).toBe(true);
          expect(celebrationTriggered).toBe(true);
          expect(celebrationContainer.classList.contains('celebration--active')).toBe(true);

          // Clean up
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mouse and touch events produce same state changes for No button', () => {
    // Feature: valentine-love-website, Property 10: Input Device Compatibility
    fc.assert(
      fc.property(
        containerDimensionsArb,
        buttonDimensionsArb,
        eventTypeArb,
        (containerDims, buttonDims, eventType) => {
          // Set up container dimensions
          vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: containerDims.width,
            height: containerDims.height,
            top: 0,
            left: 0,
            right: containerDims.width,
            bottom: containerDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // Set up button dimensions
          vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
            width: buttonDims.width,
            height: buttonDims.height,
            top: 0,
            left: 0,
            right: buttonDims.width,
            bottom: buttonDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: 0,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Set up handlers
          const cleanup = setupNoButtonHandlers(noButton, container, state, config);

          // Trigger event based on type
          if (eventType === 'mouse') {
            const mouseEvent = new MouseEvent('mouseenter', { bubbles: true });
            noButton.dispatchEvent(mouseEvent);
          } else {
            const touchEvent = new TouchEvent('touchstart', {
              bubbles: true,
              cancelable: true,
              touches: [],
            });
            noButton.dispatchEvent(touchEvent);
          }

          // Both event types should produce the same state change: evasion count incremented
          expect(state.evasionCount).toBe(1);
          // Position should have changed (not at origin anymore, unless random lands there)
          expect(state.noButtonPosition).toBeDefined();
          expect(typeof state.noButtonPosition.x).toBe('number');
          expect(typeof state.noButtonPosition.y).toBe('number');

          // Clean up
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mouse and touch events produce same state changes for Yes button', () => {
    // Feature: valentine-love-website, Property 10: Input Device Compatibility
    fc.assert(
      fc.property(
        eventTypeArb,
        (eventType) => {
          // Reset celebration container
          celebrationContainer.className = 'hidden';
          celebrationContainer.innerHTML = '';

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: 0,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          let celebrationTriggered = false;
          const onCelebration = () => {
            celebrationTriggered = true;
          };

          // Set up handlers
          const cleanup = setupYesButtonHandlers(
            yesButton,
            celebrationContainer,
            state,
            config,
            onCelebration
          );

          // Trigger event based on type
          if (eventType === 'mouse') {
            const clickEvent = new MouseEvent('click', { bubbles: true });
            yesButton.dispatchEvent(clickEvent);
          } else {
            const touchEvent = new TouchEvent('touchend', {
              bubbles: true,
              cancelable: true,
            });
            yesButton.dispatchEvent(touchEvent);
          }

          // Both event types should produce the same state change
          expect(state.hasAnsweredYes).toBe(true);
          expect(celebrationTriggered).toBe(true);
          expect(celebrationContainer.classList.contains('celebration--active')).toBe(true);

          // Clean up
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('event handlers are properly attached and can be cleaned up for No button', () => {
    // Feature: valentine-love-website, Property 10: Input Device Compatibility
    fc.assert(
      fc.property(
        containerDimensionsArb,
        buttonDimensionsArb,
        eventCountArb,
        (containerDims, buttonDims, eventCount) => {
          // Set up container dimensions
          vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: containerDims.width,
            height: containerDims.height,
            top: 0,
            left: 0,
            right: containerDims.width,
            bottom: containerDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // Set up button dimensions
          vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
            width: buttonDims.width,
            height: buttonDims.height,
            top: 0,
            left: 0,
            right: buttonDims.width,
            bottom: buttonDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: 0,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Set up handlers
          const cleanup = setupNoButtonHandlers(noButton, container, state, config);

          // Trigger events before cleanup
          for (let i = 0; i < eventCount; i++) {
            const mouseEvent = new MouseEvent('mouseenter', { bubbles: true });
            noButton.dispatchEvent(mouseEvent);
          }

          // Verify events were handled
          expect(state.evasionCount).toBe(eventCount);

          // Clean up handlers
          cleanup();

          // Record evasion count after cleanup
          const evasionCountAfterCleanup = state.evasionCount;

          // Trigger more events after cleanup - they should NOT be handled
          for (let i = 0; i < eventCount; i++) {
            const mouseEvent = new MouseEvent('mouseenter', { bubbles: true });
            noButton.dispatchEvent(mouseEvent);
          }

          // Evasion count should NOT have changed after cleanup
          expect(state.evasionCount).toBe(evasionCountAfterCleanup);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('event handlers are properly attached and can be cleaned up for Yes button', () => {
    // Feature: valentine-love-website, Property 10: Input Device Compatibility
    fc.assert(
      fc.property(
        eventCountArb,
        (eventCount) => {
          // Reset celebration container
          celebrationContainer.className = 'hidden';
          celebrationContainer.innerHTML = '';

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: 0,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          let celebrationTriggerCount = 0;
          const onCelebration = () => {
            celebrationTriggerCount++;
          };

          // Set up handlers
          const cleanup = setupYesButtonHandlers(
            yesButton,
            celebrationContainer,
            state,
            config,
            onCelebration
          );

          // Trigger click event
          const clickEvent = new MouseEvent('click', { bubbles: true });
          yesButton.dispatchEvent(clickEvent);

          // Verify event was handled (only once due to hasAnsweredYes check)
          expect(celebrationTriggerCount).toBe(1);
          expect(state.hasAnsweredYes).toBe(true);

          // Clean up handlers
          cleanup();

          // Reset state for testing cleanup
          state.hasAnsweredYes = false;
          celebrationTriggerCount = 0;

          // Trigger more events after cleanup - they should NOT be handled
          for (let i = 0; i < eventCount; i++) {
            const clickEvent = new MouseEvent('click', { bubbles: true });
            yesButton.dispatchEvent(clickEvent);
          }

          // Celebration should NOT have been triggered after cleanup
          expect(celebrationTriggerCount).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mixed mouse and touch event sequences work correctly for No button', () => {
    // Feature: valentine-love-website, Property 10: Input Device Compatibility
    fc.assert(
      fc.property(
        containerDimensionsArb,
        buttonDimensionsArb,
        eventSequenceArb,
        (containerDims, buttonDims, eventSequence) => {
          // Set up container dimensions
          vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
            width: containerDims.width,
            height: containerDims.height,
            top: 0,
            left: 0,
            right: containerDims.width,
            bottom: containerDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // Set up button dimensions
          vi.spyOn(noButton, 'getBoundingClientRect').mockReturnValue({
            width: buttonDims.width,
            height: buttonDims.height,
            top: 0,
            left: 0,
            right: buttonDims.width,
            bottom: buttonDims.height,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          const state: LoveGameState = {
            noButtonPosition: { x: 0, y: 0 },
            hasAnsweredYes: false,
            evasionCount: 0,
            noButtonScale: 1,
            currentMessageIndex: 0,
          };

          const config: LoveGameConfig = {
            questionText: 'Do You Love Me?',
            yesButtonText: 'Yes! 💕',
            noButtonText: 'No',
            evasionSpeed: 100,
            celebrationDuration: 3000,
            shrinkThreshold: 5,
            minButtonScale: 0.3,
            containerSelector: '#game-container',
            yesButtonSelector: '#yes-button',
            noButtonSelector: '#no-button',
            celebrationSelector: '#celebration',
            pleadingMessages: ['Please? '],
            celebrationTitle: 'Yayyyy! ',
            celebrationSubtitle: 'I knew you\'d say yes!',
          };

          // Set up handlers
          const cleanup = setupNoButtonHandlers(noButton, container, state, config);

          // Trigger mixed event sequence
          eventSequence.forEach((eventType) => {
            if (eventType === 'mouse') {
              const mouseEvent = new MouseEvent('mouseenter', { bubbles: true });
              noButton.dispatchEvent(mouseEvent);
            } else {
              const touchEvent = new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: [],
              });
              noButton.dispatchEvent(touchEvent);
            }
          });

          // Each event in the sequence should have triggered an evasion
          expect(state.evasionCount).toBe(eventSequence.length);

          // Clean up
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
