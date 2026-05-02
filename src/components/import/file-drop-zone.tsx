'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';

interface FileDropZoneProps {
  /** Called with the selected File object */
  onFileSelect: (file: File) => void;
  /** Whether the import is in progress */
  disabled?: boolean;
  /** Required headers hint text */
  hint?: string;
}

/**
 * Reusable file upload zone for CSV imports.
 * Max file size: 5MB, Max trades: 10,000
 */
export function FileDropZone({
  onFileSelect,
  disabled = false,
  hint,
}: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return;
    }

    onFileSelect(file);

    // Reset file input so the same file can be re-selected
    e.target.value = '';
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
      <FileText className="h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm font-medium mb-2">Upload your trade CSV file</p>
      {hint && (
        <p className="text-xs text-muted-foreground mb-4">{hint}</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        <Upload className="h-4 w-4 mr-1" />
        Choose File
      </Button>
    </div>
  );
}
