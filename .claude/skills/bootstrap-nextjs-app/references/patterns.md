# Code patterns

Copy these patterns, swapping `notes`/`Note`/`note` for the real entity. They assume the file layout from `stack-config.md` (`src/db`, `src/lib`, `src/hooks`, `src/components`, `src/app`).

## Shared validators (`src/lib/validators.ts`)

One Zod schema per entity, shared by the route handler (server) and the form (client). `update` is the partial of `create`.

```typescript
import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(5000),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
```

## Route handlers

### `src/app/api/notes/route.ts` — list + create

```typescript
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
```

### `src/app/api/notes/[id]/route.ts` — get / update / delete

In Next 15 `params` is a Promise — `await` it.

```typescript
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
```

## Client data layer

### `src/lib/api.ts` — fetch wrapper (relative URLs; same-origin route handlers)

```typescript
class ApiClient {
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return res.json();
  }
  get<T>(e: string) { return this.fetch<T>(e); }
  post<T>(e: string, d: unknown) { return this.fetch<T>(e, { method: 'POST', body: JSON.stringify(d) }); }
  put<T>(e: string, d: unknown) { return this.fetch<T>(e, { method: 'PUT', body: JSON.stringify(d) }); }
  delete<T>(e: string) { return this.fetch<T>(e, { method: 'DELETE' }); }
}
export const api = new ApiClient();
```

### `src/lib/query-client.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1, refetchOnWindowFocus: false } },
});
```

### `src/hooks/use-notes.ts` — query/mutation hooks

```typescript
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Note } from '@/db/schema';
import type { CreateNoteInput, UpdateNoteInput } from '@/lib/validators';

export function useNotes() {
  return useQuery({ queryKey: ['notes'], queryFn: () => api.get<Note[]>('/api/notes') });
}

export function useNote(id: number) {
  return useQuery({ queryKey: ['notes', id], queryFn: () => api.get<Note>(`/api/notes/${id}`), enabled: !!id });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoteInput) => api.post<Note>('/api/notes', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}

export function useUpdateNote(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateNoteInput) => api.put<Note>(`/api/notes/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<{ success: true }>(`/api/notes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}
```

## App shell

### `src/components/providers.tsx` (client)

Uses shadcn's sonner `Toaster` (added via `shadcn add sonner`).

```typescript
'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
```

### `src/app/layout.tsx`

Wrap the CLI-generated layout body with `<Providers>` and a header. Keep the CLI's font setup and `import './globals.css'`.

```typescript
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import './globals.css';

export const metadata = { title: '<App Name>', description: 'Bootstrapped full-stack app' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
```

### `src/components/header.tsx`

Plain Tailwind + a Lucide icon; link home and to the primary create action.

```typescript
import Link from 'next/link';
import { NotebookPen } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <NotebookPen className="size-5" /> <span>Notes</span>
        </Link>
      </div>
    </header>
  );
}
```

## Pages

Pages in `src/app` are Server Components by default. Anything interactive (forms, hooks, mutations) goes in a sibling `'use client'` component the page renders. Keep the page file thin.

```typescript
// src/app/page.tsx  (Server Component — thin)
import { NotesClient } from './notes-client';
export default function HomePage() {
  return <NotesClient />;
}
```

```typescript
// src/app/notes-client.tsx  (Client Component — the actual UI)
'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNotes, useCreateNote, useDeleteNote } from '@/hooks/use-notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

export function NotesClient() {
  const { data: notes, isLoading } = useNotes();
  const create = useCreateNote();
  const remove = useDeleteNote();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({ title, content }, {
      onSuccess: () => { setTitle(''); setContent(''); toast.success('Note created'); },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required />
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Saving…' : 'Add note'}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !notes?.length ? (
        <p className="text-muted-foreground">No notes yet. Add one above.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <Card key={n.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <h3 className="font-medium">{n.title}</h3>
                <p className="text-sm text-muted-foreground">{n.content}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(n.id)}>
                <Trash2 className="size-4" />
              </Button>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Mode B (with a spec) — applying the patterns

- **Derive entities** from the user's description; pick the 1–3 core ones for the first pass. Give each `id` + `createdAt`/`updatedAt` and the domain fields, choosing `pg-core` types per field (see `stack-config.md`).
- **Per entity**, generate the full set: schema table → Zod `create`/`update` validators → `api/<entity>` + `api/<entity>/[id]` route handlers → `use-<entity>` hooks → pages (list always; add detail/create/edit when the feature needs them, e.g. a reusable `<entity>-form` client component shared by create & edit).
- **Relations**: reference by integer FK columns (`integer('author_id').references(() => authors.id)`); join with Drizzle `.where(eq(...))` or relational queries. Don't add auth even if "users" appear — model them as a plain entity.
- **Styling**: lean on shadcn components and the design tokens shadcn put in `globals.css` (`text-muted-foreground`, `bg-card`, `border`, etc.). Don't hardcode a brand palette — keep it neutral so the user can theme later.
- Keep scope honest: get the foundation + first entities **running and verified**, then hand back with a summary of what's there and what's next.
