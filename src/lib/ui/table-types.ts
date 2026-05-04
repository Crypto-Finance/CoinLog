/**
 * UI-related types for table components.
 * Separated from domain types for better modularity.
 */

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: keyof import('../domain/types').Trade;
  direction: SortDirection;
}
