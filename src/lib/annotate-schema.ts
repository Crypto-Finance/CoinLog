import { z } from 'zod';
import { EXIT_TYPES, MARKET_CONDITIONS } from './field-options';
import { optionalNonNegativeNumber, optionalNumberWithNegative } from './schema-utils';

export const annotateSchema = z.object({
  setupType: z.string().optional(),
  setupTypeCustom: z.string().optional(),
  exitType: z.enum(EXIT_TYPES as [string, ...string[]]).optional(),
  marketCondition: z.enum(MARKET_CONDITIONS as [string, ...string[]]).optional(),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
  notes: z.string().optional(),
  riskAmount: optionalNonNegativeNumber,
  rrPlanned: optionalNonNegativeNumber,
  rrActual: optionalNumberWithNegative,
});

export type AnnotateFormData = z.infer<typeof annotateSchema>;
