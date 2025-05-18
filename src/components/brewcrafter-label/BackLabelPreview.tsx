
'use client';

import React from 'react'; // Ensure React is imported
import type { LabelProps } from '@/types/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BackLabelPreviewProps extends LabelProps {}

// eslint-disable-next-line react/display-name
const BackLabelPreview = React.forwardRef<HTMLDivElement, BackLabelPreviewProps>((props, ref) => {
  const {
    description,
    ingredients,
    brewingDate,
    brewingLocation,
    backgroundColor,
    backgroundImage,
  } = props;

  const hasContent = description || ingredients || brewingDate || brewingLocation;

  return (
    <div
      ref={ref}
      className="w-[300px] h-[450px] border border-border bg-card text-card-foreground rounded-lg shadow-lg overflow-hidden p-4 flex flex-col relative transition-all duration-300"
      style={{
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor || '#333333',
        color: backgroundImage ? '#FFFFFF' : 'hsl(var(--foreground))', // Ensure text is readable on dark bg or image
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
      
      <ScrollArea className="relative z-10 flex-grow h-full">
        <div className="p-2 space-y-3 text-left"> {/* Added p-2 for inner padding */}
          {description && (
            <div>
              <h4 className="font-semibold text-sm mb-0.5">Description</h4>
              <p className="text-xs leading-relaxed">{description}</p>
            </div>
          )}
          {ingredients && (
            <div>
              <h4 className="font-semibold text-sm mt-2 mb-0.5">Ingredients</h4>
              <p className="text-xs leading-relaxed">{ingredients}</p>
            </div>
          )}
          {(brewingDate || brewingLocation) && (
            <div className="mt-3 text-xs">
              {brewingDate && <p>{brewingDate}</p>}
              {brewingLocation && <p className={brewingDate ? 'mt-0.5' : ''}>{brewingLocation}</p>}
            </div>
          )}
          {!hasContent && !backgroundImage && (
            <div className="flex-grow flex items-center justify-center h-full">
              <p className="text-muted-foreground italic text-center">Back Label Content Here</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

export { BackLabelPreview };
