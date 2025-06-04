
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <h1 className="text-5xl font-headline font-bold tracking-tight mb-6 text-primary">
        Welcome to Style Snap!
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-xl">
        Your AI-powered virtual wardrobe assistant. Upload your clothes, get style advice, and manage your collection effortlessly.
      </p>
      <div className="space-x-4">
        <Button asChild size="lg">
          <Link href="/add">Add First Item</Link>
        </Button>
        <Button variant="outline" size="lg" disabled>
          View My Wardrobe (Coming Soon)
        </Button>
      </div>
      <div className="mt-12">
        <p className="text-sm text-muted-foreground">
          Get started by adding your first clothing item.
        </p>
      </div>
    </div>
  );
}
