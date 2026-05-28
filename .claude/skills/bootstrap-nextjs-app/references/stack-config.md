# Stack, scaffold commands & config files

CLI-first. **Always** create the Next.js base with `create-next-app` — never hand-write the Next/Tailwind/tsconfig/postcss base from scratch. The CLI produces a correct, current Next (latest — Next 16 at time of writing) + Tailwind v4 + TS + App Router project; you only layer the opinionated extras on top. Don't pin a Next major in your head — use whatever `@latest` installs; the patterns here are App-Router-stable across 15/16.

## Scaffold commands

Run from inside the target directory (use `.` for the current empty dir) or pass a name. All flags are set so the CLI runs **non-interactively**.

```bash
# 1. Next.js base (App Router, TS, Tailwind v4, src dir, @/* alias, Bun)
#    (Turbopack is the default dev bundler in current Next — no flag needed.)
bunx create-next-app@latest <project-name-or-.> \
  --ts --app --tailwind --src-dir --eslint \
  --import-alias "@/*" --use-bun --yes

cd <project-name>   # if you created a named folder

# 2. shadcn/ui (non-interactive; ships a neutral theme by default)
bunx --bun shadcn@latest init -d --yes
#    NOTE: do NOT pass `-b neutral` — in the current CLI `-b/--base` selects the component
#    library (radix|base), not the color. `init -d` already gives a neutral theme.
#    add the components the feature needs (these cover most CRUD UIs):
bunx --bun shadcn@latest add button input textarea label card sonner --yes
#    if a command stalls on a peer-dep prompt (React 19 / Tailwind v4), re-run with --force

# 3. Runtime deps (the opinionated extras)
bun add drizzle-orm @neondatabase/serverless @tanstack/react-query zod
bun add -d drizzle-kit
#    lucide-react is pulled in by shadcn; add it explicitly if not present:
bun add lucide-react
```

Notes:
- `create-next-app@latest` currently installs **Next 16** (React 19, Tailwind v4). Don't assume a specific major — the App-Router patterns here hold for 15 and 16.
- `create-next-app` already writes `next.config.ts`, `tsconfig.json` (with `@/*`), `postcss.config.mjs` (`@tailwindcss/postcss`), `eslint`, and `globals.css` (`@import "tailwindcss"`). Don't recreate them.
- shadcn rewrites `globals.css` with theme variables, adds `components.json`, `src/lib/utils.ts` (the `cn` helper), and installs `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`. Leave those as-is.
- The Neon **serverless HTTP** driver (`@neondatabase/serverless`) needs no native build and no `serverExternalPackages` entry — `next.config.ts` can stay as the CLI generated it.

## package.json scripts

Keep the `dev`/`build`/`start`/`lint` scripts `create-next-app` generated (don't rewrite them — the CLI already wires Turbopack as the default dev bundler). Just **add** these extra scripts to the block:

```jsonc
{
  "scripts": {
    // ...keep the CLI's dev/build/start/lint as-is...
    "check-types": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun run src/db/seed.ts"
  }
}
```

`db:push` is the default for bootstrap — it syncs the schema straight to Neon with no migration files to manage. Keep `db:generate`/`db:migrate` available for teams that later want versioned migrations.

## Database & config files

### `.env.local` (gitignored — Next.js AND Bun both auto-load it)

```
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
```

Also write a committed `.env.example` with the same key and a placeholder value. If the user hasn't given you a real Neon string, put an obvious placeholder in `.env.local`, and tell them the DB steps (`db:push`, `db:seed`, `dev`) will fail until they paste a real `DATABASE_URL`. Never invent a connection string.

> **Env loading — read this, it's a known footgun.** The Bun *runtime* auto-loads `.env.local` when it executes a `.ts` file directly, so `bun run db:seed` (which runs `src/db/seed.ts`) and `next dev` both see `DATABASE_URL` for free. But `drizzle-kit` runs in its **own** process and evaluates `drizzle.config.ts` *without* loading `.env.local` — so `db:push`/`db:migrate`/`db:studio` will fail with `connection "url" ... required` unless the config loads the env itself. The config below does that with a tiny dependency-free loader. Don't drop it.

### `drizzle.config.ts` (project root)

```typescript
import { defineConfig } from 'drizzle-kit';
import { readFileSync } from 'node:fs';

// drizzle-kit evaluates this file in its own process and does NOT auto-load .env.local,
// so pull DATABASE_URL out of it explicitly when it isn't already in the environment.
if (!process.env.DATABASE_URL) {
  try {
    const file = readFileSync('.env.local', 'utf8');
    const match = file.match(/^\s*DATABASE_URL\s*=\s*["']?(.+?)["']?\s*$/m);
    if (match) process.env.DATABASE_URL = match[1];
  } catch {
    // .env.local not present yet — defineConfig will surface a clear error below
  }
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

### `src/db/index.ts` — Neon HTTP client (Drizzle)

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### `src/db/schema/index.ts`

Re-export every table file so Drizzle config and the client pick them all up:

```typescript
export * from './notes'; // + one line per entity
```

### `.gitignore`

`create-next-app` already ignores `node_modules`, `.next`, **and `.env*`** (so `.env.local` is covered — don't re-add it). Two tweaks: un-ignore the example file so it can be committed, and ignore the push-only `drizzle/` dir. Append:

```
# allow the committed example even though .env* is ignored
!.env.example
drizzle/
```

(Keep `drizzle/` ignored only while you rely on `db:push`; if you switch to generated migrations, commit it instead.)

## Drizzle schema pattern (Postgres)

Use `pg-core` types. Every table gets an integer PK and timestamps:

```typescript
// src/db/schema/notes.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
```

Common column types: `text`, `integer`, `boolean`, `serial`, `timestamp`, `numeric`, `jsonb` (use `jsonb` for arrays/objects instead of JSON-stringifying text — it's native Postgres). For enums use `text` with a Zod `z.enum` guard, or `pgEnum` if you prefer DB-level enforcement.

## Seed script (`src/db/seed.ts`)

```typescript
import { db } from './index';
import { notes } from './schema';

async function seed() {
  await db.insert(notes).values([
    { title: 'Welcome', content: 'This note proves the full stack works end-to-end.' },
    { title: 'Next steps', content: 'Delete the notes feature and build your own.' },
  ]);
  console.log('Seeded.');
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
```

Run with `bun run db:seed` (Bun executes the `.ts` directly and loads `.env.local`).
