import { toast } from 'sonner';

/**
 * Show a toast notification after a trade import completes.
 */
export function showImportSuccess(inserted: number, skipped: number) {
  if (inserted > 0) {
    const skippedMsg = skipped > 0 
      ? `, skipped ${skipped} duplicate${skipped > 1 ? 's' : ''}` 
      : '';
    toast.success(
      `Imported ${inserted} trade${inserted > 1 ? 's' : ''}${skippedMsg}`,
    );
  } else {
    toast.info(
      `All ${skipped} trade${skipped > 1 ? 's' : ''} already exist in your journal`,
    );
  }
}
