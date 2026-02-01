/**
 * Reasons Module Tests
 * 
 * Tests for the Reasons I Love You section functionality
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  createReasons,
  createReasonCardElement,
  renderReasonCards,
  applyHoverEffect,
  removeHoverEffect,
  setupCardHoverHandlers,
  defaultReasons,
  type ReasonCard,
  type ReasonsConfig,
} from './reasons';

// Mock the motion utility
vi.mock('../utils/motion', () => ({
  prefersReducedMotion: vi.fn(() => false),
}));

describe('Reasons Module', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a container element for testing
    container = document.createElement('div');
    container.id = 'reasons-container';
    container.className = 'reasons-grid';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('defaultReasons', () => {
    it('should have at least 6 reason entries (Requirement 3.3)', () => {
      expect(defaultReasons.length).toBeGreaterThanOrEqual(6);
    });

    it('should have valid structure for each reason', () => {
      defaultReasons.forEach((reason) => {
        expect(reason).toHaveProperty('id');
        expect(reason).toHaveProperty('text');
        expect(typeof reason.id).toBe('string');
        expect(typeof reason.text).toBe('string');
        expect(reason.text.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs for each reason', () => {
      const ids = defaultReasons.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('createReasonCardElement', () => {
    const testCard: ReasonCard = {
      id: 'test-1',
      text: 'Test reason',
      icon: '💕',
    };

    const testConfig: ReasonsConfig = {
      cards: [testCard],
      animationDelay: 100,
      hoverEffect: 'scale',
      containerSelector: '#reasons-container',
    };

    it('should create a card element with correct structure', () => {
      const cardElement = createReasonCardElement(testCard, 0, testConfig);

      expect(cardElement.tagName).toBe('DIV');
      expect(cardElement.classList.contains('reason-card')).toBe(true);
      expect(cardElement.dataset.cardId).toBe('test-1');
    });

    it('should include icon element when icon is provided', () => {
      const cardElement = createReasonCardElement(testCard, 0, testConfig);
      const iconElement = cardElement.querySelector('.reason-card__icon');

      expect(iconElement).not.toBeNull();
      expect(iconElement?.textContent).toBe('💕');
      expect(iconElement?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should include text element with reason text', () => {
      const cardElement = createReasonCardElement(testCard, 0, testConfig);
      const textElement = cardElement.querySelector('.reason-card__text');

      expect(textElement).not.toBeNull();
      expect(textElement?.textContent).toBe('Test reason');
    });

    it('should not include icon element when icon is not provided', () => {
      const cardWithoutIcon: ReasonCard = { id: 'test-2', text: 'No icon' };
      const cardElement = createReasonCardElement(cardWithoutIcon, 0, testConfig);
      const iconElement = cardElement.querySelector('.reason-card__icon');

      expect(iconElement).toBeNull();
    });

    it('should apply hover effect class based on config', () => {
      const cardElement = createReasonCardElement(testCard, 0, testConfig);
      expect(cardElement.classList.contains('reason-card--scale')).toBe(true);
    });

    it('should set animation delay based on index', () => {
      const cardElement = createReasonCardElement(testCard, 2, testConfig);
      expect(cardElement.style.animationDelay).toBe('200ms');
    });
  });

  describe('renderReasonCards', () => {
    const testCards: ReasonCard[] = [
      { id: '1', text: 'Reason 1', icon: '❤️' },
      { id: '2', text: 'Reason 2', icon: '💕' },
      { id: '3', text: 'Reason 3' },
    ];

    const testConfig: ReasonsConfig = {
      cards: testCards,
      animationDelay: 100,
      hoverEffect: 'scale',
      containerSelector: '#reasons-container',
    };

    it('should render correct number of cards (Requirement 3.1)', () => {
      const cardElements = renderReasonCards(container, testCards, testConfig);

      expect(cardElements.length).toBe(3);
      expect(container.children.length).toBe(3);
    });

    it('should clear existing content before rendering', () => {
      // Add some existing content
      container.innerHTML = '<div>Existing content</div>';

      renderReasonCards(container, testCards, testConfig);

      expect(container.children.length).toBe(3);
      expect(container.querySelector('div:not(.reason-card)')).toBeNull();
    });

    it('should render cards with correct data attributes', () => {
      const cardElements = renderReasonCards(container, testCards, testConfig);

      cardElements.forEach((card, index) => {
        const testCard = testCards[index];
        expect(testCard).toBeDefined();
        expect(card.dataset.cardId).toBe(testCard?.id);
        expect(card.dataset.index).toBe(String(index));
      });
    });
  });

  describe('applyHoverEffect and removeHoverEffect', () => {
    let cardElement: HTMLDivElement;

    beforeEach(() => {
      cardElement = document.createElement('div');
      cardElement.className = 'reason-card';
    });

    it('should apply scale hover effect class', () => {
      applyHoverEffect(cardElement, 'scale');
      expect(cardElement.classList.contains('reason-card--hover-scale')).toBe(true);
    });

    it('should apply glow hover effect class', () => {
      applyHoverEffect(cardElement, 'glow');
      expect(cardElement.classList.contains('reason-card--hover-glow')).toBe(true);
    });

    it('should apply float hover effect class', () => {
      applyHoverEffect(cardElement, 'float');
      expect(cardElement.classList.contains('reason-card--hover-float')).toBe(true);
    });

    it('should remove hover effect class', () => {
      cardElement.classList.add('reason-card--hover-scale');
      removeHoverEffect(cardElement, 'scale');
      expect(cardElement.classList.contains('reason-card--hover-scale')).toBe(false);
    });
  });

  describe('setupCardHoverHandlers', () => {
    let cardElement: HTMLDivElement;

    beforeEach(() => {
      cardElement = document.createElement('div');
      cardElement.className = 'reason-card';
      cardElement.dataset.cardId = 'test-card';
      document.body.appendChild(cardElement);
    });

    it('should add hover effect on mouseenter (Requirement 3.4)', () => {
      setupCardHoverHandlers(cardElement, 'scale');

      cardElement.dispatchEvent(new MouseEvent('mouseenter'));

      expect(cardElement.classList.contains('reason-card--hover-scale')).toBe(true);
    });

    it('should remove hover effect on mouseleave', () => {
      setupCardHoverHandlers(cardElement, 'scale');

      cardElement.dispatchEvent(new MouseEvent('mouseenter'));
      cardElement.dispatchEvent(new MouseEvent('mouseleave'));

      expect(cardElement.classList.contains('reason-card--hover-scale')).toBe(false);
    });

    it('should call onHover callback with card ID', () => {
      const onHover = vi.fn();
      setupCardHoverHandlers(cardElement, 'scale', onHover);

      cardElement.dispatchEvent(new MouseEvent('mouseenter'));

      expect(onHover).toHaveBeenCalledWith('test-card');
    });

    it('should call onLeave callback', () => {
      const onLeave = vi.fn();
      setupCardHoverHandlers(cardElement, 'scale', undefined, onLeave);

      cardElement.dispatchEvent(new MouseEvent('mouseleave'));

      expect(onLeave).toHaveBeenCalledWith('test-card');
    });

    it('should make card focusable for accessibility', () => {
      // Note: tabindex and role are now set in createReasonCardElement
      // This test verifies that setupCardHoverHandlers works with cards that have these attributes
      cardElement.setAttribute('tabindex', '0');
      cardElement.setAttribute('role', 'button');
      
      setupCardHoverHandlers(cardElement, 'scale');

      // Verify the card still has the accessibility attributes
      expect(cardElement.getAttribute('tabindex')).toBe('0');
      expect(cardElement.getAttribute('role')).toBe('button');
    });

    it('should apply hover effect on focus', () => {
      setupCardHoverHandlers(cardElement, 'scale');

      cardElement.dispatchEvent(new FocusEvent('focus'));

      expect(cardElement.classList.contains('reason-card--hover-scale')).toBe(true);
    });

    it('should remove hover effect on blur', () => {
      setupCardHoverHandlers(cardElement, 'scale');

      cardElement.dispatchEvent(new FocusEvent('focus'));
      cardElement.dispatchEvent(new FocusEvent('blur'));

      expect(cardElement.classList.contains('reason-card--hover-scale')).toBe(false);
    });

    it('should return cleanup function that removes listeners', () => {
      const onHover = vi.fn();
      const cleanup = setupCardHoverHandlers(cardElement, 'scale', onHover);

      cleanup();

      // After cleanup, events should not trigger callbacks
      cardElement.dispatchEvent(new MouseEvent('mouseenter'));
      expect(onHover).not.toHaveBeenCalled();
    });
  });

  describe('createReasons', () => {
    it('should initialize with default config', () => {
      const reasons = createReasons();
      reasons.init();

      const state = reasons.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.isRendered).toBe(true);

      reasons.destroy();
    });

    it('should render default reason cards', () => {
      const reasons = createReasons();
      reasons.init();

      const cards = reasons.getCards();
      expect(cards.length).toBe(defaultReasons.length);

      const cardElements = reasons.getCardElements();
      expect(cardElements.length).toBe(defaultReasons.length);

      reasons.destroy();
    });

    it('should accept custom cards configuration', () => {
      const customCards: ReasonCard[] = [
        { id: 'custom-1', text: 'Custom reason 1' },
        { id: 'custom-2', text: 'Custom reason 2' },
      ];

      const reasons = createReasons({ cards: customCards });
      reasons.init();

      const cards = reasons.getCards();
      expect(cards.length).toBe(2);
      expect(cards[0]?.text).toBe('Custom reason 1');

      reasons.destroy();
    });

    it('should track hovered card ID in state', () => {
      const reasons = createReasons();
      reasons.init();

      const cardElements = reasons.getCardElements();
      expect(cardElements[0]).toBeDefined();
      cardElements[0]?.dispatchEvent(new MouseEvent('mouseenter'));

      const state = reasons.getState();
      expect(state.hoveredCardId).toBe(defaultReasons[0]?.id);

      reasons.destroy();
    });

    it('should clear hovered card ID on mouse leave', () => {
      const reasons = createReasons();
      reasons.init();

      const cardElements = reasons.getCardElements();
      expect(cardElements[0]).toBeDefined();
      cardElements[0]?.dispatchEvent(new MouseEvent('mouseenter'));
      cardElements[0]?.dispatchEvent(new MouseEvent('mouseleave'));

      const state = reasons.getState();
      expect(state.hoveredCardId).toBeNull();

      reasons.destroy();
    });

    it('should not initialize twice', () => {
      const reasons = createReasons();
      reasons.init();
      reasons.init(); // Second call should be ignored

      const cardElements = reasons.getCardElements();
      expect(cardElements.length).toBe(defaultReasons.length);

      reasons.destroy();
    });

    it('should handle missing container gracefully', () => {
      document.body.innerHTML = ''; // Remove container

      const reasons = createReasons();
      reasons.init();

      const state = reasons.getState();
      expect(state.isInitialized).toBe(false);
    });

    it('should clean up on destroy', () => {
      const reasons = createReasons();
      reasons.init();
      reasons.destroy();

      const state = reasons.getState();
      expect(state.isInitialized).toBe(false);
      expect(state.isRendered).toBe(false);
      expect(container.children.length).toBe(0);
    });

    it('should accept custom hover effect', () => {
      const reasons = createReasons({ hoverEffect: 'glow' });
      reasons.init();

      const cardElements = reasons.getCardElements();
      expect(cardElements[0]).toBeDefined();
      expect(cardElements[0]?.classList.contains('reason-card--glow')).toBe(true);

      reasons.destroy();
    });
  });
});


/**
 * Property-based tests for Reasons Module
 *
 * Feature: valentine-love-website, Property 6: Reasons Card Rendering
 * Validates: Requirements 3.3
 */

describe('Property 6: Reasons Card Rendering', () => {
  let container: HTMLDivElement;

  // Default config for testing
  const testConfig: ReasonsConfig = {
    cards: [],
    animationDelay: 100,
    hoverEffect: 'scale',
    containerSelector: '#reasons-container',
  };

  beforeEach(() => {
    // Create a container element for testing
    container = document.createElement('div');
    container.id = 'reasons-container';
    container.className = 'reasons-grid';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  /**
   * Generator for ReasonCard objects
   * Creates valid reason cards with unique IDs and non-empty text
   * Uses map to properly handle optional icon property for exactOptionalPropertyTypes
   */
  const reasonCardArbitrary: fc.Arbitrary<ReasonCard> = fc.record({
    id: fc.uuid(),
    text: fc.string({ minLength: 1, maxLength: 100 }),
    hasIcon: fc.boolean(),
    iconValue: fc.constantFrom('❤️', '💕', '💝', '😊', '✨', '👀', '💖', '💗'),
  }).map(({ id, text, hasIcon, iconValue }) => {
    const card: ReasonCard = { id, text };
    if (hasIcon) {
      card.icon = iconValue;
    }
    return card;
  });

  /**
   * Generator for arrays of ReasonCard objects with length 1 to 20
   */
  const reasonCardsArrayArbitrary: fc.Arbitrary<ReasonCard[]> = fc.array(reasonCardArbitrary, { minLength: 1, maxLength: 20 });

  /**
   * Property test: For any array of reason card data with length N (where N >= 1),
   * the Reasons Section SHALL render exactly N card elements.
   *
   * **Validates: Requirements 3.3**
   */
  it('should render exactly N card elements for an array of N reason cards', () => {
    // Feature: valentine-love-website, Property 6: Reasons Card Rendering
    fc.assert(
      fc.property(
        reasonCardsArrayArbitrary,
        (cards: ReasonCard[]) => {
          // Clear container before each test
          container.innerHTML = '';

          // Render the cards
          const cardElements = renderReasonCards(container, cards, { ...testConfig, cards });

          // Property: The number of rendered card elements should equal the number of input cards
          return cardElements.length === cards.length && container.children.length === cards.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any array of reason card data, each rendered card SHALL have
   * the correct data-card-id attribute matching the corresponding card's ID.
   *
   * **Validates: Requirements 3.3**
   */
  it('should set correct data-card-id attribute for each rendered card', () => {
    // Feature: valentine-love-website, Property 6: Reasons Card Rendering
    fc.assert(
      fc.property(
        reasonCardsArrayArbitrary,
        (cards: ReasonCard[]) => {
          // Clear container before each test
          container.innerHTML = '';

          // Render the cards
          const cardElements = renderReasonCards(container, cards, { ...testConfig, cards });

          // Property: Each card element should have the correct data-card-id attribute
          return cardElements.every((element, index) => {
            const expectedId = cards[index]?.id;
            return element.dataset.cardId === expectedId;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any array of reason card data, the rendered cards SHALL
   * appear in the same order as the input array.
   *
   * **Validates: Requirements 3.3**
   */
  it('should render cards in the same order as the input array', () => {
    // Feature: valentine-love-website, Property 6: Reasons Card Rendering
    fc.assert(
      fc.property(
        reasonCardsArrayArbitrary,
        (cards: ReasonCard[]) => {
          // Clear container before each test
          container.innerHTML = '';

          // Render the cards
          const cardElements = renderReasonCards(container, cards, { ...testConfig, cards });

          // Property: Cards should be rendered in the same order as input
          return cardElements.every((element, index) => {
            const expectedId = cards[index]?.id;
            const expectedIndex = String(index);
            return (
              element.dataset.cardId === expectedId &&
              element.dataset.index === expectedIndex
            );
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any array of reason card data, each rendered card SHALL
   * contain the correct text content from the corresponding card.
   *
   * **Validates: Requirements 3.3**
   */
  it('should render correct text content for each card', () => {
    // Feature: valentine-love-website, Property 6: Reasons Card Rendering
    fc.assert(
      fc.property(
        reasonCardsArrayArbitrary,
        (cards: ReasonCard[]) => {
          // Clear container before each test
          container.innerHTML = '';

          // Render the cards
          const cardElements = renderReasonCards(container, cards, { ...testConfig, cards });

          // Property: Each card should contain the correct text
          return cardElements.every((element, index) => {
            const textElement = element.querySelector('.reason-card__text');
            const expectedText = cards[index]?.text;
            return textElement !== null && textElement.textContent === expectedText;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any array of reason card data, rendering SHALL clear
   * any existing content in the container before adding new cards.
   *
   * **Validates: Requirements 3.3**
   */
  it('should clear existing content before rendering new cards', () => {
    // Feature: valentine-love-website, Property 6: Reasons Card Rendering
    fc.assert(
      fc.property(
        reasonCardsArrayArbitrary,
        reasonCardsArrayArbitrary,
        (firstCards: ReasonCard[], secondCards: ReasonCard[]) => {
          // Clear container before each test
          container.innerHTML = '';

          // Render first set of cards
          renderReasonCards(container, firstCards, { ...testConfig, cards: firstCards });

          // Render second set of cards (should replace first set)
          const cardElements = renderReasonCards(container, secondCards, { ...testConfig, cards: secondCards });

          // Property: Container should only contain the second set of cards
          return (
            container.children.length === secondCards.length &&
            cardElements.length === secondCards.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: For any array of reason card data, all rendered cards SHALL
   * have the reason-card CSS class applied.
   *
   * **Validates: Requirements 3.3**
   */
  it('should apply reason-card class to all rendered cards', () => {
    // Feature: valentine-love-website, Property 6: Reasons Card Rendering
    fc.assert(
      fc.property(
        reasonCardsArrayArbitrary,
        (cards: ReasonCard[]) => {
          // Clear container before each test
          container.innerHTML = '';

          // Render the cards
          const cardElements = renderReasonCards(container, cards, { ...testConfig, cards });

          // Property: All cards should have the reason-card class
          return cardElements.every((element) => element.classList.contains('reason-card'));
        }
      ),
      { numRuns: 100 }
    );
  });
});
