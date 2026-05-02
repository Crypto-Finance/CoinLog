'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { parseCSV } from '@/lib/csv';
import { addTradesWithDedup } from '@/lib/db';
import { showImportSuccess } from '@/lib/import-toast';
import type { Trade } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { FileDropZone } from './file-drop-zone';
import { TradePreviewTable } from './trade-preview-table';
import { ImportError, ImportResult } from './import-result';
import { getErrorMessage } from '@/lib/errors';

const CSV_HINT =
  'Max 5MB, 10,000 trades. Headers: exchange, exchangeOrderId, symbol, direction, entryPrice, exitPrice, quantity, fee, pnl, openTime';

const MAX_CSV_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TRADES = 10_000;

export function CsvImport() {
  const router = useRouter();

  const [parsedTrades, setParsedTrades] = useState<Omit<Trade, 'id'>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);
      setParsedTrades(null);
      setResult(null);

      // File size check
      if (file.size > MAX_CSV_SIZE) {
        const msg = `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB.`;
        setError(msg);
        toast.error(msg);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text || text.trim().length === 0) {
            setError('File is empty');
            return;
          }

          const trades = parseCSV(text);

          // Trade count limit
          if (trades.length > MAX_TRADES) {
            const msg = `Too many trades (${trades.length}). Max ${MAX_TRADES} per import.`;
            setError(msg);
            toast.error(msg);
            return;
          }

          if (trades.length === 0) {
            setError('No valid trade data found in file');
            return;
          }

          setParsedTrades(trades);
          toast.success(`Found ${trades.length} trade(s) in file`);
        } catch (err) {
          const message = getErrorMessage(err, 'Failed to parse CSV');
          setError(message);
          toast.error(message);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file');
        toast.error('Failed to read file');
      };
      reader.readAsText(file);
    },
    [],
  );

  const handleImport = useCallback(async () => {
    if (!parsedTrades || parsedTrades.length === 0) return;

    setImporting(true);
    setResult(null);

    try {
      const { inserted, skipped } = await addTradesWithDedup(parsedTrades);
      setResult({ inserted, skipped });
      showImportSuccess(inserted, skipped);

      // Reset after successful import
      setParsedTrades(null);
      router.refresh();
    } catch (err) {
      const message = getErrorMessage(err, 'Import failed');
      toast.error(message);
    } finally {
      setImporting(false);
    }
  }, [parsedTrades, router]);

  const handleReset = useCallback(() => {
    setParsedTrades(null);
    setError(null);
    setResult(null);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          CSV Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Input */}
        <FileDropZone
          onFileSelect={handleFileSelect}
          disabled={importing}
          hint={CSV_HINT}
        />

        {/* Error State */}
        {error && <ImportError message={error} />}

        {/* Preview Table */}
        {parsedTrades && parsedTrades.length > 0 && (
          <div className="space-y-4">
            <TradePreviewTable trades={parsedTrades} />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={importing}
                className="flex-1 md:flex-none"
              >
                {importing ? 'Importing...' : `Import ${parsedTrades.length} Trade(s)`}
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={importing}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Import Result */}
        {result && <ImportResult inserted={result.inserted} skipped={result.skipped} />}
      </CardContent>
    </Card>
  );
}
