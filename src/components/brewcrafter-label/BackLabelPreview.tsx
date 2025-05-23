
'use client';

import React from 'react';
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
    textColor,
    backgroundImage,
  } = props;

  const hasContent = description || ingredients || brewingDate || brewingLocation;
  const effectiveTextColor = textColor || (backgroundImage ? '#FFFFFF' : 'hsl(var(--foreground))');

  return (
    <div
      ref={ref}
      className="w-[300px] h-[450px] border border-border bg-card rounded-lg shadow-lg overflow-hidden p-4 flex flex-col relative transition-all duration-300"
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
      
      <ScrollArea className="relative z-10 flex-grow h-full">
        <div className="p-2 space-y-3 text-left">
          {description && (
            <div>
              <h4 className="font-semibold text-sm mb-0.5">Description</h4>
              <p className="text-xs leading-relaxed">{description}</p>
            </div>
          )}
          {ingredients && (
            <div>
              <h4 className="font-semibold text-sm mb-0.5">Ingredients</h4>
              <p className="text-xs leading-relaxed">{ingredients}</p>
            </div>
          )}

          {/* Brewing Date */}
          {brewingDate && (
            <div>
              {(() => {
                const dateValue = props.brewingDate;
                const prefix = "Brewed on:";
                if (dateValue && dateValue.startsWith(prefix)) {
                  return (
                    <>
                      <h4 className="font-semibold text-sm mb-0.5">{prefix}</h4>
                      <p className="text-xs leading-relaxed">{dateValue.substring(prefix.length).trim()}</p>
                    </>
                  );
                }
                // Fallback if the string doesn't start with "Brewed on:" but still has a value
                if (dateValue) { 
                  return (
                    <>
                      <h4 className="font-semibold text-sm mb-0.5">Date:</h4>
                      <p className="text-xs leading-relaxed">{dateValue}</p>
                    </>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Brewed by */}
          {brewingLocation && (
            <div> {/* space-y-3 from parent div will handle margin if brewingDate is not present */}
              <h4 className="font-semibold text-sm mb-0.5">Brewed by:</h4>
              <p className="text-xs leading-relaxed">{props.brewingLocation}</p>
            </div>
          )}

          {!hasContent && !backgroundImage && (
            <div className="flex-grow flex items-center justify-center h-full">
              <p className="italic text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>Back Label Content Here</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

export { BackLabelPreview };
