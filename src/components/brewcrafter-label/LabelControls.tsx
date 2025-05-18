
'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LabelFormSchema } from '@/types/label';
import type * as z from 'zod';
import { Wand2, Download, Trash2 } from 'lucide-react';
import type React from 'react';

type LabelFormData = z.infer<typeof LabelFormSchema>;

interface LabelControlsProps {
  form: UseFormReturn<LabelFormData>;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onBackgroundColorChange: (color: string) => void;
  onSubmitAction: (data: LabelFormData) => void; // For AI suggestions or other actions
  onDownloadAction: () => void; // Specifically for download
  currentBackgroundImage: string | null;
}

export function LabelControls({
  form,
  onImageUpload,
  onClearImage,
  onBackgroundColorChange,
  onSubmitAction,
  onDownloadAction,
  currentBackgroundImage
}: LabelControlsProps) {
  const currentBgColor = form.watch('backgroundColor');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Front Label Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="beerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cosmic Haze IPA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="ibu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBU</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 65" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alcohol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alcohol (Alc %)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 6.8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select volume" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="33cl">33cl</SelectItem>
                        <SelectItem value="75cl">75cl</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Back Label Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., A juicy and hazy IPA..."
                      className="resize-y min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Water, Barley Malts (Pilsen, Vienna)..."
                      className="resize-y min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brewingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brewing Date</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Brewed on: 15/07/2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brewingLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brewing Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Starbase Brewery, Alpha Nebula" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Common Design Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <FormLabel>Background Image (Optional)</FormLabel>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="flex-grow"
                />
                {currentBackgroundImage && (
                   <Button variant="ghost" size="icon" onClick={onClearImage} aria-label="Clear image">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
               {currentBackgroundImage && (
                <div className="mt-2">
                  <img src={currentBackgroundImage} alt="Background preview" className="h-20 w-auto rounded-md border object-cover" />
                </div>
              )}
            </div>
            <FormField
              control={form.control}
              name="backgroundColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="color"
                        className="w-12 h-10 p-1"
                        value={field.value}
                        onChange={(e) => {
                           field.onChange(e.target.value);
                           onBackgroundColorChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <Input
                      type="text"
                      placeholder="#RRGGBB"
                      className="flex-grow"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        onBackgroundColorChange(e.target.value);
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => console.log("AI Suggestions clicked. Form data:", form.getValues())}>
            <Wand2 className="mr-2 h-4 w-4" />
            Get AI Suggestions
          </Button>
          <Button type="button" onClick={onDownloadAction}>
            <Download className="mr-2 h-4 w-4" />
            Download Labels
          </Button>
        </div>
      </form>
    </Form>
  );
}
