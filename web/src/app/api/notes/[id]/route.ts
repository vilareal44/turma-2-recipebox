import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notes } from '@/db/schema';
import { updateNoteSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const [row] = await db.select().from(notes).where(eq(notes.id, Number(id)));
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = updateNoteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const [updated] = await db
    .update(notes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(notes.id, Number(id)))
    .returning();
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const [deleted] = await db.delete(notes).where(eq(notes.id, Number(id))).returning();
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
