
'use client';

import React from 'react';
// Removed Geist_Sans import from next/font/google
import { Bebas_Neue } from 'next/font/google'; // Keep Bebas_Neue for the beer name
import type { LabelProps } from '@/types/label';

// Bebas Neue should be instantiated in layout.tsx and referenced via CSS variable or Tailwind class
// However, for specific component styling, direct instantiation here is also an option if layout.tsx variable isn't specific enough for --font-bebas-neue only.
// For consistency with the requirements, we'll assume --font-bebas-neue is available globally.
// If not, you'd instantiate it here:
const bebas = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-bebas-neue-preview' }); // Use a unique variable if instantiating locally

interface LabelPreviewProps extends LabelProps {}

// eslint-disable-next-line react/display-name
const LabelPreview = React.forwardRef<HTMLDivElement, LabelPreviewProps>((props, ref) => {
  const {
    beerName,
    ibu,
    alcohol,
    volume,
    backgroundColor,
    backgroundImage,
  } = props;

  const hasContent = beerName || ibu || alcohol || volume;

  return (
    <div
      ref={ref}
      // The `font-sans` class will now correctly apply Geist Sans from layout.tsx
      className={`w-[300px] h-[450px] border border-border bg-card text-card-foreground rounded-lg shadow-lg overflow-hidden p-4 flex flex-col justify-between relative transition-all duration-300 font-sans`}
      style={{
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor || '#333333',
        color: backgroundImage ? '#FFFFFF' : 'hsl(var(--foreground))',
        textShadow: backgroundImage ? '1px 1px 3px rgba(0,0,0,0.7)' : 'none',
      }}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out z-0"
          style={{ backgroundImage: `url(${backgroundImage})`, opacity: 1 }}
        />
      )}
      {/* Semi-transparent overlay for better text readability on background images */}
      {backgroundImage && <div className="absolute inset-0 bg-black/40 z-0"></div>}
      
      {!hasContent && !backgroundImage && (
         <div className="relative z-10 flex-grow flex items-center justify-center h-full">
          <p className="text-muted-foreground italic text-center">Front Label Preview</p>
        </div>
      )}

      {hasContent && (
        <>
          {/* Top section: IBU and Alcohol */}
          <div className="relative z-10 flex justify-between items-start w-full text-base">
            <div className="text-left">
              {ibu && <span>IBU: {ibu}</span>}
            </div>
            <div className="text-right">
              {alcohol && <span>Alc: {alcohol}%</span>}
            </div>
          </div>

          {/* Middle section: Beer Name */}
          <div className="relative z-10 flex-grow flex items-center justify-center text-center">
            {beerName && (
              <h2 
                // Apply the font-heading class from Tailwind, which should map to Bebas Neue
                className={`font-heading text-6xl md:text-7xl leading-tight break-words`}
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
              >
                {beerName}
              </h2>
            )}
          </div>

          {/* Bottom section: Volume */}
          <div className="relative z-10 w-full text-center text-base">
            {volume && <span>{volume}</span>}
          </div>
        </>
      )}
    </div>
  );
});

export { LabelPreview };
