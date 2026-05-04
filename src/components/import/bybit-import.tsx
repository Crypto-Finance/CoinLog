'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BybitConfigDialog } from './bybit-config-dialog';
import {
  clearKeys,
  hasStoredKeys,
} from '@/lib/infrastructure/bybit/keychain';
import { toast } from 'sonner';
import { Settings, Trash2, Upload, Lock } from 'lucide-react';
import { useBybitImport } from '@/hooks/useBybitImport';
import { cn } from '@/lib/utils/utils';
import { z } from 'zod';

const bybitImportSchema = z.object({
  symbol: z
    .string()
    .max(32, 'Symbol too long')
    .regex(/^[A-Z0-9]*$/, 'Invalid symbol format')
    .optional(),
  days: z
    .string()
    .transform(Number)
    .refine((n) => n >= 1 && n <= 365, 'Days must be 1-365'),
});

export function BybitImport() {
  const [configOpen, setConfigOpen] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [days, setDays] = useState('90');
  const [passphrase, setPassphrase] = useState('');
  const [passphraseError, setPassphraseError] = useState(false);
  const [hasKeys, setHasKeys] = useState(() => hasStoredKeys());

  const handleConfigSaved = useCallback(() => {
    setHasKeys(hasStoredKeys());
    setPassphrase('');
    setPassphraseError(false);
    setConfigOpen(false);
  }, []);

  function handleRemoveKeys() {
    clearKeys();
    setHasKeys(false);
    setPassphrase('');
    setPassphraseError(false);
    toast.info('API keys removed');
  }

  const { importing, executeImport } = useBybitImport({
    hasKeys,
    onSuccess: () => {
      setPassphrase('');
      setPassphraseError(false);
    },
  });

  async function handleImport() {
    if (!passphrase) {
      toast.error('Enter your encryption passphrase to decrypt API keys');
      return;
    }

    const validation = bybitImportSchema.safeParse({ symbol, days });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setPassphraseError(false);
    await executeImport(passphrase, symbol, days);
  }

  return (
    <>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold text-[#d7e3fb]">
            <Upload className="h-4 w-4 text-[#BFFF00]" />
            Bybit API Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key Status */}
          <div className={cn(
            'flex items-center justify-between rounded-[24px]',
            'border border-[rgba(255,255,255,0.1)] p-4 bg-[#101c2d]'
          )}>
            <div>
              <p className="text-sm font-bold text-[#d7e3fb]">
                {hasKeys ? 'API keys configured (encrypted)' : 'No API keys configured'}
              </p>
              <p className="text-xs text-[#c3caac] font-medium mt-1">
                {hasKeys
                  ? 'Keys encrypted and stored locally in your browser'
                  : 'Click Configure to add your Bybit API credentials'}
              </p>
            </div>
            <div className="flex gap-2">
              {hasKeys && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleRemoveKeys}
                  title="Remove API keys"
                  className="text-[#c3caac] hover:text-[#FFD1DC] hover:bg-[#FFD1DC]/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant={hasKeys ? 'neon-outline' : 'neon'}
                size="sm"
                onClick={() => setConfigOpen(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                {hasKeys ? 'Change' : 'Configure'}
              </Button>
            </div>
          </div>

          {/* Passphrase Input */}
          {hasKeys && (
            <div className="space-y-2">
              <Label htmlFor="bybit-passphrase" className="flex items-center gap-1 font-bold text-[#c3caac] text-sm">
                <Lock className="h-3 w-3" />
                Decryption Passphrase
              </Label>
              <Input
                id="bybit-passphrase"
                type="password"
                placeholder="Enter passphrase to decrypt API keys"
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setPassphraseError(false);
                }}
                autoComplete="off"
                className={passphraseError ? 'border-[#FFD1DC]' : ''}
              />
            </div>
          )}

          {/* Import Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bybit-symbol" className="font-bold text-[#c3caac] text-sm">
                Symbol (optional)
              </Label>
              <Input
                id="bybit-symbol"
                placeholder="e.g., BTCUSDT (leave empty for all)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bybit-days" className="font-bold text-[#c3caac] text-sm">
                Days to Import
              </Label>
              <Input
                id="bybit-days"
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
          </div>

          {/* Import Button */}
          <Button
            variant="neon"
            onClick={handleImport}
            disabled={importing || !hasKeys}
          >
            {importing ? 'Importing trades...' : 'Import Trades'}
          </Button>
        </CardContent>
      </Card>

      <BybitConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        onSaved={handleConfigSaved}
      />
    </>
  );
}
