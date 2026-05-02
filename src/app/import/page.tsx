'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, Landmark } from 'lucide-react';
import { BybitImport } from '@/components/import/bybit-import';
import { CsvImport } from '@/components/import/csv-import';
import { ManualTradeForm } from '@/components/import/manual-trade-form';

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Trades</h1>
        <p className="text-muted-foreground mt-1">
          Add trades manually or import from exchange data
        </p>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manual">
            <Plus className="h-4 w-4 mr-1" /> Manual Entry
          </TabsTrigger>
          <TabsTrigger value="csv">
            <Upload className="h-4 w-4 mr-1" /> CSV Import
          </TabsTrigger>
          <TabsTrigger value="bybit">
            <Landmark className="h-4 w-4 mr-1" /> Bybit API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <ManualTradeForm />
        </TabsContent>

        <TabsContent value="csv">
          <CsvImport />
        </TabsContent>

        <TabsContent value="bybit">
          <BybitImport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
