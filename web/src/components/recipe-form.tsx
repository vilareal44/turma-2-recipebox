'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateRecipe, useUpdateRecipe, useRecipe } from '@/hooks/use-recipes';
import { CATEGORIES } from '@/lib/validators';
import type { CreateRecipeInput } from '@/lib/validators';

type Props =
  | { mode: 'create' }
  | { mode: 'edit'; recipeId: number };

export function RecipeForm(props: Props) {
  const router = useRouter();
  const recipeId = props.mode === 'edit' ? props.recipeId : 0;
  const { data: existing } = useRecipe(recipeId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);

  useEffect(() => {
    if (props.mode === 'edit' && existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setCategory(existing.category);
      setPrepTime(String(existing.prepTime));
      setCookTime(String(existing.cookTime));
      setServings(String(existing.servings));
      setImageUrl(existing.imageUrl ?? '');
      setIngredients(existing.ingredients);
      setInstructions(existing.instructions);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe(recipeId);

  function updateList(list: string[], setList: (v: string[]) => void, index: number, value: string) {
    setList(list.map((item, i) => (i === index ? value : item)));
  }

  function removeFromList(list: string[], setList: (v: string[]) => void, index: number) {
    setList(list.filter((_, i) => i !== index));
  }

  function buildData(): CreateRecipeInput {
    return {
      title,
      description,
      category: category as typeof CATEGORIES[number],
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      ingredients: ingredients.filter(Boolean),
      instructions: instructions.filter(Boolean),
      imageUrl: imageUrl || undefined,
    };
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = buildData();

    if (props.mode === 'create') {
      createRecipe.mutate(data, {
        onSuccess: () => {
          toast.success('Recipe created!');
          router.push('/');
        },
        onError: (err) => toast.error(err.message),
      });
    } else {
      updateRecipe.mutate(data, {
        onSuccess: () => {
          toast.success('Recipe updated!');
          router.push(`/recipes/${recipeId}`);
        },
        onError: (err) => toast.error(err.message),
      });
    }
  }

  const isPending = props.mode === 'create' ? createRecipe.isPending : updateRecipe.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Spaghetti Carbonara" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of the recipe" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="servings">Servings</Label>
          <Input id="servings" type="number" min={1} max={100} value={servings} onChange={(e) => setServings(e.target.value)} placeholder="4" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prepTime">Prep Time (min)</Label>
          <Input id="prepTime" type="number" min={0} max={1440} value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="15" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cookTime">Cook Time (min)</Label>
          <Input id="cookTime" type="number" min={0} max={1440} value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="30" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL (optional)</Label>
        <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
      </div>

      <div className="space-y-3">
        <Label>Ingredients</Label>
        {ingredients.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateList(ingredients, setIngredients, i, e.target.value)}
              placeholder={`Ingredient ${i + 1}`}
              required
            />
            {ingredients.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFromList(ingredients, setIngredients, i)}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setIngredients([...ingredients, ''])}>
          <Plus className="size-4 mr-1" /> Add Ingredient
        </Button>
      </div>

      <div className="space-y-3">
        <Label>Instructions</Label>
        {instructions.map((item, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex items-start gap-2 flex-1">
              <span className="mt-2 text-sm text-muted-foreground w-5 shrink-0">{i + 1}.</span>
              <Textarea
                value={item}
                onChange={(e) => updateList(instructions, setInstructions, i, e.target.value)}
                placeholder={`Step ${i + 1}`}
                required
              />
            </div>
            {instructions.length > 1 && (
              <Button type="button" variant="ghost" size="icon" className="mt-1" onClick={() => removeFromList(instructions, setInstructions, i)}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setInstructions([...instructions, ''])}>
          <Plus className="size-4 mr-1" /> Add Step
        </Button>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : props.mode === 'create' ? 'Create Recipe' : 'Save Changes'}
      </Button>
    </form>
  );
}
