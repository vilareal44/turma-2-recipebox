import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notes } from '@/db/schema';
import { createNoteSchema } from '@/lib/validators';
import { desc } from 'drizzle-orm';

export async function GET() {
  const rows = await db.select().from(notes).orderBy(desc(notes.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const [created] = await db.insert(notes).values(parsed.data).returning();
  return NextResponse.json(created, { status: 201 });
}
