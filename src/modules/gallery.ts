/**
 * Secret Photo Gallery Module
 * 
 * @module gallery
 * @description Displays photos in an interactive grid with click-to-flip reveal mechanism
 * 
 * Validates: Requirements 4.1, 4.2, 4.6
 * - 4.1: Gallery SHALL display photos in an interactive grid layout
 * - 4.2: WHEN a photo is clicked, THE Gallery SHALL reveal it with a cute animation effect
 * - 4.6: Gallery SHALL include a playful reveal mechanism (e.g., click-to-flip)
 */

import { createElement, addClass, clearChildren } from '../utils/dom';
import { prefersReducedMotion } from '../utils/motion';

/**
 * Represents a single gallery photo
 */
export interface GalleryPhoto {
  /** Unique identifier for the photo */
  id: string;
  /** Source URL of the photo */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Whether the photo has been revealed */
  revealed: boolean;
}

/**
 * Configuration options for the gallery
 */
export interface GalleryConfig {
  /** Array of photos to display */
  photos: GalleryPhoto[];
  /** Type of reveal animation */
  revealAnimation: 'flip' | 'fade' | 'scratch';
  /** Number of columns at different breakpoints */
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  /** CSS selector for the container element */
  containerSelector: string;
}

/**
 * State of the gallery
 */
export interface GalleryState {
  /** Set of revealed photo IDs */
  revealedPhotos: Set<string>;
}

/**
 * Default placeholder photos for the gallery
 */
export const defaultPhotos: GalleryPhoto[] = [
  { id: '1', src: '/photos/photo1.jpg', alt: 'Our special moment 1', revealed: false },
  { id: '2', src: '/photos/photo2.jpg', alt: 'Our special moment 2', revealed: false },
  { id: '3', src: '/photos/photo3.jpg', alt: 'Our special moment 3', revealed: false },
  { id: '4', src: '/photos/photo4.jpg', alt: 'Our special moment 4', revealed: false },
  { id: '5', src: '/photos/photo5.jpg', alt: 'Our special moment 5', revealed: false },
  { id: '6', src: '/photos/photo6.jpg', alt: 'Our special moment 6', revealed: false },
  { id: '7', src: '/photos/photo7.jpg', alt: 'Our special moment 7', revealed: false },
  { id: '8', src: '/photos/photo8.jpg', alt: 'Our special moment 8', revealed: false },
];

/**
 * Default configuration for the gallery
 */
const DEFAULT_CONFIG: GalleryConfig = {
  photos: defaultPhotos,
  revealAnimation: 'flip',
  columns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  containerSelector: '#gallery-container',
};

/**
 * Creates the front face of a gallery card (hidden state)
 * Shows a romantic heart-shaped placeholder with "Click to reveal" hint
 * 
 * Validates: Requirements 4.3, 4.7
 * - 4.3: Gallery SHALL support placeholder images until real photos are added
 * - 4.7: IF no photos are loaded, THEN THE Gallery SHALL display romantic placeholder content
 * 
 * @returns The front face element
 */
export function createCardFront(): HTMLElement {
  const front = createElement('div', {
    className: 'gallery-card__front',
  });

  // Heart-shaped container for romantic effect
  const heartContainer = createElement('div', {
    className: 'gallery-card__heart-container',
    attributes: {
      'aria-hidden': 'true',
    },
  });

  const heartIcon = createElement('span', {
    className: 'gallery-card__heart',
    textContent: '💕',
    attributes: {
      'aria-hidden': 'true',
    },
  });

  // Decorative sparkles for romantic effect
  const sparkle1 = createElement('span', {
    className: 'gallery-card__sparkle gallery-card__sparkle--1',
    textContent: '✨',
    attributes: {
      'aria-hidden': 'true',
    },
  });

  const sparkle2 = createElement('span', {
    className: 'gallery-card__sparkle gallery-card__sparkle--2',
    textContent: '💫',
    attributes: {
      'aria-hidden': 'true',
    },
  });

  heartContainer.appendChild(sparkle1);
  heartContainer.appendChild(heartIcon);
  heartContainer.appendChild(sparkle2);

  const hintText = createElement('span', {
    className: 'gallery-card__hint',
    textContent: 'Click to reveal',
  });

  // Romantic subtitle hint
  const hintSubtext = createElement('span', {
    className: 'gallery-card__hint-subtext',
    textContent: 'pics I adore 💕',
  });

  front.appendChild(heartContainer);
  front.appendChild(hintText);
  front.appendChild(hintSubtext);

  return front;
}

/**
 * Creates the back face of a gallery card (revealed state)
 * Shows the actual photo with graceful error handling
 * 
 * Validates: Requirements 4.3, 4.7
 * - 4.3: Gallery SHALL support placeholder images until real photos are added
 * - 4.7: IF no photos are loaded, THEN THE Gallery SHALL display romantic placeholder content
 * 
 * @param photo - The photo data
 * @returns The back face element
 */
export function createCardBack(photo: GalleryPhoto): HTMLElement {
  const back = createElement('div', {
    className: 'gallery-card__back',
  });

  const img = createElement('img', {
    className: 'gallery-card__image',
    attributes: {
      src: photo.src,
      alt: photo.alt,
      loading: 'lazy',
    },
  });

  // Handle image load errors gracefully with romantic placeholder
  img.addEventListener('error', () => {
    img.style.display = 'none';
    const placeholder = createElement('div', {
      className: 'gallery-card__placeholder gallery-card__placeholder--error',
    });

    const placeholderIcon = createElement('span', {
      className: 'gallery-card__placeholder-icon',
      textContent: '💝',
      attributes: {
        'aria-hidden': 'true',
      },
    });

    const placeholderText = createElement('span', {
      className: 'gallery-card__placeholder-text',
      textContent: 'Photo coming soon',
    });

    const placeholderSubtext = createElement('span', {
      className: 'gallery-card__placeholder-subtext',
      textContent: 'Add your special moment here',
    });

    placeholder.appendChild(placeholderIcon);
    placeholder.appendChild(placeholderText);
    placeholder.appendChild(placeholderSubtext);
    back.appendChild(placeholder);
  });

  back.appendChild(img);

  return back;
}

/**
 * Creates a single gallery card element
 * Requirement 4.1: Display photos in an interactive grid layout
 * 
 * @param photo - The photo data
 * @param index - The index of the card (for animation delay)
 * @param config - The gallery configuration
 * @returns The created card element
 */
export function createGalleryCardElement(
  photo: GalleryPhoto,
  index: number,
  config: GalleryConfig
): HTMLElement {
  const card = createElement('div', {
    className: `gallery-card gallery-card--${config.revealAnimation}`,
    dataset: {
      photoId: photo.id,
      index: String(index),
    },
    attributes: {
      role: 'button',
      tabindex: '0',
      'aria-label': photo.revealed ? photo.alt : 'Click to reveal photo',
      'aria-pressed': String(photo.revealed),
    },
  });

  // Create inner container for 3D flip effect
  const inner = createElement('div', {
    className: 'gallery-card__inner',
  });

  // Create front and back faces
  const front = createCardFront();
  const back = createCardBack(photo);

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  // Apply revealed state if already revealed
  if (photo.revealed) {
    addClass(card, 'gallery-card--revealed');
  }

  // Set animation delay for staggered entrance
  if (!prefersReducedMotion()) {
    card.style.animationDelay = `${index * 50}ms`;
  }

  return card;
}

/**
 * Creates an empty gallery state placeholder
 * Displays romantic content when no photos are available
 * 
 * Validates: Requirements 4.7
 * - 4.7: IF no photos are loaded, THEN THE Gallery SHALL display romantic placeholder content
 * 
 * @returns The empty state element
 */
export function createEmptyGalleryState(): HTMLElement {
  const emptyState = createElement('div', {
    className: 'gallery-empty-state',
  });

  const heartIcon = createElement('div', {
    className: 'gallery-empty-state__icon',
    textContent: '💕',
    attributes: {
      'aria-hidden': 'true',
    },
  });

  const title = createElement('h3', {
    className: 'gallery-empty-state__title',
    textContent: 'Our Love Story Awaits',
  });

  const message = createElement('p', {
    className: 'gallery-empty-state__message',
    textContent: 'Add your special photos to create beautiful memories together',
  });

  const hint = createElement('p', {
    className: 'gallery-empty-state__hint',
    textContent: 'Place photos in the /photos folder to get started',
  });

  emptyState.appendChild(heartIcon);
  emptyState.appendChild(title);
  emptyState.appendChild(message);
  emptyState.appendChild(hint);

  return emptyState;
}

/**
 * Renders all gallery cards into the container
 * Requirement 4.1: Display photos in an interactive grid layout
 * Requirement 4.7: Display romantic placeholder content when no photos
 * 
 * @param container - The container element to render cards into
 * @param photos - Array of photos to render
 * @param config - The gallery configuration
 * @returns Array of created card elements
 */
export function renderGalleryCards(
  container: HTMLElement,
  photos: GalleryPhoto[],
  config: GalleryConfig
): HTMLElement[] {
  // Clear existing content
  clearChildren(container);

  // Handle empty gallery state
  if (photos.length === 0) {
    const emptyState = createEmptyGalleryState();
    container.appendChild(emptyState);
    return [];
  }

  // Create and append card elements
  const cardElements: HTMLElement[] = [];

  photos.forEach((photo, index) => {
    const cardElement = createGalleryCardElement(photo, index, config);
    cardElements.push(cardElement);
    container.appendChild(cardElement);
  });

  return cardElements;
}

/**
 * Reveals a photo card with animation
 * Requirement 4.2: WHEN a photo is clicked, THE Gallery SHALL reveal it with a cute animation effect
 * Requirement 4.6: Gallery SHALL include a playful reveal mechanism (click-to-flip)
 * 
 * @param cardElement - The card element to reveal
 * @param photo - The photo data
 * @param state - The gallery state to update
 */
export function revealPhoto(
  cardElement: HTMLElement,
  photo: GalleryPhoto,
  state: GalleryState
): void {
  // Don't reveal if already revealed
  if (photo.revealed) {
    return;
  }

  // Update photo state
  photo.revealed = true;

  // Add to revealed set
  state.revealedPhotos.add(photo.id);

  // Apply revealed class for animation
  addClass(cardElement, 'gallery-card--revealed');

  // Update accessibility attributes
  cardElement.setAttribute('aria-pressed', 'true');
  cardElement.setAttribute('aria-label', photo.alt);
}

/**
 * Sets up click and keyboard handlers for a gallery card
 * Requirement 4.2: WHEN a photo is clicked, THE Gallery SHALL reveal it
 * 
 * @param cardElement - The card element to set up handlers for
 * @param photo - The photo data
 * @param state - The gallery state
 * @param onReveal - Optional callback when photo is revealed
 * @returns Cleanup function to remove event listeners
 */
export function setupCardInteraction(
  cardElement: HTMLElement,
  photo: GalleryPhoto,
  state: GalleryState,
  onReveal?: (photoId: string) => void
): () => void {
  const handleReveal = (): void => {
    if (!photo.revealed) {
      revealPhoto(cardElement, photo, state);
      onReveal?.(photo.id);
    }
  };

  const handleClick = (event: Event): void => {
    event.preventDefault();
    handleReveal();
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleReveal();
    }
  };

  // Add event listeners
  cardElement.addEventListener('click', handleClick);
  cardElement.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    cardElement.removeEventListener('click', handleClick);
    cardElement.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Creates and manages the gallery section
 * 
 * @param customConfig - Optional custom configuration
 * @returns Object with init, getState, revealPhoto, and destroy methods
 */
export function createGallery(customConfig: Partial<GalleryConfig> = {}): {
  init: () => void;
  getState: () => GalleryState;
  getPhotos: () => GalleryPhoto[];
  getCardElements: () => HTMLElement[];
  revealPhoto: (photoId: string) => void;
  revealAll: () => void;
  isPhotoRevealed: (photoId: string) => boolean;
  destroy: () => void;
} {
  const config: GalleryConfig = { ...DEFAULT_CONFIG, ...customConfig };
  const state: GalleryState = {
    revealedPhotos: new Set<string>(),
  };

  // Create a deep copy of photos to avoid mutating the original
  const photos: GalleryPhoto[] = config.photos.map((photo) => ({ ...photo }));

  let container: HTMLElement | null = null;
  let cardElements: HTMLElement[] = [];
  let cleanupFunctions: (() => void)[] = [];
  let isInitialized = false;

  /**
   * Initializes the gallery section
   */
  function init(): void {
    if (isInitialized) {
      return;
    }

    container = document.querySelector(config.containerSelector);
    if (!container) {
      console.warn(`Gallery container not found: ${config.containerSelector}`);
      return;
    }

    // Render cards
    cardElements = renderGalleryCards(container, photos, config);

    // Set up interaction handlers for each card
    photos.forEach((photo, index) => {
      const cardElement = cardElements[index];
      if (cardElement) {
        const cleanup = setupCardInteraction(cardElement, photo, state);
        cleanupFunctions.push(cleanup);
      }
    });

    // Sync initial revealed state
    photos.forEach((photo) => {
      if (photo.revealed) {
        state.revealedPhotos.add(photo.id);
      }
    });

    isInitialized = true;
  }

  /**
   * Returns the current state
   */
  function getState(): GalleryState {
    return {
      revealedPhotos: new Set(state.revealedPhotos),
    };
  }

  /**
   * Returns the photos array
   */
  function getPhotos(): GalleryPhoto[] {
    return photos.map((photo) => ({ ...photo }));
  }

  /**
   * Returns the rendered card elements
   */
  function getCardElements(): HTMLElement[] {
    return [...cardElements];
  }

  /**
   * Reveals a specific photo by ID
   */
  function revealPhotoById(photoId: string): void {
    const photoIndex = photos.findIndex((p) => p.id === photoId);
    if (photoIndex === -1) {
      return;
    }

    const photo = photos[photoIndex];
    const cardElement = cardElements[photoIndex];

    if (photo && cardElement && !photo.revealed) {
      revealPhoto(cardElement, photo, state);
    }
  }

  /**
   * Reveals all photos
   */
  function revealAll(): void {
    photos.forEach((photo, index) => {
      const cardElement = cardElements[index];
      if (cardElement && !photo.revealed) {
        revealPhoto(cardElement, photo, state);
      }
    });
  }

  /**
   * Checks if a photo is revealed
   */
  function isPhotoRevealed(photoId: string): boolean {
    return state.revealedPhotos.has(photoId);
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
    state.revealedPhotos.clear();
    isInitialized = false;
  }

  return {
    init,
    getState,
    getPhotos,
    getCardElements,
    revealPhoto: revealPhotoById,
    revealAll,
    isPhotoRevealed,
    destroy,
  };
}

/**
 * Default export for simple usage
 */
export default createGallery;
