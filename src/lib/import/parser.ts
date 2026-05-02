/**
 * Generic CSV Parser
 * 
 * Handles low-level CSV parsing operations:
 * - Splitting CSV string into rows (handles quoted fields with newlines)
 * - Parsing individual lines into field arrays
 * - Handles escaped quotes and quoted fields
 * 
 * This module is domain-agnostic and could be reused for any CSV parsing need.
 */

/**
 * Parse a single CSV line into an array of field values.
 * Handles quoted fields (double-quotes) and escaped quotes ("" → ").
 */
export function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        current += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
        i++;
      } else {
        current += ch;
        i++;
      }
    }
  }

  fields.push(current);
  return fields;
}

/**
 * Split a cleaned CSV string into an array of raw string rows.
 * Handles newlines inside quoted fields correctly.
 */
export function parseCSVRows(csv: string): string[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];

    if (ch === '"') {
      currentLine += ch;
      inQuotes = !inQuotes;
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && i + 1 < csv.length && csv[i + 1] === '\n') {
        continue;
      }
      if (currentLine.trim().length > 0) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += ch;
    }
  }

  if (currentLine.trim().length > 0) {
    lines.push(currentLine);
  }

  return lines;
}
