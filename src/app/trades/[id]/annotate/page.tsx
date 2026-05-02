'use client';

import { useParams } from 'next/navigation';
import { AnnotateForm } from '@/components/trades/annotate-form';

export default function AnnotatePage() {
  const params = useParams();
  const id = Number(params.id);

  return <AnnotateForm tradeId={id} />;
}
