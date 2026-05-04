'use client';

import { useAnnotateForm } from '@/hooks/use-annotate-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/utils';

import { SETUP_TYPES, EXIT_TYPES, MARKET_CONDITIONS } from '@/lib/ui/field-options';
import type { AnnotateFormData } from '@/lib/domain/annotate-schema';
import { FormSelect } from '@/components/form/form-select';
import { FormInput } from '@/components/form/form-input';
import { Control } from 'react-hook-form';

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
  const { form, showCustomSetup, onSubmit, trade } = useAnnotateForm(tradeId);

  if (!trade) {
    return <p className="text-[#c3caac] font-medium">Trade not found</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/trades/${tradeId}`}>
          <Button variant="ghost" size="sm" className="text-[#d7e3fb] hover:text-[#BFFF00] hover:bg-[#1f2a3c]">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-[800] text-[#d7e3fb]">Annotate Trade</h1>
          <p className="text-sm text-[#c3caac] font-medium">
            #{tradeId} · {trade.symbol} · {trade.direction}
          </p>
        </div>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="font-bold text-[#d7e3fb]">Trade Annotation</CardTitle>
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
                    <FormLabel className="font-bold text-[#c3caac]">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did you learn from this trade?"
                        className={cn(
                          'min-h-[100px] rounded-[12px] bg-[#101c2d]',
                          'border-[rgba(255,255,255,0.1)] text-[#d7e3fb]',
                          'placeholder:text-[#c3caac]',
                          'focus:border-[#BFFF00] focus:ring-[#BFFF00]'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button 
                  variant="neon"
                  type="submit" 
                  disabled={form.formState.isSubmitting}
                >
                  <Save className="h-4 w-4 mr-1" />{' '}
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Annotation'}
                </Button>
                <Link href={`/trades/${tradeId}`}>
                  <Button 
                    variant="neon-outline"
                    type="button"
                  >
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
