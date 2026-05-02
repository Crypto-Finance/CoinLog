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
} from '@/lib/bybit-keychain';
import { toast } from 'sonner';
import { Settings, Trash2, Upload, Lock } from 'lucide-react';
import { useBybitImport } from '@/hooks/useBybitImport';

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

    setPassphraseError(false);
    await executeImport(passphrase, symbol, days);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bybit API Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key Status */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">
                {hasKeys ? 'API keys configured (encrypted)' : 'No API keys configured'}
              </p>
              <p className="text-xs text-muted-foreground">
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
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant={hasKeys ? 'outline' : 'default'}
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
              <Label htmlFor="bybit-passphrase" className="flex items-center gap-1">
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
                className={passphraseError ? 'border-destructive' : ''}
              />
            </div>
          )}

          {/* Import Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bybit-symbol">
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
              <Label htmlFor="bybit-days">
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
            onClick={handleImport}
            disabled={importing || !hasKeys}
            className="w-full md:w-auto"
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
