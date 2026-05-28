import Link from 'next/link';
import { Clock, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Recipe } from '@/db/schema';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block h-full">
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-video w-full bg-muted overflow-hidden">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight line-clamp-2">{recipe.title}</h3>
            <Badge variant="secondary" className="shrink-0 capitalize">{recipe.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {recipe.prepTime + recipe.cookTime} min
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
