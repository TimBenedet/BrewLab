
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type * as z from 'zod';
import html2canvas from 'html2canvas';
import { LabelFormSchema, type LabelProps } from '@/types/label';
import { LabelControls } from '@/components/brewcrafter-label/LabelControls';
import { LabelPreview } from '@/components/brewcrafter-label/LabelPreview';
import { BackLabelPreview } from '@/components/brewcrafter-label/BackLabelPreview';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';


type LabelFormData = z.infer<typeof LabelFormSchema>;

const defaultValues: LabelFormData = {
  beerName: 'Cosmic Haze IPA',
  ibu: '65',
  alcohol: '6.8',
  volume: '33cl',
  description: 'A juicy and hazy IPA, overflowing with tropical fruit aromas and a soft finish with low bitterness. Perfect for stargazing.',
  ingredients: 'Water, Barley Malts (Pilsen, Vienna), Hops (Citra, Galaxy, Mosaic), American Ale Yeast.',
  brewingDate: 'Brewed on: 15/07/2024',
  brewingLocation: 'Starbase Brewery, Alpha Nebula',
  backgroundColor: '#333333',
  textColor: '#FFFFFF',
  // backgroundImage is not part of the form schema, handled separately
};

export default function BrewLabelStudioPage() {
  const { toast } = useToast();
  const form = useForm<LabelFormData>({
    resolver: zodResolver(LabelFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const [labelProps, setLabelProps] = useState<LabelProps>({
    ...defaultValues,
    backgroundImage: null,
    textColor: defaultValues.textColor || '#FFFFFF', 
  });

  const frontLabelRef = useRef<HTMLDivElement>(null);
  const backLabelRef = useRef<HTMLDivElement>(null);

  const watchedFormValues = form.watch();

  useEffect(() => {
    setLabelProps(prevProps => ({
      ...prevProps, 
      beerName: watchedFormValues.beerName,
      ibu: watchedFormValues.ibu,
      alcohol: watchedFormValues.alcohol,
      volume: watchedFormValues.volume,
      description: watchedFormValues.description,
      ingredients: watchedFormValues.ingredients,
      brewingDate: watchedFormValues.brewingDate,
      brewingLocation: watchedFormValues.brewingLocation,
      backgroundColor: watchedFormValues.backgroundColor,
      textColor: watchedFormValues.textColor,
    }));
  }, [
    watchedFormValues.beerName,
    watchedFormValues.ibu,
    watchedFormValues.alcohol,
    watchedFormValues.volume,
    watchedFormValues.description,
    watchedFormValues.ingredients,
    watchedFormValues.brewingDate,
    watchedFormValues.brewingLocation,
    watchedFormValues.backgroundColor,
    watchedFormValues.textColor,
  ]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLabelProps(prev => ({ ...prev, backgroundImage: reader.result as string }));
        toast({ title: "Image Uploaded", description: "Background image updated for preview." });
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleClearImage = () => {
    setLabelProps(prev => ({ ...prev, backgroundImage: null }));
    toast({ title: "Image Cleared", description: "Background image removed from preview." });
  };
  
  const handleDownloadLabel = async (elementRef: React.RefObject<HTMLDivElement>, fileName: string) => {
    const element = elementRef.current;
    if (!element) {
      toast({ variant: "destructive", title: "Error", description: "Preview element not found." });
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null, 
        scale: 2, 
        useCORS: true, 
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Download Started", description: `${fileName} is being downloaded.` });
    } catch (error) {
      console.error("Error generating label image:", error);
      toast({ variant: "destructive", title: "Download Error", description: "Could not generate label image." });
    }
  };

  const handleDownloadAllLabels = async () => {
    if (frontLabelRef.current) {
      await handleDownloadLabel(frontLabelRef, 'etiquette-avant.png');
    }
    if (backLabelRef.current) {
      setTimeout(async () => { // Added a small delay to ensure the first download completes/prompts before the second
        await handleDownloadLabel(backLabelRef, 'etiquette-arriere.png');
      }, 500); 
    }
  };
  
  // This function is no longer explicitly triggered by a button from LabelControls
  // but kept in case react-hook-form's onSubmit is used for other purposes.
  const handleFormSubmit = (data: LabelFormData) => {
    console.log("Form data submitted:", data);
    // Placeholder for potential future use, e.g., AI suggestions if re-enabled.
  };


  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-heading text-primary">BrewCrafter Label</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
          Design simplest front and back labels for your craft beer. Experiment with text, colors, and background images.
        </p>
      </header>

      <section className="max-w-3xl mx-auto">
        <LabelControls
          form={form}
          onImageUpload={handleImageUpload}
          onClearImage={handleClearImage}
          onBackgroundColorChange={(color) => form.setValue('backgroundColor', color, { shouldValidate: true })}
          onTextColorChange={(color) => form.setValue('textColor', color, { shouldValidate: true })}
          onSubmitAction={form.handleSubmit(handleFormSubmit)}
          currentBackgroundImage={labelProps.backgroundImage}
        />
      </section>

      <section className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-center">Front Label Preview</h2>
            <LabelPreview {...labelProps} ref={frontLabelRef} />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-center">Back Label Preview</h2>
            <BackLabelPreview {...labelProps} ref={backLabelRef} />
          </div>
        </div>
      </section>

      <section className="flex justify-center mt-8">
        <Button type="button" onClick={handleDownloadAllLabels} size="lg">
          <Download className="mr-2 h-5 w-5" />
          Download Labels
        </Button>
      </section>
    </div>
  );
}
