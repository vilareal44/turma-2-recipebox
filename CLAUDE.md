# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Sempre responda em **português (Brasil)**, independente do idioma usado na pergunta.

## Projeto

RecipeBox — gerenciador pessoal de receitas de cozinha. App full-stack em Next.js (sem autenticação, usuário único). Todo o código fica em `web/`.

## Comandos (executar dentro de `web/`)

```bash
bun run dev          # sobe o servidor de dev na porta :3000
bun run check-types  # verificação TypeScript (sem emit)
bun run lint         # ESLint
bun run build        # build de produção

bun run db:generate  # gera migration Drizzle a partir de mudanças no schema
bun run db:migrate   # aplica as migrations pendentes no Neon
bun run db:push      # aplica schema direto (interativo — precisa de TTY; use generate+migrate em scripts)
bun run db:seed      # insere receitas de exemplo
bun run db:studio    # abre o Drizzle Studio
```

> **Mudanças de schema:** sempre use `db:generate` + `db:migrate`, nunca `db:push`, quando rodar de forma não-interativa (ex: dentro do Claude Code). O `db:push` exige TTY para resolver conflitos de tabela.

## Stack

- **Next.js 16** (App Router, Turbopack) — **esta versão tem breaking changes**. Leia `node_modules/next/dist/docs/` antes de escrever código Next.js. Atenção aos avisos de deprecação.
- **@base-ui/react** como primitivos de UI — **não é Radix**. Não existe prop `asChild`. Use a prop `render` para renderização polimórfica: `<Button render={<Link href="/" />}>label</Button>`
- **shadcn/ui** (style: base-nova) em `src/components/ui/` — construído sobre `@base-ui/react`
- **Drizzle ORM** + **Neon PostgreSQL** (driver HTTP via `@neondatabase/serverless`)
- **TanStack Query v5** para data fetching no cliente
- **Zod v4** para validação de inputs
- **Sonner** para notificações toast
- **Bun** como gerenciador de pacotes e runtime

## Arquitetura

```
web/src/
  app/
    api/recipes/          # REST API: GET/POST coleção, GET/PUT/DELETE por id
    recipes/[id]/         # página de detalhe (client component, usa hook useRecipe)
    recipes/[id]/edit/    # página de edição (renderiza RecipeForm em modo edit)
    recipes/new/          # página de criação (renderiza RecipeForm em modo create)
    recipes-client.tsx    # client component da listagem (filtros + grid)
    page.tsx              # shell da home (server component → RecipesClient)
  components/
    recipe-card.tsx       # card para o grid da listagem
    recipe-form.tsx       # formulário compartilhado create/edit com listas dinâmicas de ingredientes e instruções
    header.tsx
    ui/                   # componentes shadcn
  db/
    index.ts              # cliente Drizzle (neon-http)
    schema/recipes.ts     # definição da tabela recipes + tipo Recipe
  hooks/use-recipes.ts    # hooks TanStack Query: useRecipes, useRecipe, useCreateRecipe, useUpdateRecipe, useDeleteRecipe
  lib/
    api.ts                # cliente fetch genérico (api.get/post/put/delete)
    validators.ts         # schemas Zod: createRecipeSchema, updateRecipeSchema, CATEGORIES
    query-client.ts       # configuração do TanStack Query
    utils.ts              # helper cn()
```

### Convenções de fluxo de dados

- **A camada de API é dona da serialização**: `ingredients` e `instructions` são armazenados como strings JSON em colunas `text`. As route files (não hooks, não components) chamam `JSON.parse`/`JSON.stringify`. O tipo `Recipe` exportado de `schema/recipes.ts` já expõe `ingredients: string[]` e `instructions: string[]`.
- **Coerção de `imageUrl`**: string vazia `""` vira `null` nas API routes, antes de gravar no banco.
- **Filtro por categoria**: `useRecipes(category?)` inclui a categoria na query key (`['recipes', category]`) para que cada filtro tenha cache separado.
- **Botões polimórficos**: `<Button render={<Link href="..."/>}>texto</Button>` — nunca `asChild`.

### Ambiente

Requer `DATABASE_URL` em `web/.env.local` apontando para uma instância Neon PostgreSQL. Exemplo em `web/.env.example`.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at `specs/001-favorite-recipe/plan.md`.
<!-- SPECKIT END -->
