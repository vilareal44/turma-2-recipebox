---
name: bootstrap-nextjs-app
description: >-
  Bootstraps a brand-new, opinionated full-stack Next.js application from scratch and gets it
  running end-to-end (frontend + backend + database), with NO authentication for simplicity.
  The fixed stack is Next.js (latest, App Router) + TypeScript + Tailwind v4 + shadcn/ui + Drizzle ORM
  on Neon Postgres + TanStack Query + Zod, scaffolded with Bun via create-next-app. Use this skill whenever the user
  wants to START a new web app / SaaS / dashboard / CRUD tool / "fullstack app" / frontend+backend
  project from zero — phrases like "bootstrap", "scaffold", "começar do zero", "iniciar/criar um
  projeto novo", "monta a base de uma webapp", "novo Next.js", "hello world fullstack". Trigger it
  EVEN IF the user does not name the stack or the word "skill" — if they want a fresh app skeleton
  that actually runs, this is the skill. Works in two modes: (A) no spec → a minimal hello-world
  full-stack app that runs; (B) with a spec → the same base PLUS the first features implemented.
  Do NOT use for existing projects, for adding a feature to a running app, or when the user wants a
  different framework (plain React/Vite, NestJS, etc.).
---

# Bootstrap Next.js App

Stand up a fresh, opinionated full-stack Next.js app that **runs end-to-end on the first try** — UI, API, and a real Postgres database — with zero authentication so there's nothing in the way of building features.

The whole point is to remove the boring, error-prone setup decisions. The stack below is fixed and not up for debate during a bootstrap; the user's spec (if any) only decides *what features* to build on top of it, never *which tools*.

## Two modes

Figure out which mode you're in from what the user gave you:

- **Mode A — no spec (hello-world).** The user just wants a running starting point ("monta a base", "hello world fullstack", no domain described). Build the full stack plus **one tiny demo feature** (a `notes` CRUD — title + content, list/create/delete) whose only job is to prove the whole pipeline works: a form writes to Postgres through a route handler, a list reads it back through TanStack Query. The user deletes it once they start real work.

- **Mode B — with a spec.** The user described what the app should do. Build the same base, then derive the domain from their description and implement the **first features**: the core entities, their CRUD route handlers, validators, query hooks, and pages. Don't try to build the entire product — get the foundation and the first 1–3 entities working and running, then hand back.

In both modes the deliverable is identical in spirit: `bun run dev` works, the page loads, and data round-trips to Neon.

## The opinionated stack (fixed)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js** (latest via `create-next-app`), App Router | One framework for front + back (route handlers) — no separate API server |
| Runtime/PM | **Bun** | Fast install + runs `.ts` (seed scripts) and loads `.env.local` automatically |
| Language | **TypeScript 5**, strict | Caught-at-compile safety end-to-end |
| Styling | **Tailwind CSS v4** | Set up by `create-next-app`; shadcn builds on it |
| Components | **shadcn/ui** | Owned, copy-in components (Radix + Tailwind) — no opaque component lib |
| ORM | **Drizzle ORM** | Typed schema + queries, lightweight, great with Postgres |
| Database | **Neon Postgres** (serverless HTTP driver) | Real Postgres, no local DB to run; connection via `DATABASE_URL` |
| Server state | **TanStack Query v5** | Caching + invalidation for client data fetching |
| Validation | **Zod** | One schema shared by route handlers and client forms |
| Icons / toasts | **lucide-react** / **sonner** (via shadcn) | Consistent defaults |

## Hard rules

- **No authentication, no authorization, no multi-tenancy.** This is a wide-open demo/starter. Don't add NextAuth, Clerk, sessions, or login pages even if the spec hints at "users" — model users as plain data if needed, but no auth.
- **Don't invent a different stack.** If the user asks for a tool not in the table (Prisma, NestJS, plain Vite, MongoDB…), pause and tell them this skill is opinionated about the stack; either proceed with the fixed stack or stop. Don't silently substitute.
- **It must actually run.** A bootstrap that doesn't `bun run dev` cleanly is a failed bootstrap. The verification checklist at the end is not optional.

## Workflow

Follow these in order. Read the reference files as you reach the step that needs them — don't load everything up front.

1. **Pick the project name & target dir.** Default to the current directory if it's empty; otherwise create a kebab-case folder. Pick a short `app slug` (e.g. `notes-app`) for naming.

2. **Scaffold the Next.js base** with `create-next-app` (non-interactive flags), then **init shadcn/ui**, then add the runtime deps. Exact commands and flags are in **`references/stack-config.md`** → "Scaffold commands". This gives you a correct Next 15 + Tailwind v4 + TS + App Router base so you don't hand-maintain configs.

3. **Wire up the database.** Create `.env.local` with `DATABASE_URL` (Neon), the Drizzle config, the db client (Neon HTTP driver), and the schema. See **`references/stack-config.md`** → "Database & config files". If the user hasn't provided a Neon connection string, write a `.env.example`, leave a clear placeholder in `.env.local`, and tell them you need a `DATABASE_URL` before the DB steps can run — don't fabricate one.

4. **Define the domain.**
   - Mode A: the `notes` demo entity.
   - Mode B: derive entities/fields/validation from the spec. Keep it to the first 1–3 entities.
   Write the Drizzle schema (`pgTable`) and the shared Zod validators.

5. **Build the backend** — route handlers under `src/app/api/<entity>/…` for list/create and `[id]` get/update/delete, validating bodies with Zod. Patterns in **`references/patterns.md`**.

6. **Build the data layer & UI** — TanStack Query provider, `api` fetch client, per-entity hooks, then the pages (list / create / detail / edit as the feature needs) built from shadcn components. Patterns and the shared layout/providers are in **`references/patterns.md`**.

7. **Seed** a few realistic rows (`src/db/seed.ts`, run with Bun).

8. **Push schema & run** — push the schema to Neon, seed, start dev, and walk the verification checklist below.

## shadcn/ui notes

- Init non-interactively and add the components the feature needs (`button input textarea card label sonner` covers most CRUD UIs). Commands in `references/stack-config.md`.
- shadcn owns `src/components/ui/*`, `src/lib/utils.ts` (the `cn` helper), and the theme variables in `globals.css`. Use those components rather than hand-rolling buttons/inputs.
- Use shadcn's **sonner** wrapper (`components/ui/sonner.tsx`) for toasts; mount its `<Toaster />` in the providers.
- React 19 / Tailwind v4 can trigger peer-dep prompts. If a shadcn command stalls on a prompt, re-run it with `--yes` (and `--force` if it complains about peers). Prefer `bunx --bun shadcn@latest …`.

## Verification checklist (do not skip)

Run these in order and fix anything that fails before declaring done:

1. `bun install` — clean, no errors.
2. `DATABASE_URL` is set in `.env.local` (real Neon string). If not, stop and ask.
3. `bun run db:push` — schema syncs to Neon with no errors.
4. `bun run db:seed` — sample rows inserted.
5. `bun run dev` — starts on `http://localhost:3000` with no runtime errors. (Kill anything already on 3000 first.)
6. API round-trips: `curl http://localhost:3000/api/<entity>` returns the seeded rows as JSON.
7. `bun run build` (or `bun run check-types` if present) — TypeScript compiles with no errors.
8. Open `http://localhost:3000` — the page renders the seeded data and the form creates a new row that appears in the list.

If something fails, debug and fix it — the project MUST compile, run, and round-trip data before the bootstrap is complete. When done, give the user a short summary: what was built, the routes/entities, and the exact commands to run it.
