/**
 * DOM Utility Functions
 * Helper functions for DOM manipulation used throughout the Valentine Love Website
 */

/**
 * Query a single element from the DOM
 * @param selector - CSS selector string
 * @param parent - Optional parent element to query within (defaults to document)
 * @returns The found element or null
 */
export function $(selector: string, parent: ParentNode = document): Element | null {
  return parent.querySelector(selector);
}

/**
 * Query all matching elements from the DOM
 * @param selector - CSS selector string
 * @param parent - Optional parent element to query within (defaults to document)
 * @returns NodeList of matching elements
 */
export function $$(selector: string, parent: ParentNode = document): NodeListOf<Element> {
  return parent.querySelectorAll(selector);
}

/**
 * Get an element by ID
 * @param id - Element ID (without the # prefix)
 * @returns The found element or null
 */
export function getById(id: string): HTMLElement | null {
  return document.getElementById(id);
}

/**
 * Options for creating an element
 */
export interface CreateElementOptions {
  className?: string;
  id?: string;
  textContent?: string;
  innerHTML?: string;
  attributes?: Record<string, string>;
  children?: (HTMLElement | string)[];
  dataset?: Record<string, string>;
}

/**
 * Create an HTML element with optional configuration
 * @param tag - HTML tag name
 * @param options - Configuration options for the element
 * @returns The created element
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: CreateElementOptions = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (options.className) {
    element.className = options.className;
  }

  if (options.id) {
    element.id = options.id;
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  if (options.innerHTML) {
    element.innerHTML = options.innerHTML;
  }

  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, value);
    }
  }

  if (options.dataset) {
    for (const [key, value] of Object.entries(options.dataset)) {
      element.dataset[key] = value;
    }
  }

  if (options.children) {
    for (const child of options.children) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    }
  }

  return element;
}

/**
 * Add one or more classes to an element
 * @param element - Target element
 * @param classes - Class name(s) to add
 */
export function addClass(element: Element, ...classes: string[]): void {
  element.classList.add(...classes);
}

/**
 * Remove one or more classes from an element
 * @param element - Target element
 * @param classes - Class name(s) to remove
 */
export function removeClass(element: Element, ...classes: string[]): void {
  element.classList.remove(...classes);
}

/**
 * Toggle a class on an element
 * @param element - Target element
 * @param className - Class name to toggle
 * @param force - Optional boolean to force add (true) or remove (false)
 * @returns Boolean indicating if the class is now present
 */
export function toggleClass(element: Element, className: string, force?: boolean): boolean {
  return element.classList.toggle(className, force);
}

/**
 * Check if an element has a specific class
 * @param element - Target element
 * @param className - Class name to check
 * @returns Boolean indicating if the class is present
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * Replace one class with another on an element
 * @param element - Target element
 * @param oldClass - Class to remove
 * @param newClass - Class to add
 */
export function replaceClass(element: Element, oldClass: string, newClass: string): void {
  element.classList.replace(oldClass, newClass);
}

/**
 * Convert camelCase to kebab-case for CSS properties
 * @param str - camelCase string
 * @returns kebab-case string
 */
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Set multiple CSS styles on an element
 * @param element - Target element
 * @param styles - Object containing style properties and values (camelCase or kebab-case)
 */
export function setStyles(element: HTMLElement, styles: Record<string, string>): void {
  for (const [property, value] of Object.entries(styles)) {
    if (value !== undefined) {
      // Convert camelCase to kebab-case for setProperty
      const kebabProperty = property.includes('-') ? property : camelToKebab(property);
      element.style.setProperty(kebabProperty, value);
    }
  }
}

/**
 * Set multiple attributes on an element
 * @param element - Target element
 * @param attributes - Object containing attribute names and values
 */
export function setAttributes(element: Element, attributes: Record<string, string>): void {
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

/**
 * Remove an element from the DOM
 * @param element - Element to remove
 */
export function removeElement(element: Element): void {
  element.remove();
}

/**
 * Append multiple children to a parent element
 * @param parent - Parent element
 * @param children - Children to append
 */
export function appendChildren(parent: Element, ...children: (Element | string)[]): void {
  for (const child of children) {
    if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child));
    } else {
      parent.appendChild(child);
    }
  }
}

/**
 * Clear all children from an element
 * @param element - Element to clear
 */
export function clearChildren(element: Element): void {
  element.innerHTML = '';
}

/**
 * Check if an element is visible in the viewport
 * @param element - Element to check
 * @param threshold - Percentage of element that must be visible (0-1)
 * @returns Boolean indicating if element is in viewport
 */
export function isInViewport(element: Element, threshold: number = 0): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const verticalVisible =
    rect.top <= windowHeight * (1 - threshold) && rect.bottom >= windowHeight * threshold;
  const horizontalVisible =
    rect.left <= windowWidth * (1 - threshold) && rect.right >= windowWidth * threshold;

  return verticalVisible && horizontalVisible;
}

/**
 * Get the computed style value of an element
 * @param element - Target element
 * @param property - CSS property name
 * @returns The computed style value
 */
export function getComputedStyleValue(element: Element, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property);
}
