/**
 * CSV Import/Export Utilities - Backward Compatibility Layer
 * 
 * This module now re-exports from the split concern-separated modules:
 * - parser.ts: Generic CSV parsing
 * - validator.ts: Domain validation
 * - builder.ts: Trade construction
 * 
 * @deprecated Import directly from '@/lib/import' instead
 */

export {
  parseCSV,
  exportToCSV,
  computeIsAnnotated,
  parseCSVLine,
  parseCSVRows,
  buildHeaderMap,
  validateRow,
  createFieldAccessor,
  buildTrade,
  rowsToTrades,
  type FieldAccessor,
} from './import';
