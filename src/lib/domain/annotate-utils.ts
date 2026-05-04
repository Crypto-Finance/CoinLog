import type { Trade } from './types';
import { SETUP_TYPES } from '../ui/field-options';
import type { AnnotateFormData } from './annotate-schema';

/**
 * Map a Trade object to AnnotateFormData for form initialization.
 */
export function tradeToAnnotateForm(trade: Trade): AnnotateFormData {
  const isCustomSetup = trade.setupType && !SETUP_TYPES.slice(0, -1).includes(trade.setupType);
  return {
    setupType: isCustomSetup ? 'Other' : (trade.setupType || undefined),
    setupTypeCustom: isCustomSetup ? trade.setupType : '',
    exitType: trade.exitType || undefined,
    marketCondition: trade.marketCondition || undefined,
    stopLoss: trade.stopLoss || '',
    takeProfit: trade.takeProfit || '',
    notes: trade.notes || undefined,
    riskAmount: trade.riskAmount || '',
    rrPlanned: trade.rrPlanned || '',
    rrActual: trade.rrActual || '',
  };
}

/**
 * Map AnnotateFormData values back to Partial<Trade> for update.
 */
export function annotateFormToTrade(
  values: AnnotateFormData
): Partial<Trade> {
  return {
    setupType: values.setupType === 'Other' && values.setupTypeCustom 
      ? values.setupTypeCustom 
      : values.setupType,
    exitType: values.exitType,
    marketCondition: values.marketCondition,
    stopLoss: values.stopLoss,
    takeProfit: values.takeProfit,
    notes: values.notes,
    riskAmount: values.riskAmount,
    rrPlanned: values.rrPlanned,
    rrActual: values.rrActual,
    isAnnotated: true,
  };
}
