'use client';
import Link from 'next/link';
import { Clock, Users, Heart } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToggleFavorite } from '@/hooks/use-recipes';
import type { Recipe } from '@/db/schema';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);
  const isFavorite = optimisticFavorite ?? recipe.isFavorite;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toggleMutation = useToggleFavorite(recipe.id, isFavorite);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setOptimisticFavorite(!isFavorite);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      toggleMutation.mutate(undefined, {
        onSettled: () => setOptimisticFavorite(null),
      });
    }, 300);
  };

  return (
    <Link href={`/recipes/${recipe.id}`} className="block h-full">
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-video w-full bg-muted overflow-hidden">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm"
          >
            <Heart
              className="h-4 w-4"
              fill={isFavorite ? 'currentColor' : 'none'}
              color={isFavorite ? '#ef4444' : 'currentColor'}
            />
          </Button>
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
