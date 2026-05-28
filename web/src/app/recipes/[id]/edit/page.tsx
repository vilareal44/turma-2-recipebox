'use client';
import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipeForm } from '@/components/recipe-form';

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button render={<Link href={`/recipes/${id}`} />} variant="ghost" size="sm">
          <ChevronLeft className="size-4" /> Back
        </Button>
      </div>
      <h1 className="text-2xl font-bold">Edit Recipe</h1>
      <RecipeForm mode="edit" recipeId={Number(id)} />
    </div>
  );
}
