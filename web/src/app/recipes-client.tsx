'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipe-card';
import { useRecipes } from '@/hooks/use-recipes';
import { CATEGORIES } from '@/lib/validators';

export function RecipesClient() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const { data: recipes, isLoading } = useRecipes(selectedCategory, onlyFavorites);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(undefined)}
        >
          All
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            className="capitalize"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
        <div className="ml-auto">
          <Button
            variant={onlyFavorites ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
          >
            ❤️ Favoritas
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-muted animate-pulse h-64" />
          ))}
        </div>
      ) : !recipes?.length ? (
        <p className="text-muted-foreground py-8 text-center">
          {onlyFavorites
            ? 'Nenhuma receita favoritada ainda.'
            : selectedCategory
              ? `No recipes found for "${selectedCategory}".`
              : 'No recipes yet. Add your first recipe!'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
