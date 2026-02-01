/**
 * Gallery Module Tests
 * 
 * Tests for the secret photo gallery with click-to-flip reveal mechanism
 * 
 * Validates: Requirements 4.1, 4.2, 4.6
 * - 4.1: Gallery SHALL display photos in an interactive grid layout
 * - 4.2: WHEN a photo is clicked, THE Gallery SHALL reveal it with a cute animation effect
 * - 4.6: Gallery SHALL include a playful reveal mechanism (e.g., click-to-flip)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  createGallery,
  createGalleryCardElement,
  createCardFront,
  createCardBack,
  createEmptyGalleryState,
  renderGalleryCards,
  revealPhoto,
  setupCardInteraction,
  defaultPhotos,
  type GalleryPhoto,
  type GalleryConfig,
  type GalleryState,
} from './gallery';

describe('Gallery Module', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a container element for testing
    container = document.createElement('div');
    container.id = 'gallery-container';
    container.className = 'gallery-grid';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('GalleryPhoto Interface', () => {
    it('should have correct structure for default photos', () => {
      expect(defaultPhotos).toBeInstanceOf(Array);
      expect(defaultPhotos.length).toBeGreaterThanOrEqual(1);

      defaultPhotos.forEach((photo) => {
        expect(photo).toHaveProperty('id');
        expect(photo).toHaveProperty('src');
        expect(photo).toHaveProperty('alt');
        expect(photo).toHaveProperty('revealed');
        expect(typeof photo.id).toBe('string');
        expect(typeof photo.src).toBe('string');
        expect(typeof photo.alt).toBe('string');
        expect(typeof photo.revealed).toBe('boolean');
      });
    });

    it('should have unique IDs for all default photos', () => {
      const ids = defaultPhotos.map((photo) => photo.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('createCardFront', () => {
    it('should create a front face element with heart container and hint', () => {
      const front = createCardFront();

      expect(front).toBeInstanceOf(HTMLElement);
      expect(front.className).toBe('gallery-card__front');

      // Check for heart container
      const heartContainer = front.querySelector('.gallery-card__heart-container');
      expect(heartContainer).not.toBeNull();

      // Check for heart icon
      const heart = front.querySelector('.gallery-card__heart');
      expect(heart).not.toBeNull();
      expect(heart?.textContent).toBe('💕');

      // Check for hint text
      const hint = front.querySelector('.gallery-card__hint');
      expect(hint).not.toBeNull();
      expect(hint?.textContent).toBe('Click to reveal');
    });

    it('should include decorative sparkles for romantic effect', () => {
      const front = createCardFront();

      const sparkles = front.querySelectorAll('.gallery-card__sparkle');
      expect(sparkles.length).toBe(2);
      expect(sparkles[0]?.textContent).toBe('✨');
      expect(sparkles[1]?.textContent).toBe('💫');
    });

    it('should include romantic hint subtext', () => {
      const front = createCardFront();

      const hintSubtext = front.querySelector('.gallery-card__hint-subtext');
      expect(hintSubtext).not.toBeNull();
      expect(hintSubtext?.textContent).toBe('pics I adore 💕');
    });
  });

  describe('createCardBack', () => {
    it('should create a back face element with image', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: false,
      };

      const back = createCardBack(photo);

      expect(back).toBeInstanceOf(HTMLElement);
      expect(back.className).toBe('gallery-card__back');

      // Check for image
      const img = back.querySelector('.gallery-card__image') as HTMLImageElement;
      expect(img).not.toBeNull();
      expect(img.src).toContain('/photos/test.jpg');
      expect(img.alt).toBe('Test photo');
      expect(img.getAttribute('loading')).toBe('lazy');
    });

    it('should handle image load errors gracefully with romantic placeholder', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/nonexistent.jpg',
        alt: 'Test photo',
        revealed: false,
      };

      const back = createCardBack(photo);
      const img = back.querySelector('.gallery-card__image') as HTMLImageElement;

      // Simulate image error
      const errorEvent = new Event('error');
      img.dispatchEvent(errorEvent);

      // Check that placeholder is created
      const placeholder = back.querySelector('.gallery-card__placeholder');
      expect(placeholder).not.toBeNull();
      expect(placeholder?.classList.contains('gallery-card__placeholder--error')).toBe(true);

      // Check placeholder content
      const icon = placeholder?.querySelector('.gallery-card__placeholder-icon');
      expect(icon?.textContent).toBe('💝');

      const text = placeholder?.querySelector('.gallery-card__placeholder-text');
      expect(text?.textContent).toBe('Photo coming soon');

      const subtext = placeholder?.querySelector('.gallery-card__placeholder-subtext');
      expect(subtext?.textContent).toBe('Add your special moment here');

      // Image should be hidden
      expect(img.style.display).toBe('none');
    });
  });

  describe('createEmptyGalleryState', () => {
    it('should create an empty state element with romantic content', () => {
      const emptyState = createEmptyGalleryState();

      expect(emptyState).toBeInstanceOf(HTMLElement);
      expect(emptyState.className).toBe('gallery-empty-state');

      // Check for heart icon
      const icon = emptyState.querySelector('.gallery-empty-state__icon');
      expect(icon).not.toBeNull();
      expect(icon?.textContent).toBe('💕');

      // Check for title
      const title = emptyState.querySelector('.gallery-empty-state__title');
      expect(title).not.toBeNull();
      expect(title?.textContent).toBe('Our Love Story Awaits');

      // Check for message
      const message = emptyState.querySelector('.gallery-empty-state__message');
      expect(message).not.toBeNull();
      expect(message?.textContent).toBe('Add your special photos to create beautiful memories together');

      // Check for hint
      const hint = emptyState.querySelector('.gallery-empty-state__hint');
      expect(hint).not.toBeNull();
      expect(hint?.textContent).toBe('Place photos in the /photos folder to get started');
    });
  });

  describe('createGalleryCardElement', () => {
    const defaultConfig: GalleryConfig = {
      photos: defaultPhotos,
      revealAnimation: 'flip',
      columns: { mobile: 2, tablet: 3, desktop: 4 },
      containerSelector: '#gallery-container',
    };

    it('should create a gallery card element with correct structure', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: false,
      };

      const card = createGalleryCardElement(photo, 0, defaultConfig);

      expect(card).toBeInstanceOf(HTMLElement);
      expect(card.classList.contains('gallery-card')).toBe(true);
      expect(card.classList.contains('gallery-card--flip')).toBe(true);
      expect(card.dataset.photoId).toBe('test-1');
      expect(card.dataset.index).toBe('0');
    });

    it('should have correct accessibility attributes', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: false,
      };

      const card = createGalleryCardElement(photo, 0, defaultConfig);

      expect(card.getAttribute('role')).toBe('button');
      expect(card.getAttribute('tabindex')).toBe('0');
      expect(card.getAttribute('aria-label')).toBe('Click to reveal photo');
      expect(card.getAttribute('aria-pressed')).toBe('false');
    });

    it('should have revealed class when photo is revealed', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: true,
      };

      const card = createGalleryCardElement(photo, 0, defaultConfig);

      expect(card.classList.contains('gallery-card--revealed')).toBe(true);
    });

    it('should contain inner container with front and back faces', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: false,
      };

      const card = createGalleryCardElement(photo, 0, defaultConfig);

      const inner = card.querySelector('.gallery-card__inner');
      expect(inner).not.toBeNull();

      const front = card.querySelector('.gallery-card__front');
      expect(front).not.toBeNull();

      const back = card.querySelector('.gallery-card__back');
      expect(back).not.toBeNull();
    });
  });

  describe('renderGalleryCards', () => {
    const defaultConfig: GalleryConfig = {
      photos: defaultPhotos,
      revealAnimation: 'flip',
      columns: { mobile: 2, tablet: 3, desktop: 4 },
      containerSelector: '#gallery-container',
    };

    it('should render correct number of cards', () => {
      const photos: GalleryPhoto[] = [
        { id: '1', src: '/photos/1.jpg', alt: 'Photo 1', revealed: false },
        { id: '2', src: '/photos/2.jpg', alt: 'Photo 2', revealed: false },
        { id: '3', src: '/photos/3.jpg', alt: 'Photo 3', revealed: false },
      ];

      const cards = renderGalleryCards(container, photos, defaultConfig);

      expect(cards.length).toBe(3);
      expect(container.children.length).toBe(3);
    });

    it('should clear existing content before rendering', () => {
      // Add some existing content
      container.innerHTML = '<div>Existing content</div>';

      const photos: GalleryPhoto[] = [
        { id: '1', src: '/photos/1.jpg', alt: 'Photo 1', revealed: false },
      ];

      renderGalleryCards(container, photos, defaultConfig);

      expect(container.children.length).toBe(1);
      expect(container.querySelector('.gallery-card')).not.toBeNull();
    });

    it('should render empty container for empty photos array', () => {
      const cards = renderGalleryCards(container, [], defaultConfig);

      expect(cards.length).toBe(0);
      // Empty state should be rendered instead
      const emptyState = container.querySelector('.gallery-empty-state');
      expect(emptyState).not.toBeNull();
    });

    it('should display romantic empty state when no photos provided', () => {
      renderGalleryCards(container, [], defaultConfig);

      const emptyState = container.querySelector('.gallery-empty-state');
      expect(emptyState).not.toBeNull();

      // Verify romantic content
      const title = emptyState?.querySelector('.gallery-empty-state__title');
      expect(title?.textContent).toBe('Our Love Story Awaits');

      const message = emptyState?.querySelector('.gallery-empty-state__message');
      expect(message?.textContent).toContain('special photos');
    });
  });

  describe('revealPhoto', () => {
    it('should reveal a photo and update state', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: false,
      };

      const state: GalleryState = {
        revealedPhotos: new Set<string>(),
      };

      const card = document.createElement('div');
      card.className = 'gallery-card';

      revealPhoto(card, photo, state);

      expect(photo.revealed).toBe(true);
      expect(state.revealedPhotos.has('test-1')).toBe(true);
      expect(card.classList.contains('gallery-card--revealed')).toBe(true);
    });

    it('should not reveal an already revealed photo', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: true,
      };

      const state: GalleryState = {
        revealedPhotos: new Set<string>(['test-1']),
      };

      const card = document.createElement('div');
      card.className = 'gallery-card';

      // Should not add class again
      revealPhoto(card, photo, state);

      expect(photo.revealed).toBe(true);
      expect(state.revealedPhotos.size).toBe(1);
    });
  });

  describe('setupCardInteraction', () => {
    it('should call onReveal callback when card is clicked', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: false,
      };

      const state: GalleryState = {
        revealedPhotos: new Set<string>(),
      };

      const card = document.createElement('div');
      card.className = 'gallery-card';

      const onReveal = vi.fn();
      setupCardInteraction(card, photo, state, onReveal);

      // Simulate click
      card.click();

      expect(onReveal).toHaveBeenCalledWith('test-1');
      expect(photo.revealed).toBe(true);
    });

    it('should reveal photo on Enter key press', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: false,
      };

      const state: GalleryState = {
        revealedPhotos: new Set<string>(),
      };

      const card = document.createElement('div');
      card.className = 'gallery-card';

      setupCardInteraction(card, photo, state);

      // Simulate Enter key
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      card.dispatchEvent(event);

      expect(photo.revealed).toBe(true);
    });

    it('should reveal photo on Space key press', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: false,
      };

      const state: GalleryState = {
        revealedPhotos: new Set<string>(),
      };

      const card = document.createElement('div');
      card.className = 'gallery-card';

      setupCardInteraction(card, photo, state);

      // Simulate Space key
      const event = new KeyboardEvent('keydown', { key: ' ' });
      card.dispatchEvent(event);

      expect(photo.revealed).toBe(true);
    });

    it('should return cleanup function that removes event listeners', () => {
      const photo: GalleryPhoto = {
        id: 'test-1',
        src: '/photos/test.jpg',
        alt: 'Test photo',
        revealed: false,
      };

      const state: GalleryState = {
        revealedPhotos: new Set<string>(),
      };

      const card = document.createElement('div');
      card.className = 'gallery-card';

      const onReveal = vi.fn();
      const cleanup = setupCardInteraction(card, photo, state, onReveal);

      // Call cleanup
      cleanup();

      // Click should not trigger callback after cleanup
      // (photo is already revealed from setup, so we need a fresh photo)
      const photo2: GalleryPhoto = {
        id: 'test-2',
        src: '/photos/test2.jpg',
        alt: 'Test photo 2',
        revealed: false,
      };

      const card2 = document.createElement('div');
      card2.className = 'gallery-card';

      const onReveal2 = vi.fn();
      const cleanup2 = setupCardInteraction(card2, photo2, state, onReveal2);
      cleanup2();

      // Reset the photo state for testing
      photo2.revealed = false;
      card2.click();

      // After cleanup, the click handler should be removed
      // The callback should not be called
      expect(onReveal2).not.toHaveBeenCalled();
    });
  });

  describe('createGallery', () => {
    it('should initialize gallery with default photos', () => {
      const gallery = createGallery();
      gallery.init();

      const photos = gallery.getPhotos();
      expect(photos.length).toBe(defaultPhotos.length);

      gallery.destroy();
    });

    it('should initialize gallery with custom photos', () => {
      const customPhotos: GalleryPhoto[] = [
        { id: 'custom-1', src: '/photos/custom1.jpg', alt: 'Custom 1', revealed: false },
        { id: 'custom-2', src: '/photos/custom2.jpg', alt: 'Custom 2', revealed: false },
      ];

      const gallery = createGallery({ photos: customPhotos });
      gallery.init();

      const photos = gallery.getPhotos();
      expect(photos.length).toBe(2);
      expect(photos[0]?.id).toBe('custom-1');

      gallery.destroy();
    });

    it('should render cards into container', () => {
      const gallery = createGallery();
      gallery.init();

      const cardElements = gallery.getCardElements();
      expect(cardElements.length).toBe(defaultPhotos.length);
      expect(container.children.length).toBe(defaultPhotos.length);

      gallery.destroy();
    });

    it('should track revealed photos in state', () => {
      const gallery = createGallery();
      gallery.init();

      const state = gallery.getState();
      expect(state.revealedPhotos).toBeInstanceOf(Set);
      expect(state.revealedPhotos.size).toBe(0);

      gallery.destroy();
    });

    it('should reveal photo by ID', () => {
      const gallery = createGallery();
      gallery.init();

      gallery.revealPhoto('1');

      expect(gallery.isPhotoRevealed('1')).toBe(true);
      expect(gallery.isPhotoRevealed('2')).toBe(false);

      gallery.destroy();
    });

    it('should reveal all photos', () => {
      const gallery = createGallery();
      gallery.init();

      gallery.revealAll();

      const photos = gallery.getPhotos();
      photos.forEach((photo) => {
        expect(gallery.isPhotoRevealed(photo.id)).toBe(true);
      });

      gallery.destroy();
    });

    it('should handle missing container gracefully', () => {
      // Remove the container
      document.body.innerHTML = '';

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const gallery = createGallery();
      gallery.init();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Gallery container not found: #gallery-container'
      );

      gallery.destroy();
    });

    it('should clean up on destroy', () => {
      const gallery = createGallery();
      gallery.init();

      expect(container.children.length).toBeGreaterThan(0);

      gallery.destroy();

      expect(container.children.length).toBe(0);
      expect(gallery.getState().revealedPhotos.size).toBe(0);
    });

    it('should not initialize twice', () => {
      const gallery = createGallery();
      gallery.init();

      const initialCardCount = container.children.length;

      // Try to initialize again
      gallery.init();

      // Should not add more cards
      expect(container.children.length).toBe(initialCardCount);

      gallery.destroy();
    });
  });

  describe('Gallery Photo Reveal State - Requirement 4.2', () => {
    it('should persist revealed state after reveal', () => {
      const gallery = createGallery();
      gallery.init();

      // Reveal a photo
      gallery.revealPhoto('1');

      // Check state persists
      expect(gallery.isPhotoRevealed('1')).toBe(true);

      // Reveal same photo again (should not change anything)
      gallery.revealPhoto('1');

      // State should still be revealed
      expect(gallery.isPhotoRevealed('1')).toBe(true);

      gallery.destroy();
    });

    it('should update card element class when revealed', () => {
      const gallery = createGallery();
      gallery.init();

      const cards = gallery.getCardElements();
      const firstCard = cards[0];
      expect(firstCard).toBeDefined();

      expect(firstCard!.classList.contains('gallery-card--revealed')).toBe(false);

      gallery.revealPhoto('1');

      expect(firstCard!.classList.contains('gallery-card--revealed')).toBe(true);

      gallery.destroy();
    });
  });

  describe('Click-to-Flip Mechanism - Requirement 4.6', () => {
    it('should reveal photo when card is clicked', () => {
      const gallery = createGallery();
      gallery.init();

      const cards = gallery.getCardElements();
      const firstCard = cards[0];
      expect(firstCard).toBeDefined();

      expect(gallery.isPhotoRevealed('1')).toBe(false);

      // Simulate click
      firstCard!.click();

      expect(gallery.isPhotoRevealed('1')).toBe(true);
      expect(firstCard!.classList.contains('gallery-card--revealed')).toBe(true);

      gallery.destroy();
    });

    it('should not re-reveal already revealed photo on click', () => {
      const gallery = createGallery();
      gallery.init();

      const cards = gallery.getCardElements();
      const firstCard = cards[0];
      expect(firstCard).toBeDefined();

      // First click
      firstCard!.click();
      expect(gallery.isPhotoRevealed('1')).toBe(true);

      // Second click should not change anything
      firstCard!.click();
      expect(gallery.isPhotoRevealed('1')).toBe(true);

      gallery.destroy();
    });
  });
});

/**
 * Property-Based Tests for Gallery Photo Reveal State
 * 
 * Feature: valentine-love-website, Property 7: Gallery Photo Reveal State
 * 
 * *For any* gallery photo card, clicking the card SHALL toggle its revealed state
 * from false to true, and the revealed state SHALL persist (not revert on subsequent interactions).
 * 
 * **Validates: Requirements 4.2**
 */
describe('Property 7: Gallery Photo Reveal State', () => {
  let container: HTMLDivElement;

  // Arbitrary generator for GalleryPhoto objects
  const galleryPhotoArb = fc.record({
    id: fc.uuid(),
    src: fc.webUrl(),
    alt: fc.string({ minLength: 1, maxLength: 100 }),
    revealed: fc.constant(false), // All photos start unrevealed
  });

  // Generator for arrays of GalleryPhoto with unique IDs
  const galleryPhotosArb = fc.array(galleryPhotoArb, { minLength: 1, maxLength: 20 })
    .map((photos) => {
      // Ensure unique IDs by appending index
      return photos.map((photo, index) => ({
        ...photo,
        id: `${photo.id}-${index}`,
      }));
    });

  beforeEach(() => {
    // Create a container element for testing
    container = document.createElement('div');
    container.id = 'gallery-container';
    container.className = 'gallery-grid';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
  });

  it('clicking any photo reveals it (revealed becomes true)', () => {
    // Feature: valentine-love-website, Property 7: Gallery Photo Reveal State
    fc.assert(
      fc.property(
        galleryPhotosArb,
        fc.integer({ min: 0, max: 100 }),
        (photos, indexSeed) => {
          // Select a photo index within bounds
          const photoIndex = indexSeed % photos.length;
          
          // Create gallery with generated photos
          const gallery = createGallery({ photos });
          gallery.init();

          const galleryPhotos = gallery.getPhotos();
          const targetPhoto = galleryPhotos[photoIndex];
          expect(targetPhoto).toBeDefined();

          // Verify photo starts unrevealed
          expect(gallery.isPhotoRevealed(targetPhoto!.id)).toBe(false);

          // Click the card to reveal
          const cards = gallery.getCardElements();
          const targetCard = cards[photoIndex];
          expect(targetCard).toBeDefined();
          targetCard!.click();

          // Verify photo is now revealed
          expect(gallery.isPhotoRevealed(targetPhoto!.id)).toBe(true);

          // Verify card has revealed class
          expect(targetCard!.classList.contains('gallery-card--revealed')).toBe(true);

          gallery.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('revealed state persists (does not revert on subsequent interactions)', () => {
    // Feature: valentine-love-website, Property 7: Gallery Photo Reveal State
    fc.assert(
      fc.property(
        galleryPhotosArb,
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 10 }), // Number of subsequent clicks
        (photos, indexSeed, numClicks) => {
          const photoIndex = indexSeed % photos.length;

          const gallery = createGallery({ photos });
          gallery.init();

          const galleryPhotos = gallery.getPhotos();
          const targetPhoto = galleryPhotos[photoIndex];
          expect(targetPhoto).toBeDefined();

          const cards = gallery.getCardElements();
          const targetCard = cards[photoIndex];
          expect(targetCard).toBeDefined();

          // First click to reveal
          targetCard!.click();
          expect(gallery.isPhotoRevealed(targetPhoto!.id)).toBe(true);

          // Subsequent clicks should not change the revealed state
          for (let i = 0; i < numClicks; i++) {
            targetCard!.click();
            // State should persist as revealed
            expect(gallery.isPhotoRevealed(targetPhoto!.id)).toBe(true);
            expect(targetCard!.classList.contains('gallery-card--revealed')).toBe(true);
          }

          gallery.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('clicking an already revealed photo does not change its state', () => {
    // Feature: valentine-love-website, Property 7: Gallery Photo Reveal State
    fc.assert(
      fc.property(
        galleryPhotosArb,
        fc.integer({ min: 0, max: 100 }),
        (photos, indexSeed) => {
          const photoIndex = indexSeed % photos.length;

          const gallery = createGallery({ photos });
          gallery.init();

          const galleryPhotos = gallery.getPhotos();
          const targetPhoto = galleryPhotos[photoIndex];
          expect(targetPhoto).toBeDefined();

          const cards = gallery.getCardElements();
          const targetCard = cards[photoIndex];
          expect(targetCard).toBeDefined();

          // Reveal the photo first
          gallery.revealPhoto(targetPhoto!.id);
          expect(gallery.isPhotoRevealed(targetPhoto!.id)).toBe(true);

          // Get state before clicking
          const stateBefore = gallery.getState();
          const revealedCountBefore = stateBefore.revealedPhotos.size;

          // Click the already revealed photo
          targetCard!.click();

          // State should remain unchanged
          expect(gallery.isPhotoRevealed(targetPhoto!.id)).toBe(true);
          
          // The revealed photos count should not increase
          const stateAfter = gallery.getState();
          expect(stateAfter.revealedPhotos.size).toBe(revealedCountBefore);

          gallery.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('revealing multiple photos maintains all revealed states', () => {
    // Feature: valentine-love-website, Property 7: Gallery Photo Reveal State
    fc.assert(
      fc.property(
        fc.array(galleryPhotoArb, { minLength: 2, maxLength: 15 })
          .map((photos) => photos.map((photo, index) => ({
            ...photo,
            id: `${photo.id}-${index}`,
          }))),
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 }),
        (photos, indicesToReveal) => {
          const gallery = createGallery({ photos });
          gallery.init();

          const galleryPhotos = gallery.getPhotos();
          const cards = gallery.getCardElements();
          const revealedIds = new Set<string>();

          // Reveal photos at the specified indices
          for (const indexSeed of indicesToReveal) {
            const photoIndex = indexSeed % photos.length;
            const targetPhoto = galleryPhotos[photoIndex];
            const targetCard = cards[photoIndex];

            if (targetPhoto && targetCard) {
              targetCard.click();
              revealedIds.add(targetPhoto.id);
            }
          }

          // Verify all revealed photos maintain their state
          for (const id of revealedIds) {
            expect(gallery.isPhotoRevealed(id)).toBe(true);
          }

          // Verify unrevealed photos remain unrevealed
          for (const photo of galleryPhotos) {
            if (!revealedIds.has(photo.id)) {
              expect(gallery.isPhotoRevealed(photo.id)).toBe(false);
            }
          }

          gallery.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
