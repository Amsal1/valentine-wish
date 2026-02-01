/**
 * Love Game Module
 * 
 * @module love-game
 * @description Interactive "Do You Love Me?" game with evasive No button and celebration
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 * - 5.1: Love_Game SHALL display a "Do You Love Me?" question prominently
 * - 5.2: Love_Game SHALL provide "Yes" and "No" button options
 * - 5.3: WHEN the "No" button is hovered or approached, THE Love_Game SHALL make it playfully evasive
 * - 5.4: WHEN the "Yes" button is clicked, THE Love_Game SHALL trigger a celebratory animation
 */

import { addClass, removeClass, setStyles, createElement } from '../utils/dom';
import { prefersReducedMotion } from '../utils/motion';
import { siteConfig } from '../config';

/**
 * Configuration options for the love game
 */
export interface LoveGameConfig {
  /** The question text to display */
  questionText: string;
  /** Text for the Yes button */
  yesButtonText: string;
  /** Text for the No button */
  noButtonText: string;
  /** Speed of evasion movement (pixels) */
  evasionSpeed: number;
  /** Duration of celebration animation (ms) */
  celebrationDuration: number;
  /** Number of evasions before shrinking starts */
  shrinkThreshold: number;
  /** Minimum size of No button after shrinking (percentage) */
  minButtonScale: number;
  /** CSS selector for the game container */
  containerSelector: string;
  /** CSS selector for the Yes button */
  yesButtonSelector: string;
  /** CSS selector for the No button */
  noButtonSelector: string;
  /** CSS selector for the celebration container */
  celebrationSelector: string;
  /** Pleading messages shown when No is clicked/hovered (Hinglish) */
  pleadingMessages: string[];
  /** Celebration title text */
  celebrationTitle: string;
  /** Celebration subtitle text */
  celebrationSubtitle: string;
}

/**
 * State of the love game
 */
export interface LoveGameState {
  /** Current position of the No button */
  noButtonPosition: { x: number; y: number };
  /** Whether the user has clicked Yes */
  hasAnsweredYes: boolean;
  /** Number of times the No button has evaded */
  evasionCount: number;
  /** Current scale of the No button (1 = 100%) */
  noButtonScale: number;
  /** Current pleading message index */
  currentMessageIndex: number;
}

/**
 * Pleading messages in Hinglish/casual English for when No is clicked
 * Now loaded from site config
 */
const PLEADING_MESSAGES: string[] = siteConfig.loveGame.pleadingMessages;

/**
 * Default configuration for the love game
 * Uses values from site config for personalization
 */
const DEFAULT_CONFIG: LoveGameConfig = {
  questionText: siteConfig.loveGame.question,
  yesButtonText: siteConfig.loveGame.yesButtonText,
  noButtonText: siteConfig.loveGame.noButtonText,
  evasionSpeed: 100,
  celebrationDuration: 3000,
  shrinkThreshold: 5,
  minButtonScale: 0.3,
  containerSelector: '#game-container',
  yesButtonSelector: '#yes-button',
  noButtonSelector: '#no-button',
  celebrationSelector: '#celebration',
  pleadingMessages: PLEADING_MESSAGES,
  celebrationTitle: siteConfig.loveGame.celebrationTitle,
  celebrationSubtitle: siteConfig.loveGame.celebrationSubtitle,
};

/**
 * Creates the initial state for the love game
 * @returns Initial game state
 */
export function createInitialState(): LoveGameState {
  return {
    noButtonPosition: { x: 0, y: 0 },
    hasAnsweredYes: false,
    evasionCount: 0,
    noButtonScale: 1,
    currentMessageIndex: 0,
  };
}

/**
 * Calculates a random position within the container bounds
 * Ensures the button stays within visible area
 * 
 * @param container - The container element
 * @param button - The button element
 * @param currentPosition - Current button position
 * @returns New position coordinates
 */
export function calculateEvasionPosition(
  container: HTMLElement,
  button: HTMLElement,
  currentPosition: { x: number; y: number }
): { x: number; y: number } {
  const containerRect = container.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  
  // Calculate available space
  const maxX = containerRect.width - buttonRect.width;
  const maxY = containerRect.height - buttonRect.height;
  
  // Ensure we have valid bounds
  const safeMaxX = Math.max(0, maxX);
  const safeMaxY = Math.max(0, maxY);
  
  // Generate random position that's different from current
  let newX: number;
  let newY: number;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    newX = Math.random() * safeMaxX;
    newY = Math.random() * safeMaxY;
    attempts++;
  } while (
    attempts < maxAttempts &&
    Math.abs(newX - currentPosition.x) < 50 &&
    Math.abs(newY - currentPosition.y) < 50
  );
  
  return { x: newX, y: newY };
}

/**
 * Calculates the shrink scale based on evasion count
 * Button starts shrinking after threshold is reached
 * 
 * @param evasionCount - Number of evasions
 * @param shrinkThreshold - Number of evasions before shrinking starts
 * @param minScale - Minimum scale value
 * @returns Scale value between minScale and 1
 */
export function calculateShrinkScale(
  evasionCount: number,
  shrinkThreshold: number,
  minScale: number
): number {
  if (evasionCount < shrinkThreshold) {
    return 1;
  }
  
  // Calculate how many evasions past threshold
  const evasionsPastThreshold = evasionCount - shrinkThreshold;
  
  // Shrink by 10% for each evasion past threshold
  const shrinkAmount = evasionsPastThreshold * 0.1;
  const newScale = 1 - shrinkAmount;
  
  // Clamp to minimum scale
  return Math.max(minScale, newScale);
}

/**
 * Moves the No button to a new evasive position
 * Requirement 5.3: WHEN the "No" button is hovered or approached, 
 * THE Love_Game SHALL make it playfully evasive
 * 
 * @param button - The No button element
 * @param container - The game container element
 * @param state - The game state to update
 * @param config - The game configuration
 */
export function evadeNoButton(
  button: HTMLElement,
  container: HTMLElement,
  state: LoveGameState,
  config: LoveGameConfig
): void {
  // Don't evade if game is already won
  if (state.hasAnsweredYes) {
    return;
  }
  
  // Calculate new position
  const newPosition = calculateEvasionPosition(container, button, state.noButtonPosition);
  
  // Update state
  state.noButtonPosition = newPosition;
  state.evasionCount++;
  
  // Change button text from "No" to "Hmm..." after first evasion
  if (state.evasionCount === 1) {
    button.textContent = 'Hmm...';
  }
  
  // Calculate and apply shrink scale
  state.noButtonScale = calculateShrinkScale(
    state.evasionCount,
    config.shrinkThreshold,
    config.minButtonScale
  );
  
  // Apply position and scale with smooth transition
  const transitionStyle = prefersReducedMotion() ? 'none' : 'all 0.2s ease-out';
  
  setStyles(button, {
    position: 'absolute',
    left: `${newPosition.x}px`,
    top: `${newPosition.y}px`,
    transform: `scale(${state.noButtonScale})`,
    transition: transitionStyle,
  });
  
  // Show pleading message
  showPleadingMessage(container, state, config);
}

/**
 * Shows a pleading message when No button is evaded
 * @param container - The game container element
 * @param state - The game state
 * @param config - The game configuration
 */
export function showPleadingMessage(
  container: HTMLElement,
  state: LoveGameState,
  config: LoveGameConfig
): void {
  // Get or create message element
  let messageEl = container.querySelector('.pleading-message') as HTMLElement;
  
  if (!messageEl) {
    messageEl = createElement('p', {
      className: 'pleading-message',
    });
    container.appendChild(messageEl);
  }
  
  // Get current message
  const messages = config.pleadingMessages;
  const message = messages[state.currentMessageIndex % messages.length];
  
  // Update message with animation
  messageEl.textContent = message ?? 'Please? 🥺';
  removeClass(messageEl, 'pleading-message--animate');
  
  // Trigger reflow to restart animation
  void messageEl.offsetWidth;
  addClass(messageEl, 'pleading-message--animate');
  
  // Increment message index for next time
  state.currentMessageIndex++;
}

/**
 * Creates heart particle elements for celebration
 * @param count - Number of hearts to create
 * @returns Array of heart elements
 */
export function createHeartParticles(count: number): HTMLElement[] {
  const hearts: HTMLElement[] = [];
  const heartEmojis = ['💕', '💖', '💗', '💝', '❤️', '💘', '💓', '💞'];
  
  for (let i = 0; i < count; i++) {
    const heartEmoji = heartEmojis[i % heartEmojis.length] ?? '💕';
    const heart = createElement('span', {
      className: 'celebration-heart',
      textContent: heartEmoji,
      attributes: {
        'aria-hidden': 'true',
      },
    });
    
    // Random position and animation delay
    const randomX = Math.random() * 100;
    const randomDelay = Math.random() * 0.5;
    const randomDuration = 1 + Math.random() * 1;
    
    setStyles(heart, {
      left: `${randomX}%`,
      animationDelay: `${randomDelay}s`,
      animationDuration: `${randomDuration}s`,
    });
    
    hearts.push(heart);
  }
  
  return hearts;
}

/**
 * Creates the celebration message element
 * @param config - The game configuration for personalized messages
 * @returns The celebration message element
 */
export function createCelebrationMessage(config?: LoveGameConfig): HTMLElement {
  const message = createElement('div', {
    className: 'celebration-message',
  });
  
  const title = createElement('h3', {
    className: 'celebration-title',
    textContent: config?.celebrationTitle ?? siteConfig.loveGame.celebrationTitle,
  });
  
  const subtitle = createElement('p', {
    className: 'celebration-subtitle',
    textContent: config?.celebrationSubtitle ?? siteConfig.loveGame.celebrationSubtitle,
  });
  
  message.appendChild(title);
  message.appendChild(subtitle);
  
  return message;
}

/**
 * Triggers the celebration animation
 * Requirement 5.4: WHEN the "Yes" button is clicked, 
 * THE Love_Game SHALL trigger a celebratory animation
 * 
 * @param celebrationContainer - The celebration container element
 * @param state - The game state to update
 * @param config - The game configuration
 */
export function triggerCelebration(
  celebrationContainer: HTMLElement,
  state: LoveGameState,
  config: LoveGameConfig
): void {
  // Update state
  state.hasAnsweredYes = true;
  
  // Clear any existing content
  celebrationContainer.innerHTML = '';
  
  // Show celebration container
  removeClass(celebrationContainer, 'hidden');
  addClass(celebrationContainer, 'celebration--active');
  
  // Create and add heart particles (unless reduced motion)
  if (!prefersReducedMotion()) {
    const hearts = createHeartParticles(20);
    hearts.forEach((heart) => celebrationContainer.appendChild(heart));
  }
  
  // Add celebration message with config for personalization
  const message = createCelebrationMessage(config);
  celebrationContainer.appendChild(message);
}

/**
 * Sets up event handlers for the No button
 * Handles both mouse and touch events for cross-device compatibility
 * 
 * Requirement 5.3: WHEN the "No" button is hovered or approached, 
 * THE Love_Game SHALL make it playfully evasive
 * Requirement 5.5: Love_Game SHALL work correctly on both touch and mouse input devices
 * 
 * @param button - The No button element
 * @param container - The game container element
 * @param state - The game state
 * @param config - The game configuration
 * @returns Cleanup function to remove event listeners
 */
export function setupNoButtonHandlers(
  button: HTMLElement,
  container: HTMLElement,
  state: LoveGameState,
  config: LoveGameConfig
): () => void {
  const handleEvasion = (): void => {
    evadeNoButton(button, container, state, config);
  };
  
  // Mouse events
  button.addEventListener('mouseenter', handleEvasion);
  
  // Touch events - evade on touch start to prevent clicking
  const handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    handleEvasion();
  };
  
  button.addEventListener('touchstart', handleTouchStart, { passive: false });
  
  // Return cleanup function
  return () => {
    button.removeEventListener('mouseenter', handleEvasion);
    button.removeEventListener('touchstart', handleTouchStart);
  };
}

/**
 * Sets up event handlers for the Yes button
 * Handles both mouse and touch events for cross-device compatibility
 * 
 * Requirement 5.4: WHEN the "Yes" button is clicked, 
 * THE Love_Game SHALL trigger a celebratory animation
 * Requirement 5.5: Love_Game SHALL work correctly on both touch and mouse input devices
 * 
 * @param button - The Yes button element
 * @param celebrationContainer - The celebration container element
 * @param state - The game state
 * @param config - The game configuration
 * @param onCelebration - Optional callback when celebration is triggered
 * @returns Cleanup function to remove event listeners
 */
export function setupYesButtonHandlers(
  button: HTMLElement,
  celebrationContainer: HTMLElement,
  state: LoveGameState,
  config: LoveGameConfig,
  onCelebration?: () => void
): () => void {
  const handleYesClick = (event: Event): void => {
    event.preventDefault();
    
    if (!state.hasAnsweredYes) {
      triggerCelebration(celebrationContainer, state, config);
      onCelebration?.();
    }
  };
  
  // Mouse click
  button.addEventListener('click', handleYesClick);
  
  // Touch end (for touch devices)
  button.addEventListener('touchend', handleYesClick);
  
  // Keyboard support
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleYesClick(event);
    }
  };
  
  button.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    button.removeEventListener('click', handleYesClick);
    button.removeEventListener('touchend', handleYesClick);
    button.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Hides the game buttons and question after celebration
 * @param container - The game container element
 */
export function hideGameElements(container: HTMLElement): void {
  const question = container.querySelector('.game-question');
  const buttons = container.querySelector('.game-buttons');
  
  if (question) {
    addClass(question as Element, 'hidden');
  }
  
  if (buttons) {
    addClass(buttons as Element, 'hidden');
  }
}

/**
 * Creates and manages the love game section
 * 
 * @param customConfig - Optional custom configuration
 * @returns Object with init, getState, triggerCelebration, and destroy methods
 */
export function createLoveGame(customConfig: Partial<LoveGameConfig> = {}): {
  init: () => void;
  getState: () => LoveGameState;
  triggerCelebration: () => void;
  evadeNoButton: () => void;
  destroy: () => void;
} {
  const config: LoveGameConfig = { ...DEFAULT_CONFIG, ...customConfig };
  const state: LoveGameState = createInitialState();
  
  let container: HTMLElement | null = null;
  let yesButton: HTMLElement | null = null;
  let noButton: HTMLElement | null = null;
  let celebrationContainer: HTMLElement | null = null;
  let cleanupFunctions: (() => void)[] = [];
  let isInitialized = false;
  
  /**
   * Initializes the love game section
   */
  function init(): void {
    if (isInitialized) {
      return;
    }
    
    // Get DOM elements
    container = document.querySelector(config.containerSelector);
    yesButton = document.querySelector(config.yesButtonSelector);
    noButton = document.querySelector(config.noButtonSelector);
    celebrationContainer = document.querySelector(config.celebrationSelector);
    
    if (!container || !yesButton || !noButton || !celebrationContainer) {
      console.warn('Love game elements not found');
      return;
    }
    
    // Make container position relative for absolute positioning of No button
    setStyles(container, {
      position: 'relative',
    });
    
    // Set up No button handlers
    const noButtonCleanup = setupNoButtonHandlers(noButton, container, state, config);
    cleanupFunctions.push(noButtonCleanup);
    
    // Set up Yes button handlers
    const yesButtonCleanup = setupYesButtonHandlers(
      yesButton,
      celebrationContainer,
      state,
      config,
      () => {
        // Hide game elements after celebration
        if (container) {
          hideGameElements(container);
        }
      }
    );
    cleanupFunctions.push(yesButtonCleanup);
    
    isInitialized = true;
  }
  
  /**
   * Returns a copy of the current state
   */
  function getState(): LoveGameState {
    return { ...state };
  }
  
  /**
   * Manually triggers the celebration
   */
  function triggerCelebrationManual(): void {
    if (celebrationContainer && !state.hasAnsweredYes) {
      triggerCelebration(celebrationContainer, state, config);
      if (container) {
        hideGameElements(container);
      }
    }
  }
  
  /**
   * Manually triggers No button evasion
   */
  function evadeNoButtonManual(): void {
    if (noButton && container && !state.hasAnsweredYes) {
      evadeNoButton(noButton, container, state, config);
    }
  }
  
  /**
   * Cleans up event listeners and resets state
   */
  function destroy(): void {
    // Run all cleanup functions
    cleanupFunctions.forEach((cleanup) => cleanup());
    cleanupFunctions = [];
    
    // Reset No button position
    if (noButton) {
      setStyles(noButton, {
        position: '',
        left: '',
        top: '',
        transform: '',
        transition: '',
      });
    }
    
    // Hide celebration
    if (celebrationContainer) {
      removeClass(celebrationContainer, 'celebration--active');
      addClass(celebrationContainer, 'hidden');
      celebrationContainer.innerHTML = '';
    }
    
    // Show game elements
    if (container) {
      const question = container.querySelector('.game-question');
      const buttons = container.querySelector('.game-buttons');
      
      if (question) {
        removeClass(question as Element, 'hidden');
      }
      
      if (buttons) {
        removeClass(buttons as Element, 'hidden');
      }
    }
    
    // Reset state
    state.noButtonPosition = { x: 0, y: 0 };
    state.hasAnsweredYes = false;
    state.evasionCount = 0;
    state.noButtonScale = 1;
    state.currentMessageIndex = 0;
    
    isInitialized = false;
  }
  
  return {
    init,
    getState,
    triggerCelebration: triggerCelebrationManual,
    evadeNoButton: evadeNoButtonManual,
    destroy,
  };
}

/**
 * Default export for simple usage
 */
export default createLoveGame;
