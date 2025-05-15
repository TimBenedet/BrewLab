
'use client';

import { useState, useEffect } from 'react';

export function FooterDate() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Render null or a placeholder until the year is determined on the client
  if (year === null) {
    // You could return a static year like 2024, or just nothing
    return null; 
  }

  return <>{year}</>;
}
