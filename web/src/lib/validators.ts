import { z } from 'zod';

export const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'] as const;
export type Category = typeof CATEGORIES[number];

export const createRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(1000),
  category: z.enum(CATEGORIES, { message: 'Invalid category' }),
  prepTime: z.coerce.number().int().min(0).max(1440),
  cookTime: z.coerce.number().int().min(0).max(1440),
  servings: z.coerce.number().int().min(1).max(100),
  ingredients: z.array(z.string().min(1, 'Ingredient cannot be empty')).min(1, 'At least one ingredient required'),
  instructions: z.array(z.string().min(1, 'Instruction cannot be empty')).min(1, 'At least one instruction required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const updateRecipeSchema = createRecipeSchema.partial().extend({
  isFavorite: z.boolean().optional(),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
