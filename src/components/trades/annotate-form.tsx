'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Control } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTrade, useTrades } from '@/hooks/useTrades';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Trade } from '@/lib/types';

import { SETUP_TYPES, EXIT_TYPES, MARKET_CONDITIONS } from '@/lib/field-options';
import { annotateSchema, type AnnotateFormData } from '@/lib/annotate-schema';
import { FormSelect } from '@/components/form/form-select';
import { FormInput } from '@/components/form/form-input';

/**
 * Map a Trade object to AnnotateFormData.
 */
function tradeToAnnotateForm(trade: Trade): AnnotateFormData {
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

interface AnnotationSelectFieldsProps {
  control: Control<AnnotateFormData>;
  showCustomSetup: boolean;
}

function AnnotationSelectFields({ control, showCustomSetup }: AnnotationSelectFieldsProps) {
  return (
    <>
      <FormSelect
        control={control}
        name="setupType"
        label="Setup Type"
        options={SETUP_TYPES}
        placeholder="Select setup type"
      />

      {showCustomSetup && (
        <FormInput
          control={control}
          name="setupTypeCustom"
          label="Custom Setup Type"
          placeholder="Enter custom setup type"
        />
      )}

      <FormSelect
        control={control}
        name="exitType"
        label="Exit Type"
        options={EXIT_TYPES}
        placeholder="Select exit type"
      />

      <FormSelect
        control={control}
        name="marketCondition"
        label="Market Condition"
        options={MARKET_CONDITIONS}
        placeholder="Select market condition"
      />
    </>
  );
}

interface AnnotationInputFieldsProps {
  control: Control<AnnotateFormData>;
}

function AnnotationInputFields({ control }: AnnotationInputFieldsProps) {
  return (
    <>
      <FormInput
        control={control}
        name="riskAmount"
        label="Risk Amount ($)"
        placeholder="0.00"
        type="number"
        step="0.01"
      />

      <FormInput
        control={control}
        name="rrPlanned"
        label="Planned R:R"
        placeholder="e.g., 2.0"
        type="number"
        step="0.1"
      />

      <FormInput
        control={control}
        name="rrActual"
        label="Actual R:R"
        placeholder="e.g., 1.5"
        type="number"
        step="0.1"
      />

      <FormInput
        control={control}
        name="stopLoss"
        label="Stop Loss Price"
        placeholder="Enter stop loss price"
        type="number"
        step="0.01"
      />

      <FormInput
        control={control}
        name="takeProfit"
        label="Take Profit Price"
        placeholder="Enter take profit price"
        type="number"
        step="0.01"
      />
    </>
  );
}

interface AnnotateFormProps {
  tradeId: number;
}

export function AnnotateForm({ tradeId }: AnnotateFormProps) {
  const router = useRouter();
  const { trade, loading: tradeLoading } = useTrade(tradeId);
  const { updateTrade } = useTrades();

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

  const [showCustomSetup, setShowCustomSetup] = useState(
    form.getValues('setupType') === 'Other'
  );

  // Watch for setupType changes to show/hide custom input
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'setupType') {
        setShowCustomSetup(value.setupType === 'Other');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Update form when trade data loads
  useEffect(() => {
    if (trade) {
      form.reset(tradeToAnnotateForm(trade));
    }
  }, [trade, form]);

  async function onSubmit(values: AnnotateFormData) {
    try {
      await updateTrade(tradeId, {
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
      });
      toast.success('Trade annotated successfully');
      router.push(`/trades/${tradeId}`);
    } catch {
      toast.error('Failed to save annotation');
    }
  }

  if (tradeLoading) {
    return <p className="text-muted-foreground">Loading trade...</p>;
  }

  if (!trade) {
    return <p className="text-muted-foreground">Trade not found</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/trades/${tradeId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Annotate Trade</h1>
          <p className="text-sm text-muted-foreground">
            #{tradeId} · {trade.symbol} · {trade.direction}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Annotation</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnnotationSelectFields control={form.control} showCustomSetup={showCustomSetup} />
                <AnnotationInputFields control={form.control} />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did you learn from this trade?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  <Save className="h-4 w-4 mr-1" />{' '}
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Annotation'}
                </Button>
                <Link href={`/trades/${tradeId}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
