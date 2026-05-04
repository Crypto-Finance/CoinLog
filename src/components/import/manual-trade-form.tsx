'use client';

import { Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { TradeFormValues } from '@/lib/import-page/import-schema';
import { EXCHANGES } from '@/lib/import-page/import-constants';
import {
  SETUP_TYPES,
  EXIT_TYPES,
  MARKET_CONDITIONS,
} from '@/lib/ui/field-options';
import { FormSelect } from '@/components/form/form-select';
import { FormInput } from '@/components/form/form-input';
import { useManualTradeForm } from '@/hooks/useManualTradeForm';

interface ExchangeDataFieldsProps {
  control: Control<TradeFormValues>;
}

function ExchangeDataFields({ control }: ExchangeDataFieldsProps) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#d7e3fb] mb-4">Exchange Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormSelect
          control={control}
          name="exchange"
          label="Exchange"
          options={EXCHANGES}
          placeholder="Select exchange"
        />

        <FormInput
          control={control}
          name="exchangeOrderId"
          label="Order ID"
          placeholder="Exchange order ID"
        />

        <FormInput
          control={control}
          name="symbol"
          label="Symbol"
          placeholder="e.g., BTC/USDT"
        />

        <FormSelect
          control={control}
          name="direction"
          label="Direction"
          options={['Long', 'Short']}
        />

        <FormInput
          control={control}
          name="entryPrice"
          label="Entry Price"
          placeholder="0.00"
          type="number"
          step="any"
        />

        <FormInput
          control={control}
          name="exitPrice"
          label="Exit Price"
          placeholder="0.00"
          type="number"
          step="any"
        />

        <FormInput
          control={control}
          name="quantity"
          label="Quantity"
          placeholder="0.00"
          type="number"
          step="any"
        />

        <FormInput
          control={control}
          name="fee"
          label="Fee"
          placeholder="0.00"
          type="number"
          step="0.01"
        />

        <FormInput
          control={control}
          name="pnl"
          label="P&L"
          placeholder="Profit or loss"
          type="number"
          step="0.01"
        />

        <FormInput
          control={control}
          name="openTime"
          label="Open Time"
          type="datetime-local"
        />

        <FormInput
          control={control}
          name="closeTime"
          label="Close Time (optional)"
          type="datetime-local"
        />
      </div>
    </div>
  );
}

interface AnnotationFieldsProps {
  control: Control<TradeFormValues>;
}

function AnnotationFields({ control }: AnnotationFieldsProps) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#d7e3fb] mb-4">Annotation (Optional)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormSelect
          control={control}
          name="setupType"
          label="Setup Type"
          options={SETUP_TYPES}
          placeholder="Select setup type"
        />

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
      </div>
    </div>
  );
}

export function ManualTradeForm() {
  const { form, onSubmit } = useManualTradeForm();

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="font-bold text-[#d7e3fb]">New Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ExchangeDataFields control={form.control} />

            <Separator className="bg-[rgba(255,255,255,0.1)]" />

            <AnnotationFields control={form.control} />

            <Button 
              variant="neon"
              type="submit" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Adding...' : 'Add Trade'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
