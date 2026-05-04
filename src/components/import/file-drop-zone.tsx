'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { cn, isCsvFile } from '@/lib/utils/utils';
import { toast } from 'sonner';

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
  const [isDragging, setIsDragging] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isCsvFile(file)) {
      toast.error('Please select a CSV file');
      return;
    }

    onFileSelect(file);

    // Reset file input so the same file can be re-selected
    e.target.value = '';
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!isCsvFile(file)) {
      toast.error('Please drop a CSV file');
      return;
    }

    onFileSelect(file);
  }

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-8 rounded-[24px] transition-all duration-200",
        "border-2 border-dashed",
        isDragging 
          ? "border-[#BFFF00] bg-[#BFFF00]/5" 
          : "border-[rgba(255,255,255,0.2)]",
        !disabled && "hover:border-[#BFFF00] hover:bg-[#BFFF00]/5",
        "bg-[#101c2d]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <FileText className={cn(
        "h-10 w-10 mb-3 transition-colors",
        isDragging ? "text-[#BFFF00]" : "text-[#c3caac]"
      )} />
      <p className="text-sm font-bold text-[#d7e3fb] mb-2">Upload your trade CSV file</p>
      {hint && (
        <p className="text-xs text-[#c3caac] mb-4 font-medium">{hint}</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="hidden"
      />
      <Button
        variant="neon-outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        <Upload className="h-4 w-4 mr-1" />
        Choose File
      </Button>
    </div>
  );
}
