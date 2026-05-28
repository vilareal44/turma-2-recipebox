import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { recipes } from '@/db/schema';
import { updateRecipeSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';
import type { Recipe } from '@/db/schema';

type Params = { params: Promise<{ id: string }> };

function parseRecipe(row: typeof recipes.$inferSelect): Recipe {
  return {
    ...row,
    ingredients: JSON.parse(row.ingredients) as string[],
    instructions: JSON.parse(row.instructions) as string[],
  };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const [row] = await db.select().from(recipes).where(eq(recipes.id, Number(id)));
  if (!row) return NextResponse.json({ error: `Recipe with ID ${id} not found` }, { status: 404 });
  return NextResponse.json(parseRecipe(row));
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = updateRecipeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { imageUrl, ingredients, instructions, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
  if (ingredients !== undefined) updateData.ingredients = JSON.stringify(ingredients);
  if (instructions !== undefined) updateData.instructions = JSON.stringify(instructions);

  const [updated] = await db
    .update(recipes)
    .set(updateData)
    .where(eq(recipes.id, Number(id)))
    .returning();
  if (!updated) return NextResponse.json({ error: `Recipe with ID ${id} not found` }, { status: 404 });
  return NextResponse.json(parseRecipe(updated));
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const [deleted] = await db.delete(recipes).where(eq(recipes.id, Number(id))).returning();
  if (!deleted) return NextResponse.json({ error: `Recipe with ID ${id} not found` }, { status: 404 });
  return NextResponse.json({ success: true });
}
