/**
 * Reasons I Love You Section Module
 * 
 * @module reasons
 * @description Displays romantic reason cards with hover effects
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 * - 3.1: Reasons_Section SHALL display multiple romantic reason cards
 * - 3.2: WHEN a reason card is viewed, THE Website SHALL present it with a visually appealing design
 * - 3.3: Reasons_Section SHALL support at least 6 customizable reason entries
 * - 3.4: WHEN hovering over a reason card on desktop, THE Website SHALL display a subtle animation effect
 */

import { createElement, addClass, removeClass, clearChildren } from '../utils/dom';
import { prefersReducedMotion } from '../utils/motion';
import { siteConfig } from '../config';

/**
 * Represents a single reason card
 */
export interface ReasonCard {
  /** Unique identifier for the card */
  id: string;
  /** The romantic reason text (short title) */
  text: string;
  /** Optional emoji icon for the card */
  icon?: string;
  /** Optional expanded description shown on click */
  description?: string;
}

/**
 * Configuration options for the reasons section
 */
export interface ReasonsConfig {
  /** Array of reason cards to display */
  cards: ReasonCard[];
  /** Delay between card animations in milliseconds */
  animationDelay: number;
  /** Type of hover effect to apply */
  hoverEffect: 'scale' | 'glow' | 'float';
  /** CSS selector for the container element */
  containerSelector: string;
}

/**
 * State of the reasons section
 */
export interface ReasonsState {
  /** Whether the section has been initialized */
  isInitialized: boolean;
  /** Whether cards have been rendered */
  isRendered: boolean;
  /** Currently hovered card ID (if any) */
  hoveredCardId: string | null;
  /** Currently expanded card ID (if any) */
  expandedCardId: string | null;
}

/**
 * Default reason cards - loaded from site config for personalization
 * Requirement 3.3: Support at least 6 customizable reason entries
 */
export const defaultReasons: ReasonCard[] = siteConfig.reasons.cards;

/**
 * Default configuration for the reasons section
 */
const DEFAULT_CONFIG: ReasonsConfig = {
  cards: defaultReasons,
  animationDelay: 100,
  hoverEffect: 'scale',
  containerSelector: '#reasons-container',
};

/**
 * Creates a single reason card element
 * Requirement 3.2: Present cards with visually appealing design
 * 
 * @param card - The reason card data
 * @param index - The index of the card (for animation delay)
 * @param config - The reasons configuration
 * @returns The created card element
 */
export function createReasonCardElement(
  card: ReasonCard,
  index: number,
  config: ReasonsConfig
): HTMLElement {
  const cardElement = createElement('div', {
    className: `reason-card reason-card--${config.hoverEffect}`,
    dataset: {
      cardId: card.id,
      index: String(index),
    },
    attributes: {
      role: 'button',
      tabindex: '0',
      'aria-expanded': 'false',
    },
  });

  // Add icon if present
  if (card.icon) {
    const iconElement = createElement('span', {
      className: 'reason-card__icon',
      textContent: card.icon,
      attributes: {
        'aria-hidden': 'true',
      },
    });
    cardElement.appendChild(iconElement);
  }

  // Add text content (title)
  const textElement = createElement('p', {
    className: 'reason-card__text',
    textContent: card.text,
  });
  cardElement.appendChild(textElement);

  // Add description if present (hidden by default)
  if (card.description) {
    const descElement = createElement('p', {
      className: 'reason-card__description',
      textContent: card.description,
    });
    cardElement.appendChild(descElement);
    
    // Add click hint
    const hintElement = createElement('span', {
      className: 'reason-card__hint',
      textContent: 'tap to read more',
    });
    cardElement.appendChild(hintElement);
  }

  // Set animation delay for staggered entrance
  if (!prefersReducedMotion()) {
    cardElement.style.animationDelay = `${index * config.animationDelay}ms`;
  }

  return cardElement;
}

/**
 * Renders all reason cards into the container
 * Requirement 3.1: Display multiple romantic reason cards
 * Requirement 3.3: Support at least 6 customizable reason entries
 * 
 * @param container - The container element to render cards into
 * @param cards - Array of reason cards to render
 * @param config - The reasons configuration
 * @returns Array of created card elements
 */
export function renderReasonCards(
  container: HTMLElement,
  cards: ReasonCard[],
  config: ReasonsConfig
): HTMLElement[] {
  // Clear existing content
  clearChildren(container);

  // Create and append card elements
  const cardElements: HTMLElement[] = [];
  
  cards.forEach((card, index) => {
    const cardElement = createReasonCardElement(card, index, config);
    cardElements.push(cardElement);
    container.appendChild(cardElement);
  });

  return cardElements;
}

/**
 * Applies hover effect to a card element
 * Requirement 3.4: Display subtle animation effect on hover
 * 
 * @param cardElement - The card element to apply effect to
 * @param effectType - The type of hover effect
 */
export function applyHoverEffect(
  cardElement: HTMLElement,
  effectType: 'scale' | 'glow' | 'float'
): void {
  if (prefersReducedMotion()) {
    return;
  }

  addClass(cardElement, `reason-card--hover-${effectType}`);
}

/**
 * Removes hover effect from a card element
 * 
 * @param cardElement - The card element to remove effect from
 * @param effectType - The type of hover effect
 */
export function removeHoverEffect(
  cardElement: HTMLElement,
  effectType: 'scale' | 'glow' | 'float'
): void {
  removeClass(cardElement, `reason-card--hover-${effectType}`);
}

/**
 * Sets up hover event handlers for a card element
 * Requirement 3.4: Display subtle animation effect on hover (desktop)
 * 
 * @param cardElement - The card element to set up handlers for
 * @param effectType - The type of hover effect
 * @param onHover - Optional callback when card is hovered
 * @param onLeave - Optional callback when hover ends
 * @param onToggle - Optional callback when card is clicked/toggled
 * @returns Cleanup function to remove event listeners
 */
export function setupCardHoverHandlers(
  cardElement: HTMLElement,
  effectType: 'scale' | 'glow' | 'float',
  onHover?: (cardId: string) => void,
  onLeave?: (cardId: string) => void,
  onToggle?: (cardId: string, isExpanded: boolean) => void
): () => void {
  const cardId = cardElement.dataset.cardId || '';
  let isExpanded = false;

  const handleMouseEnter = (): void => {
    applyHoverEffect(cardElement, effectType);
    onHover?.(cardId);
  };

  const handleMouseLeave = (): void => {
    removeHoverEffect(cardElement, effectType);
    onLeave?.(cardId);
  };

  const handleClick = (event: Event): void => {
    event.preventDefault();
    isExpanded = !isExpanded;
    
    if (isExpanded) {
      addClass(cardElement, 'reason-card--expanded');
      cardElement.setAttribute('aria-expanded', 'true');
    } else {
      removeClass(cardElement, 'reason-card--expanded');
      cardElement.setAttribute('aria-expanded', 'false');
    }
    
    onToggle?.(cardId, isExpanded);
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }
  };

  // Add event listeners
  cardElement.addEventListener('mouseenter', handleMouseEnter);
  cardElement.addEventListener('mouseleave', handleMouseLeave);
  cardElement.addEventListener('click', handleClick);
  cardElement.addEventListener('keydown', handleKeyDown);

  // Also support focus for keyboard accessibility
  cardElement.addEventListener('focus', handleMouseEnter);
  cardElement.addEventListener('blur', handleMouseLeave);

  // Return cleanup function
  return () => {
    cardElement.removeEventListener('mouseenter', handleMouseEnter);
    cardElement.removeEventListener('mouseleave', handleMouseLeave);
    cardElement.removeEventListener('click', handleClick);
    cardElement.removeEventListener('keydown', handleKeyDown);
    cardElement.removeEventListener('focus', handleMouseEnter);
    cardElement.removeEventListener('blur', handleMouseLeave);
  };
}

/**
 * Creates and manages the reasons section
 * 
 * @param customConfig - Optional custom configuration
 * @returns Object with init, getState, and destroy methods
 */
export function createReasons(customConfig: Partial<ReasonsConfig> = {}): {
  init: () => void;
  getState: () => ReasonsState;
  getCards: () => ReasonCard[];
  getCardElements: () => HTMLElement[];
  destroy: () => void;
} {
  const config: ReasonsConfig = { ...DEFAULT_CONFIG, ...customConfig };
  const state: ReasonsState = {
    isInitialized: false,
    isRendered: false,
    hoveredCardId: null,
    expandedCardId: null,
  };

  let container: HTMLElement | null = null;
  let cardElements: HTMLElement[] = [];
  let cleanupFunctions: (() => void)[] = [];

  /**
   * Initializes the reasons section
   */
  function init(): void {
    if (state.isInitialized) {
      return;
    }

    container = document.querySelector(config.containerSelector);
    if (!container) {
      console.warn(`Reasons container not found: ${config.containerSelector}`);
      return;
    }

    // Render cards
    cardElements = renderReasonCards(container, config.cards, config);
    state.isRendered = true;

    // Set up hover handlers for each card
    cardElements.forEach((cardElement) => {
      const cleanup = setupCardHoverHandlers(
        cardElement,
        config.hoverEffect,
        (cardId) => {
          state.hoveredCardId = cardId;
        },
        () => {
          state.hoveredCardId = null;
        },
        (cardId, isExpanded) => {
          // Collapse other cards when one is expanded
          if (isExpanded) {
            cardElements.forEach((el) => {
              if (el.dataset.cardId !== cardId) {
                removeClass(el, 'reason-card--expanded');
                el.setAttribute('aria-expanded', 'false');
              }
            });
            state.expandedCardId = cardId;
          } else {
            state.expandedCardId = null;
          }
        }
      );
      cleanupFunctions.push(cleanup);
    });

    state.isInitialized = true;
  }

  /**
   * Returns the current state
   */
  function getState(): ReasonsState {
    return { ...state };
  }

  /**
   * Returns the configured cards
   */
  function getCards(): ReasonCard[] {
    return [...config.cards];
  }

  /**
   * Returns the rendered card elements
   */
  function getCardElements(): HTMLElement[] {
    return [...cardElements];
  }

  /**
   * Cleans up event listeners and resets state
   */
  function destroy(): void {
    // Run all cleanup functions
    cleanupFunctions.forEach((cleanup) => cleanup());
    cleanupFunctions = [];

    // Clear container
    if (container) {
      clearChildren(container);
    }

    // Reset state
    cardElements = [];
    state.isInitialized = false;
    state.isRendered = false;
    state.hoveredCardId = null;
    state.expandedCardId = null;
  }

  return {
    init,
    getState,
    getCards,
    getCardElements,
    destroy,
  };
}

/**
 * Default export for simple usage
 */
export default createReasons;
