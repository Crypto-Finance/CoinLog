'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTrade } from '@/hooks/useTrades';
import { useUpdateTrade } from '@/hooks/use-update-trade';
import { annotateSchema, type AnnotateFormData } from '@/lib/domain/annotate-schema';
import { annotateFormToTrade, tradeToAnnotateForm } from '@/lib/domain/annotate-utils';

/**
 * Custom hook for annotate form logic.
 * Handles form state, setupType watching, and submission.
 */
export function useAnnotateForm(tradeId: number) {
  const router = useRouter();
  const { trade } = useTrade(tradeId);
  const { updateTrade } = useUpdateTrade(tradeId);

  const [showCustomSetup, setShowCustomSetup] = useState(false);

  const form = useForm<AnnotateFormData>({
    resolver: zodResolver(annotateSchema),
    defaultValues: {
      setupType: undefined,
      setupTypeCustom: '',
      exitType: undefined,
      marketCondition: undefined,
      stopLoss: '',
      takeProfit: '',
      notes: undefined,
      riskAmount: '',
      rrPlanned: '',
      rrActual: '',
    },
  });

  // Watch for setupType changes to show/hide custom input
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'setupType') {
        setShowCustomSetup(value.setupType === 'Other');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Initialize form when trade data loads
  useEffect(() => {
    if (trade) {
      form.reset(tradeToAnnotateForm(trade));
      setShowCustomSetup(form.getValues('setupType') === 'Other');
    }
  }, [trade, form]);

  async function onSubmit(values: AnnotateFormData) {
    try {
      await updateTrade(annotateFormToTrade(values));
      toast.success('Trade annotated successfully');
      router.push(`/trades/${tradeId}`);
    } catch {
      toast.error('Failed to save annotation');
    }
  }

  return { form, showCustomSetup, onSubmit, trade };
}
