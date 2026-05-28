import Link from 'next/link';
import { ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ChefHat className="size-5" /> <span>RecipeBox</span>
        </Link>
        <Button render={<Link href="/recipes/new" />} size="sm">
          + New Recipe
        </Button>
      </div>
    </header>
  );
}
