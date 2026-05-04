'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storeKeys } from '@/lib/infrastructure/bybit/keychain';
import { toast } from 'sonner';
import { getPassphraseError } from '@/lib/security/passphrase-strength';

interface BybitConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function BybitConfigDialog({
  open,
  onOpenChange,
  onSaved,
}: BybitConfigDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [passphraseConfirm, setPassphraseConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  function handleSave() {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error('API key and secret are required');
      return;
    }

    const passphraseError = getPassphraseError(passphrase);
    if (passphraseError) {
      toast.error(passphraseError);
      return;
    }

    if (passphrase !== passphraseConfirm) {
      toast.error('Passphrases do not match');
      return;
    }

    setSaving(true);
    storeKeys(apiKey.trim(), apiSecret.trim(), passphrase)
      .then(() => {
        toast.success('API keys saved (encrypted)');
        setApiKey('');
        setApiSecret('');
        setPassphrase('');
        setPassphraseConfirm('');
        onSaved();
      })
      .catch(() => {
        toast.error('Failed to save API keys');
      })
      .finally(() => {
        setSaving(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-none">
        <DialogHeader>
          <DialogTitle className="font-bold text-[#d7e3fb]">Configure Bybit API</DialogTitle>
          <DialogDescription className="text-[#c3caac] font-medium">
            Enter your Bybit API key and secret. Create read-only keys at{' '}
            <a
              href="https://www.bybit.com/app/user/api-management"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#BFFF00]"
            >
              Bybit API Management
            </a>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="bybit-api-key" className="font-bold text-[#c3caac] text-sm">API Key</Label>
            <Input
              id="bybit-api-key"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bybit-api-secret" className="font-bold text-[#c3caac] text-sm">API Secret</Label>
            <Input
              id="bybit-api-secret"
              type="password"
              placeholder="Enter your API secret"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bybit-passphrase" className="font-bold text-[#c3caac] text-sm">
              Encryption Passphrase
            </Label>
            <Input
              id="bybit-passphrase"
              type="password"
              placeholder="Min 12 characters — include upper, lower, numbers, symbols"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bybit-passphrase-confirm" className="font-bold text-[#c3caac] text-sm">
              Confirm Passphrase
            </Label>
            <Input
              id="bybit-passphrase-confirm"
              type="password"
              placeholder="Re-enter passphrase"
              value={passphraseConfirm}
              onChange={(e) => setPassphraseConfirm(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="neon-outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="neon"
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
