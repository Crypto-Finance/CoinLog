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
    <div className="flex items-start gap-3 rounded-[24px] border border-[#BFFF00]/30 bg-[#BFFF00]/5 p-4">
      <CheckCircle2 className="h-5 w-5 text-[#BFFF00] shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-[#BFFF00]">Import Complete</p>
        <p className="text-sm text-[#c3caac] font-medium mt-1">
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
    <div className="flex items-start gap-3 rounded-[24px] border border-[#FFD1DC]/30 bg-[#FFD1DC]/5 p-4">
      <AlertCircle className="h-5 w-5 text-[#FFD1DC] shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-[#FFD1DC]">Parse Error</p>
        <p className="text-sm text-[#c3caac] font-medium mt-1">{message}</p>
      </div>
    </div>
  );
}
