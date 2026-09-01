import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCarousel } from '../useCarousel';

describe('useCarousel', () => {
  it('starts at index 0', () => {
    const { result } = renderHook(() => useCarousel(3));
    expect(result.current.activeIndex).toBe(0);
  });

  it('goNext advances the index and wraps past the last item', () => {
    const { result } = renderHook(() => useCarousel(3));

    act(() => result.current.goNext());
    expect(result.current.activeIndex).toBe(1);

    act(() => result.current.goNext());
    act(() => result.current.goNext());
    expect(result.current.activeIndex).toBe(0);
  });

  it('goPrev retreats the index and wraps before the first item', () => {
    const { result } = renderHook(() => useCarousel(3));

    act(() => result.current.goPrev());
    expect(result.current.activeIndex).toBe(2);
  });

  it('goTo jumps directly to the requested index', () => {
    const { result } = renderHook(() => useCarousel(5));

    act(() => result.current.goTo(3));
    expect(result.current.activeIndex).toBe(3);
  });

  it('goTo wraps an out-of-range index instead of crashing', () => {
    const { result } = renderHook(() => useCarousel(3));

    act(() => result.current.goTo(7));
    expect(result.current.activeIndex).toBe(1);
  });

  it('keeps a single-item carousel pinned at index 0', () => {
    const { result } = renderHook(() => useCarousel(1));

    act(() => result.current.goNext());
    expect(result.current.activeIndex).toBe(0);

    act(() => result.current.goPrev());
    expect(result.current.activeIndex).toBe(0);
  });
});
