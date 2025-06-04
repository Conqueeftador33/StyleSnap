
"use client";
import { ChangeEvent, useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string) => void;
  initialImage?: string | null;
}

export function ImageUploader({ onImageUpload, initialImage = null }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        onImageUpload(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload(''); 
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {!preview ? (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center">
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <Label htmlFor="image-upload" className="cursor-pointer text-primary hover:underline">
              Click to upload an image
            </Label>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
            <Input
              id="image-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="relative group">
            <Image
              src={preview}
              alt="Uploaded preview"
              width={400}
              height={400}
              className="mx-auto max-h-[400px] w-auto rounded-md object-contain"
              data-ai-hint="clothing item"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveImage}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
