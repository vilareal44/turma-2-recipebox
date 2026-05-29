import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  prepTime: integer('prep_time').notNull(),
  cookTime: integer('cook_time').notNull(),
  servings: integer('servings').notNull(),
  ingredients: text('ingredients').notNull(),
  instructions: text('instructions').notNull(),
  imageUrl: text('image_url'),
  isFavorite: boolean('is_favorite').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

type RecipeRow = typeof recipes.$inferSelect;

export type Recipe = Omit<RecipeRow, 'ingredients' | 'instructions'> & {
  ingredients: string[];
  instructions: string[];
};

export type NewRecipe = Omit<typeof recipes.$inferInsert, 'ingredients' | 'instructions'> & {
  ingredients: string;
  instructions: string;
};
