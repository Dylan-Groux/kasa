import { describe, expect, it } from 'vitest';
import { resolveSwipeDirection, wrapIndex } from '../carouselMath';

describe('wrapIndex', () => {
  it('returns the index unchanged when already in range', () => {
    expect(wrapIndex(2, 5)).toBe(2);
    expect(wrapIndex(0, 5)).toBe(0);
  });

  it('wraps forward past the last index back to the start', () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(6, 5)).toBe(1);
  });

  it('wraps backward past the first index to the end', () => {
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(-6, 5)).toBe(4);
  });

  it('returns 0 for a length of zero or less, regardless of index', () => {
    expect(wrapIndex(3, 0)).toBe(0);
    expect(wrapIndex(-3, 0)).toBe(0);
    expect(wrapIndex(1, -2)).toBe(0);
  });

  it('always keeps a single-item carousel at index 0', () => {
    expect(wrapIndex(1, 1)).toBe(0);
    expect(wrapIndex(-1, 1)).toBe(0);
  });
});

describe('resolveSwipeDirection', () => {
  it('ignores movement below the swipe threshold', () => {
    expect(resolveSwipeDirection(10)).toBeNull();
    expect(resolveSwipeDirection(-39)).toBeNull();
    expect(resolveSwipeDirection(0)).toBeNull();
  });

  it('resolves a rightward drag (positive delta) to "prev"', () => {
    expect(resolveSwipeDirection(40)).toBe('prev');
    expect(resolveSwipeDirection(120)).toBe('prev');
  });

  it('resolves a leftward drag (negative delta) to "next"', () => {
    expect(resolveSwipeDirection(-40)).toBe('next');
    expect(resolveSwipeDirection(-120)).toBe('next');
  });
});
