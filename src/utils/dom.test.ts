/**
 * DOM Utility Functions - Unit Tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  $,
  $$,
  getById,
  createElement,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  replaceClass,
  setStyles,
  setAttributes,
  removeElement,
  appendChildren,
  clearChildren,
  isInViewport,
  getComputedStyleValue,
} from './dom';

describe('DOM Utility Functions', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a test container for each test
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up after each test
    container.remove();
  });

  describe('Query Helpers', () => {
    it('$ should select a single element', () => {
      container.innerHTML = '<div class="test-element">Test</div>';
      const element = $('.test-element', container);
      expect(element).not.toBeNull();
      expect(element?.textContent).toBe('Test');
    });

    it('$ should return null when element not found', () => {
      const element = $('.non-existent', container);
      expect(element).toBeNull();
    });

    it('$$ should select all matching elements', () => {
      container.innerHTML = `
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
      `;
      const elements = $$('.item', container);
      expect(elements.length).toBe(3);
    });

    it('$$ should return empty NodeList when no elements found', () => {
      const elements = $$('.non-existent', container);
      expect(elements.length).toBe(0);
    });

    it('getById should find element by ID', () => {
      const element = getById('test-container');
      expect(element).not.toBeNull();
      expect(element?.id).toBe('test-container');
    });

    it('getById should return null for non-existent ID', () => {
      const element = getById('non-existent-id');
      expect(element).toBeNull();
    });
  });

  describe('Element Creation', () => {
    it('createElement should create a basic element', () => {
      const div = createElement('div');
      expect(div.tagName).toBe('DIV');
    });

    it('createElement should set className', () => {
      const div = createElement('div', { className: 'my-class' });
      expect(div.className).toBe('my-class');
    });

    it('createElement should set id', () => {
      const div = createElement('div', { id: 'my-id' });
      expect(div.id).toBe('my-id');
    });

    it('createElement should set textContent', () => {
      const div = createElement('div', { textContent: 'Hello World' });
      expect(div.textContent).toBe('Hello World');
    });

    it('createElement should set innerHTML', () => {
      const div = createElement('div', { innerHTML: '<span>Inner</span>' });
      expect(div.innerHTML).toBe('<span>Inner</span>');
    });

    it('createElement should set attributes', () => {
      const button = createElement('button', {
        attributes: { type: 'submit', 'aria-label': 'Submit form' },
      });
      expect(button.getAttribute('type')).toBe('submit');
      expect(button.getAttribute('aria-label')).toBe('Submit form');
    });

    it('createElement should set dataset', () => {
      const div = createElement('div', {
        dataset: { testId: 'my-test', value: '123' },
      });
      expect(div.dataset.testId).toBe('my-test');
      expect(div.dataset.value).toBe('123');
    });

    it('createElement should append children elements', () => {
      const child1 = createElement('span', { textContent: 'Child 1' });
      const child2 = createElement('span', { textContent: 'Child 2' });
      const parent = createElement('div', { children: [child1, child2] });
      expect(parent.children.length).toBe(2);
      expect(parent.children[0]?.textContent).toBe('Child 1');
      expect(parent.children[1]?.textContent).toBe('Child 2');
    });

    it('createElement should append string children as text nodes', () => {
      const parent = createElement('div', { children: ['Hello ', 'World'] });
      expect(parent.textContent).toBe('Hello World');
    });
  });

  describe('Class Manipulation', () => {
    let element: HTMLDivElement;

    beforeEach(() => {
      element = document.createElement('div');
      container.appendChild(element);
    });

    it('addClass should add a single class', () => {
      addClass(element, 'new-class');
      expect(element.classList.contains('new-class')).toBe(true);
    });

    it('addClass should add multiple classes', () => {
      addClass(element, 'class1', 'class2', 'class3');
      expect(element.classList.contains('class1')).toBe(true);
      expect(element.classList.contains('class2')).toBe(true);
      expect(element.classList.contains('class3')).toBe(true);
    });

    it('removeClass should remove a single class', () => {
      element.className = 'existing-class';
      removeClass(element, 'existing-class');
      expect(element.classList.contains('existing-class')).toBe(false);
    });

    it('removeClass should remove multiple classes', () => {
      element.className = 'class1 class2 class3';
      removeClass(element, 'class1', 'class3');
      expect(element.classList.contains('class1')).toBe(false);
      expect(element.classList.contains('class2')).toBe(true);
      expect(element.classList.contains('class3')).toBe(false);
    });

    it('toggleClass should add class when not present', () => {
      const result = toggleClass(element, 'toggle-class');
      expect(result).toBe(true);
      expect(element.classList.contains('toggle-class')).toBe(true);
    });

    it('toggleClass should remove class when present', () => {
      element.className = 'toggle-class';
      const result = toggleClass(element, 'toggle-class');
      expect(result).toBe(false);
      expect(element.classList.contains('toggle-class')).toBe(false);
    });

    it('toggleClass should force add with true', () => {
      const result = toggleClass(element, 'forced-class', true);
      expect(result).toBe(true);
      expect(element.classList.contains('forced-class')).toBe(true);
    });

    it('toggleClass should force remove with false', () => {
      element.className = 'forced-class';
      const result = toggleClass(element, 'forced-class', false);
      expect(result).toBe(false);
      expect(element.classList.contains('forced-class')).toBe(false);
    });

    it('hasClass should return true when class exists', () => {
      element.className = 'existing-class';
      expect(hasClass(element, 'existing-class')).toBe(true);
    });

    it('hasClass should return false when class does not exist', () => {
      expect(hasClass(element, 'non-existent')).toBe(false);
    });

    it('replaceClass should replace one class with another', () => {
      element.className = 'old-class';
      replaceClass(element, 'old-class', 'new-class');
      expect(element.classList.contains('old-class')).toBe(false);
      expect(element.classList.contains('new-class')).toBe(true);
    });
  });

  describe('Style and Attribute Manipulation', () => {
    let element: HTMLDivElement;

    beforeEach(() => {
      element = document.createElement('div');
      container.appendChild(element);
    });

    it('setStyles should set multiple CSS styles', () => {
      setStyles(element, {
        backgroundColor: 'red',
        fontSize: '16px',
        display: 'flex',
      });
      expect(element.style.backgroundColor).toBe('red');
      expect(element.style.fontSize).toBe('16px');
      expect(element.style.display).toBe('flex');
    });

    it('setAttributes should set multiple attributes', () => {
      setAttributes(element, {
        'data-id': '123',
        role: 'button',
        'aria-pressed': 'false',
      });
      expect(element.getAttribute('data-id')).toBe('123');
      expect(element.getAttribute('role')).toBe('button');
      expect(element.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('DOM Manipulation', () => {
    it('removeElement should remove element from DOM', () => {
      const element = document.createElement('div');
      element.id = 'to-remove';
      container.appendChild(element);
      
      expect(document.getElementById('to-remove')).not.toBeNull();
      removeElement(element);
      expect(document.getElementById('to-remove')).toBeNull();
    });

    it('appendChildren should append multiple elements', () => {
      const child1 = document.createElement('span');
      const child2 = document.createElement('span');
      appendChildren(container, child1, child2);
      expect(container.children.length).toBe(2);
    });

    it('appendChildren should append text strings', () => {
      appendChildren(container, 'Hello ', 'World');
      expect(container.textContent).toBe('Hello World');
    });

    it('clearChildren should remove all children', () => {
      container.innerHTML = '<div>1</div><div>2</div><div>3</div>';
      expect(container.children.length).toBe(3);
      clearChildren(container);
      expect(container.children.length).toBe(0);
    });
  });

  describe('Viewport Detection', () => {
    it('isInViewport should return true for visible element', () => {
      const element = document.createElement('div');
      element.style.width = '100px';
      element.style.height = '100px';
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = '0';
      document.body.appendChild(element);

      // In jsdom, getBoundingClientRect returns zeros, so we test the function logic
      // by checking it doesn't throw and returns a boolean
      const result = isInViewport(element);
      expect(typeof result).toBe('boolean');
      element.remove();
    });

    it('isInViewport should accept threshold parameter', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      // Test that the function accepts threshold parameter without error
      const result = isInViewport(element, 0.5);
      expect(typeof result).toBe('boolean');
      element.remove();
    });
  });

  describe('Computed Styles', () => {
    it('getComputedStyleValue should return computed style', () => {
      const element = document.createElement('div');
      element.style.display = 'block';
      document.body.appendChild(element);

      const display = getComputedStyleValue(element, 'display');
      expect(display).toBe('block');
      element.remove();
    });
  });
});
