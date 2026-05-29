import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { recipes } from '@/db/schema';
import { createRecipeSchema } from '@/lib/validators';
import { desc, eq, and } from 'drizzle-orm';
import type { Recipe } from '@/db/schema';

function parseRecipe(row: typeof recipes.$inferSelect): Recipe {
  return {
    ...row,
    ingredients: JSON.parse(row.ingredients) as string[],
    instructions: JSON.parse(row.instructions) as string[],
  };
}

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category') ?? undefined;
  const favorites = request.nextUrl.searchParams.get('favorites') === 'true';

  const conditions = [];
  if (category) conditions.push(eq(recipes.category, category));
  if (favorites) conditions.push(eq(recipes.isFavorite, true));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await db
    .select()
    .from(recipes)
    .where(whereClause)
    .orderBy(desc(recipes.createdAt));

  return NextResponse.json(rows.map(parseRecipe));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createRecipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { imageUrl, ingredients, instructions, ...rest } = parsed.data;
  const [created] = await db
    .insert(recipes)
    .values({
      ...rest,
      imageUrl: imageUrl || null,
      ingredients: JSON.stringify(ingredients),
      instructions: JSON.stringify(instructions),
    })
    .returning();
  return NextResponse.json(parseRecipe(created), { status: 201 });
}
