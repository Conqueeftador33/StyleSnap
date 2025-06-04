
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AI_CLOTHING_TYPES, AI_CLOTHING_COLORS, AI_CLOTHING_MATERIALS, WARDROBE_CATEGORIES, ClothingItem } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const itemSchema = z.object({
  name: z.string().max(100, "Name can be at most 100 characters").optional(),
  type: z.enum(AI_CLOTHING_TYPES, { required_error: "Type is required." }),
  material: z.enum(AI_CLOTHING_MATERIALS, { required_error: "Material is required." }),
  color: z.enum(AI_CLOTHING_COLORS, { required_error: "Color is required." }),
  category: z.enum(WARDROBE_CATEGORIES, { required_error: "Category is required." }),
});

export type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormProps {
  onSubmit: (data: ItemFormData) => void;
  defaultValues?: Partial<ClothingItem>;
  imageUrl?: string | null;
  isSubmitting?: boolean;
  submitButtonText?: string;
  formTitle: string;
  formDescription: string;
}

export function ItemForm({
  onSubmit,
  defaultValues,
  imageUrl,
  isSubmitting = false,
  submitButtonText = "Save Item",
  formTitle,
  formDescription,
}: ItemFormProps) {
  const router = useRouter();
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      type: defaultValues?.type || AI_CLOTHING_TYPES[0],
      material: defaultValues?.material || AI_CLOTHING_MATERIALS[0],
      color: defaultValues?.color || AI_CLOTHING_COLORS[0],
      category: defaultValues?.category || WARDROBE_CATEGORIES[0],
    },
  });

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name || '',
        type: defaultValues.type || AI_CLOTHING_TYPES[0],
        material: defaultValues.material || AI_CLOTHING_MATERIALS[0],
        color: defaultValues.color || AI_CLOTHING_COLORS[0],
        category: defaultValues.category || WARDROBE_CATEGORIES[0],
      });
    }
  }, [defaultValues, form]);


  const handleSubmit = (data: ItemFormData) => {
    onSubmit(data);
  };

  const isSubmitButtonDisabled = isSubmitting || (!imageUrl && !defaultValues?.imageUrl);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline">{formTitle}</CardTitle>
            <CardDescription>{formDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {imageUrl && (
              <div className="mb-6">
                <Label>Item Image</Label>
                <div className="mt-2 aspect-square w-full max-w-xs mx-auto relative overflow-hidden rounded-md border border-muted">
                  <Image src={imageUrl} alt="Item image" layout="fill" objectFit="cover" data-ai-hint="clothing preview"/>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Favorite Blue Shirt" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <TooltipProvider>
              <Tooltip open={isSubmitButtonDisabled && !isSubmitting && (!imageUrl && !defaultValues?.imageUrl) ? undefined : false}>
                <TooltipTrigger asChild>
                  {/* The button needs a wrapper for TooltipTrigger when disabled */}
                  <span tabIndex={0}> 
                    <Button type="submit" disabled={isSubmitButtonDisabled}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {submitButtonText}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Please upload an image for the item.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
