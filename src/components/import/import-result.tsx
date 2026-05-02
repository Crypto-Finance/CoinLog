import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportResultProps {
  inserted: number;
  skipped: number;
}

/**
 * Display the result of a completed import operation.
 */
export function ImportResult({ inserted, skipped }: ImportResultProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-emerald-600">Import Complete</p>
        <p className="text-sm text-muted-foreground mt-1">
          {inserted} trade(s) imported, {skipped} duplicate(s) skipped
        </p>
      </div>
    </div>
  );
}

interface ImportErrorProps {
  message: string;
}

/**
 * Display a parse/import error.
 */
export function ImportError({ message }: ImportErrorProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-destructive">Parse Error</p>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
    </div>
  );
}
