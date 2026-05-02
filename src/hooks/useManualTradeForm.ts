'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useTrades } from '@/hooks/useTrades';
import { toast } from 'sonner';
import { createTrade } from '@/lib/trade-factory';
import { tradeSchema, type TradeFormValues } from '@/lib/import-schema';
import { computeIsAnnotated } from '@/lib/import';

/**
 * Default values for all annotation fields.
 * Single source of truth to avoid duplication.
 */
const DEFAULT_ANNOTATIONS = {
  setupType: '',
  stopLoss: '',
  takeProfit: '',
  riskAmount: '',
  rrPlanned: '',
  rrActual: '',
  exitType: '',
  marketCondition: '',
  notes: '',
} as const;

/**
 * Extract annotation fields from form values with default fallback.
 */
function pickAnnotations(values: TradeFormValues) {
  return {
    setupType: values.setupType || DEFAULT_ANNOTATIONS.setupType,
    stopLoss: values.stopLoss || DEFAULT_ANNOTATIONS.stopLoss,
    takeProfit: values.takeProfit || DEFAULT_ANNOTATIONS.takeProfit,
    riskAmount: values.riskAmount || DEFAULT_ANNOTATIONS.riskAmount,
    rrPlanned: values.rrPlanned || DEFAULT_ANNOTATIONS.rrPlanned,
    rrActual: values.rrActual || DEFAULT_ANNOTATIONS.rrActual,
    exitType: values.exitType || DEFAULT_ANNOTATIONS.exitType,
    marketCondition: values.marketCondition || DEFAULT_ANNOTATIONS.marketCondition,
    notes: values.notes || DEFAULT_ANNOTATIONS.notes,
  };
}

/**
 * Custom hook for managing manual trade form state and submission.
 * Extracted from ManualTradeForm component for better separation of concerns.
 */
export function useManualTradeForm() {
  const router = useRouter();
  const { addTrade } = useTrades();

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      exchange: '',
      exchangeOrderId: '',
      symbol: '',
      direction: 'Long',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      fee: '0',
      pnl: '',
      openTime: '',
      closeTime: '',
      ...DEFAULT_ANNOTATIONS,
    },
  });

  async function onSubmit(values: TradeFormValues) {
    try {
      const annotations = pickAnnotations(values);
      const isAnnotated = computeIsAnnotated(annotations);

      const trade = createTrade({
        exchange: values.exchange,
        exchangeOrderId: values.exchangeOrderId,
        symbol: values.symbol,
        direction: values.direction,
        entryPrice: values.entryPrice,
        exitPrice: values.exitPrice,
        quantity: values.quantity,
        fee: values.fee || '0',
        pnl: values.pnl,
        openTime: values.openTime,
        closeTime: values.closeTime || undefined,
        ...annotations,
        isAnnotated,
      });

      await addTrade(trade);
      toast.success('Trade added successfully');
      form.reset();
      router.push('/trades');
    } catch {
      toast.error('Failed to add trade');
    }
  }

  return { form, onSubmit };
}
