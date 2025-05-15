
'use client';

import { useState, useEffect } from 'react';
import { srmToHex } from '@/lib/srmUtils';

interface SrmColorSwatchProps {
  srm: number | string | undefined;
}

export function SrmColorSwatch({ srm }: SrmColorSwatchProps) {
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent');

  useEffect(() => {
    setBackgroundColor(srmToHex(srm));
  }, [srm]);

  return (
    <div
      className="w-6 h-6 rounded-full border border-muted-foreground/50 shadow-sm"
      style={{ backgroundColor }}
      title={`SRM: ${srm ?? 'N/A'}`}
    />
  );
}
