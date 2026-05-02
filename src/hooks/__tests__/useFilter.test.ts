import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilter } from '../useFilter';

describe('useFilter', () => {
  interface TestItem {
    name: string;
    value: number;
  }

  const testItems: TestItem[] = [
    { name: 'Apple', value: 1 },
    { name: 'Banana', value: 2 },
    { name: 'Cherry', value: 3 },
    { name: 'Avocado', value: 4 },
    { name: 'Pineapple', value: 5 },
  ];

  describe('filter state management', () => {
    it('initializes with empty filter value', () => {
      const { result } = renderHook(() => useFilter(testItems, 'name'));
      
      expect(result.current.filterValue).toBe('');
    });

    it('returns all items when filter is empty', () => {
      const { result } = renderHook(() => useFilter(testItems, 'name'));
      
      expect(result.current.filtered).toEqual(testItems);
      expect(result.current.filtered).toHaveLength(5);
    });

    it('updates filter value when setFilterValue is called', () => {
      const { result } = renderHook(() => useFilter(testItems, 'name'));
      
      act(() => {
        result.current.setFilterValue('apple');
      });
      
      expect(result.current.filterValue).toBe('apple');
    });
  });

  describe('filtering behavior', () => {
    it('filters items by exact match', () => {
      const { result } = renderHook(() => useFilter(testItems, 'name'));
      
      act(() => {
        result.current.setFilterValue('Banana');
      });
      
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].name).toBe('Banana');
    });

    it('filters items by partial match', () => {
      const { result } = renderHook(() => useFilter(testItems, 'name'));
      
      act(() => {
        result.current.setFilterValue('pp');
      });
      
      // "Apple" and "Pineapple" both contain "pp"
      expect(result.current.filtered).toHaveLength(2);
      expect(result.current.filtered.map(i => i.name)).toContain('Apple');
      expect(result.current.filtered.map(i => i.name)).toContain('Pineapple');
    });

    it('is case-insensitive', () => {
      const { result } = renderHook(() => useFilter(testItems, 'name'));
      
      act(() => {
        result.current.setFilterValue('APPLE');
      });
      
      // "Apple" and "Pineapple" both contain "apple" (case-insensitive)
      expect(result.current.filtered).toHaveLength(2);
      expect(result.current.filtered.map(i => i.name)).toContain('Apple');
      expect(result.current.filtered.map(i => i.name)).toContain('Pineapple');
    });

    it('returns empty array when no matches', () => {
      const { result } = renderHook(() => useFilter(testItems, 'name'));
      
      act(() => {
        result.current.setFilterValue('xyz123');
      });
      
      expect(result.current.filtered).toHaveLength(0);
    });

    it('clears filter when set to empty string', () => {
      const { result } = renderHook(() => useFilter(testItems, 'name'));
      
      act(() => {
        result.current.setFilterValue('Apple');
      });
      expect(result.current.filtered).toHaveLength(2); // Apple and Pineapple
      
      act(() => {
        result.current.setFilterValue('');
      });
      
      expect(result.current.filterValue).toBe('');
      expect(result.current.filtered).toHaveLength(5);
    });
  });

  describe('different filter keys', () => {
    it('filters by different key', () => {
      const { result } = renderHook(() => useFilter(testItems, 'value'));
      
      act(() => {
        result.current.setFilterValue('2');
      });
      
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].name).toBe('Banana');
      expect(result.current.filtered[0].value).toBe(2);
    });

    it('handles numeric filtering as string', () => {
      const { result } = renderHook(() => useFilter(testItems, 'value'));
      
      act(() => {
        result.current.setFilterValue('1');
      });
      
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].value).toBe(1);
    });
  });

  describe('empty items array', () => {
    it('returns empty array when items is empty', () => {
      const { result } = renderHook(() => useFilter<TestItem>([], 'name'));
      
      expect(result.current.filtered).toEqual([]);
      expect(result.current.filterValue).toBe('');
    });

    it('still allows setting filter value on empty array', () => {
      const { result } = renderHook(() => useFilter<TestItem>([], 'name'));
      
      act(() => {
        result.current.setFilterValue('test');
      });
      
      expect(result.current.filterValue).toBe('test');
      expect(result.current.filtered).toEqual([]);
    });
  });

  describe('reactivity', () => {
    it('updates filtered results when items change', () => {
      const { result, rerender } = renderHook(
        ({ items }) => useFilter(items, 'name'),
        { initialProps: { items: testItems } }
      );
      
      act(() => {
        result.current.setFilterValue('Apple');
      });
      
      expect(result.current.filtered).toHaveLength(2); // Apple and Pineapple
      
      // Change items
      const newItems: TestItem[] = [
        { name: 'Apple', value: 1 },
        { name: 'Orange', value: 5 },
      ];
      
      rerender({ items: newItems });
      
      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].name).toBe('Apple');
    });

    it('maintains filter value when items change', () => {
      const { result, rerender } = renderHook(
        ({ items }) => useFilter(items, 'name'),
        { initialProps: { items: testItems } }
      );
      
      act(() => {
        result.current.setFilterValue('Apple');
      });
      
      const newItems: TestItem[] = [
        { name: 'Apple', value: 1 },
        { name: 'Orange', value: 5 },
      ];
      
      rerender({ items: newItems });
      
      expect(result.current.filterValue).toBe('Apple');
    });
  });
});
