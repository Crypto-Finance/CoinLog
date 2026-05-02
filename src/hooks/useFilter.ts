'use client';

import { useState, useMemo } from 'react';

/**
 * Generic filter hook for filtering arrays by a single string key.
 *
 * @param items - Array of items to filter
 * @param filterKey - The key on each item to filter by
 * @returns Object with filterValue, setFilterValue, and filtered array
 */
export function useFilter<T>(items: T[], filterKey: keyof T) {
  const [filterValue, setFilterValue] = useState('');

  const filtered = useMemo(() => {
    if (!filterValue) return items;
    const lower = filterValue.toLowerCase();
    return items.filter((item) =>
      String(item[filterKey]).toLowerCase().includes(lower),
    );
  }, [items, filterValue, filterKey]);

  return { filterValue, setFilterValue, filtered };
}
