import { RecipeForm } from '@/components/recipe-form';

export default function NewRecipePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Recipe</h1>
      <RecipeForm mode="create" />
    </div>
  );
}
