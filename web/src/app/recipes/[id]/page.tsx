'use client';
import { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Clock, Users, Pencil, Trash2, ChevronLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/alert-dialog';
import { useRecipe, useDeleteRecipe, useToggleFavorite } from '@/hooks/use-recipes';

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const recipeId = Number(id);
  const router = useRouter();
  const { data: recipe, isLoading } = useRecipe(recipeId);
  const deleteRecipe = useDeleteRecipe();
  const [open, setOpen] = useState(false);
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null);
  const isFavorite = optimisticFavorite ?? recipe?.isFavorite ?? false;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toggleMutation = useToggleFavorite(recipeId, isFavorite);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleToggleFavorite = () => {
    setOptimisticFavorite(!isFavorite);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      toggleMutation.mutate(undefined, {
        onSettled: () => setOptimisticFavorite(null),
      });
    }, 300);
  };

  function handleDelete() {
    deleteRecipe.mutate(recipeId, {
      onSuccess: () => {
        toast.success('Recipe deleted');
        router.push('/');
      },
      onError: (err) => toast.error(err.message),
    });
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-muted rounded-lg" />
        <div className="h-8 bg-muted rounded w-1/2" />
      </div>
    );
  }

  if (!recipe) {
    return <p className="text-muted-foreground">Recipe not found.</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Button render={<Link href="/" />} variant="ghost" size="sm">
        <ChevronLeft className="size-4" /> Back
      </Button>

      {recipe.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="capitalize text-sm">{recipe.category}</Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className="h-10 w-10 rounded-full"
            >
              <Heart
                className="h-5 w-5"
                fill={isFavorite ? 'currentColor' : 'none'}
                color={isFavorite ? '#ef4444' : 'currentColor'}
              />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="size-4" /> Prep: {recipe.prepTime} min</span>
          <span className="flex items-center gap-1"><Clock className="size-4" /> Cook: {recipe.cookTime} min</span>
          <span className="flex items-center gap-1"><Users className="size-4" /> {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
        </div>

        <p className="text-muted-foreground">{recipe.description}</p>
      </div>

      <Separator />

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <ul className="space-y-1 list-disc list-inside">
          {recipe.ingredients.map((item, i) => (
            <li key={i} className="text-sm">{item}</li>
          ))}
        </ul>
      </div>

      <Separator />

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Instructions</h2>
        <ol className="space-y-3 list-decimal list-inside">
          {recipe.instructions.map((step, i) => (
            <li key={i} className="text-sm leading-relaxed">{step}</li>
          ))}
        </ol>
      </div>

      <Separator />

      <div className="flex gap-3">
        <Button render={<Link href={`/recipes/${recipe.id}/edit`} />} variant="outline">
          <Pencil className="size-4 mr-2" /> Edit
        </Button>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            <Trash2 className="size-4 mr-2" /> Delete
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete recipe?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &ldquo;{recipe.title}&rdquo;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleteRecipe.isPending}>
                {deleteRecipe.isPending ? 'Deleting…' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
