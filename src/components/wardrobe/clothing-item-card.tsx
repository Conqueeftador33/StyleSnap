
"use client";
import Image from 'next/image';
import Link from 'next/link';
import type { ClothingItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, Shirt } from 'lucide-react'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWardrobe } from '@/hooks/use-wardrobe';
import { useToast } from '@/hooks/use-toast';

interface ClothingItemCardProps {
  item: ClothingItem;
}

export function ClothingItemCard({ item }: ClothingItemCardProps) {
  const { deleteItem } = useWardrobe();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteItem(item.id);
    toast({
      title: "Item Deleted",
      description: `${item.name || item.type} has been removed from your wardrobe.`,
      variant: "default"
    });
  };
  
  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg group">
      <CardHeader className="p-0">
        <div className="aspect-[3/4] relative w-full overflow-hidden rounded-t-md bg-muted">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name || item.type}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="fashion clothing"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Shirt className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-lg mb-1 truncate" title={item.name || item.type}>
          {item.name || item.type}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mb-2">{item.category}</CardDescription>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">{item.type}</Badge>
          <Badge variant="outline" className="text-xs">{item.color}</Badge>
          <Badge variant="outline" className="text-xs">{item.material}</Badge>
        </div>
        {item.notes && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">Notes: {item.notes}</p>
        )}
      </CardContent>
      <CardFooter className="p-3 border-t bg-card flex justify-between items-center">
        <Link href={`/edit/${item.id}`} passHref>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
            <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the item
                "{item.name || item.type}" from your wardrobe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Yes, delete item
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
