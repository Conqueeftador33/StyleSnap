
"use client";
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AI_CLOTHING_TYPES, AI_CLOTHING_COLORS, AI_CLOTHING_MATERIALS, WARDROBE_CATEGORIES, type ClothingItem, type AiClothingType, type AiClothingColor, type AiClothingMaterial, type WardrobeCategory } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Loader2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const itemFormSchema = z.object({
  name: z.string().max(100, "Name can be at most 100 characters").optional(),
  category: z.enum(WARDROBE_CATEGORIES, { required_error: "Category is required." }),
  type: z.enum(AI_CLOTHING_TYPES, { required_error: "Type is required." }),
  color: z.enum(AI_CLOTHING_COLORS, { required_error: "Color is required." }),
  material: z.enum(AI_CLOTHING_MATERIALS, { required_error: "Material is required." }),
  brand: z.string().max(100, "Brand can be at most 100 characters").optional(),
  size: z.string().max(50, "Size can be at most 50 characters").optional(),
  notes: z.string().max(500, "Notes can be at most 500 characters").optional(),
  // imageUrl is not part of the form data itself, but passed as a prop
});

export type ItemFormData = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  onSubmit: (data: ItemFormData) => void;
  initialData?: Partial<ItemFormData>; // Used for pre-filling from AI or editing
  imageUrl: string | null; // Required for displaying the image
  isSubmitting?: boolean;
  submitButtonText?: string;
  formTitle: string;
  formDescription: string;
  aiSuggestion?: string | null; // AI's description of the item
}

export function ItemForm({
  onSubmit,
  initialData,
  imageUrl,
  isSubmitting = false,
  submitButtonText = "Save Item",
  formTitle,
  formDescription,
  aiSuggestion,
}: ItemFormProps) {
  const router = useRouter();
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category || WARDROBE_CATEGORIES.includes("Other" as WardrobeCategory) ? "Other" : WARDROBE_CATEGORIES[0],
      type: initialData?.type || AI_CLOTHING_TYPES.includes("Other" as AiClothingType) ? "Other" : AI_CLOTHING_TYPES[0],
      color: initialData?.color || AI_CLOTHING_COLORS.includes("Other" as AiClothingColor) ? "Other" : AI_CLOTHING_COLORS[0],
      material: initialData?.material || AI_CLOTHING_MATERIALS.includes("Other" as AiClothingMaterial) ? "Other" : AI_CLOTHING_MATERIALS[0],
      brand: initialData?.brand || '',
      size: initialData?.size || '',
      notes: initialData?.notes || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        category: initialData.category || (WARDROBE_CATEGORIES.includes("Other" as WardrobeCategory) ? "Other" : WARDROBE_CATEGORIES[0]),
        type: initialData.type || (AI_CLOTHING_TYPES.includes("Other" as AiClothingType) ? "Other" : AI_CLOTHING_TYPES[0]),
        color: initialData.color || (AI_CLOTHING_COLORS.includes("Other" as AiClothingColor) ? "Other" : AI_CLOTHING_COLORS[0]),
        material: initialData.material || (AI_CLOTHING_MATERIALS.includes("Other" as AiClothingMaterial) ? "Other" : AI_CLOTHING_MATERIALS[0]),
        brand: initialData.brand || '',
        size: initialData.size || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: ItemFormData) => {
    onSubmit(data);
  };

  const isSubmitButtonDisabled = isSubmitting || !imageUrl;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{formTitle}</CardTitle>
            <CardDescription>{formDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {imageUrl && (
              <div className="mb-6 text-center">
                <Label className="block text-sm font-medium text-muted-foreground mb-2">Item Image</Label>
                <div className="mt-1 aspect-square w-full max-w-xs mx-auto relative overflow-hidden rounded-lg border-2 border-dashed border-muted">
                  <Image src={imageUrl} alt="Item image" layout="fill" objectFit="cover" data-ai-hint="uploaded clothing"/>
                </div>
              </div>
            )}
            {!imageUrl && (
                 <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Image Provided</AlertTitle>
                    <AlertDescription>
                        Please upload or capture an image first. The form will be enabled once an image is available.
                    </AlertDescription>
                </Alert>
            )}

            {aiSuggestion && imageUrl && (
              <Alert variant="default" className="bg-accent/20 border-accent/50">
                <Info className="h-4 w-4 text-accent" />
                <AlertTitle className="text-accent-foreground font-semibold">AI Suggestion</AlertTitle>
                <AlertDescription className="text-accent-foreground/80">
                  {aiSuggestion}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Favorite Blue Shirt" {...field} disabled={!imageUrl} />
                  </FormControl>
                  <FormDescription>Give your item a custom name for easier searching.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!imageUrl}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WARDROBE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!imageUrl}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AI_CLOTHING_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!imageUrl}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AI_CLOTHING_MATERIALS.map((material) => (
                          <SelectItem key={material} value={material}>{material}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!imageUrl}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AI_CLOTHING_COLORS.map((color) => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fashion Brand Co." {...field} disabled={!imageUrl} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., M, 10, Large" {...field} disabled={!imageUrl} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any specific details, e.g., 'Gift from mom', 'Only wear for special occasions'" {...field} disabled={!imageUrl} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 p-4 border-t">
            <Button type="button" variant="outline" onClick={() => router.push('/wardrobe')} disabled={isSubmitting}>
              Cancel
            </Button>
            <TooltipProvider>
              <Tooltip open={isSubmitButtonDisabled && !isSubmitting && !imageUrl ? undefined : false}>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="w-full sm:w-auto">
                    <Button type="submit" disabled={isSubmitButtonDisabled} className="w-full sm:w-auto">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {submitButtonText}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!imageUrl && (
                  <TooltipContent>
                    <p>Please upload or capture an image for the item first.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
