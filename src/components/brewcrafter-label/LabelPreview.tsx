
'use client';

import React from 'react';
import { Bebas_Neue } from 'next/font/google';
import type { LabelProps } from '@/types/label';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-bebas-neue-preview' });

interface LabelPreviewProps extends LabelProps {}

// eslint-disable-next-line react/display-name
const LabelPreview = React.forwardRef<HTMLDivElement, LabelPreviewProps>((props, ref) => {
  const {
    beerName,
    ibu,
    alcohol,
    volume,
    backgroundColor,
    textColor,
    backgroundImage,
  } = props;

  const hasContent = beerName || ibu || alcohol || volume;
  const effectiveTextColor = textColor || (backgroundImage ? '#FFFFFF' : 'hsl(var(--foreground))');

  return (
    <div
      ref={ref}
      className={`w-[300px] h-[450px] border border-border bg-card rounded-lg shadow-lg overflow-hidden p-4 flex flex-col justify-between relative transition-all duration-300 font-sans`}
      style={{
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor || '#333333',
        color: effectiveTextColor,
        textShadow: backgroundImage ? '1px 1px 3px rgba(0,0,0,0.7)' : 'none',
      }}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out z-0"
          style={{ backgroundImage: `url(${backgroundImage})`, opacity: 1 }}
        />
      )}
      {backgroundImage && <div className="absolute inset-0 bg-black/40 z-0"></div>}
      
      {!hasContent && !backgroundImage && (
         <div className="relative z-10 flex-grow flex items-center justify-center h-full">
          <p className="italic text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>Front Label Preview</p>
        </div>
      )}

      {hasContent && (
        <>
          <div className="relative z-10 flex justify-between items-start w-full text-base">
            <div className="text-left">
              {ibu && <span>IBU: {ibu}</span>}
            </div>
            <div className="text-right">
              {alcohol && <span>Alc: {alcohol}%</span>}
            </div>
          </div>

          <div className="relative z-10 flex-grow flex items-center justify-center text-center">
            {beerName && (
              <h2 
                className={`font-heading text-6xl md:text-7xl leading-tight break-words`}
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
              >
                {beerName}
              </h2>
            )}
          </div>

          <div className="relative z-10 w-full text-center text-base">
            {volume && <span>{volume}</span>}
          </div>
        </>
      )}
    </div>
  );
});

export { LabelPreview };
