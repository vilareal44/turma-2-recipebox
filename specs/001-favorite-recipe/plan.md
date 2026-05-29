# Implementation Plan: Favoritar Receita

**Branch**: `001-favorite-recipe` | **Date**: 2026-05-28 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-favorite-recipe/spec.md`

## Summary

Adicionar a capacidade de marcar receitas como favoritas: toggle persistido no banco via coluna booleana na tabela `recipes` existente, filtro de favoritas na listagem, e feedback visual imediato com atualização otimista + debounce + rollback em caso de erro.

## Technical Context

**Language/Version**: TypeScript (Next.js 16, App Router, Turbopack)  
**Primary Dependencies**: Drizzle ORM, TanStack Query v5, Zod v4, Sonner, @base-ui/react, shadcn/ui  
**Storage**: Neon PostgreSQL via `@neondatabase/serverless` (HTTP driver)  
**Testing**: `bun run check-types` + `bun run lint` + verificação manual no browser  
**Target Platform**: Web (SSR + client-side)  
**Project Type**: web-app (Next.js full-stack, single-user)  
**Performance Goals**: feedback visual < 2 segundos (SC-001)  
**Constraints**: Mudanças de schema via `db:generate` + `db:migrate` (nunca `db:push` em automação); coluna com `DEFAULT false` para compatibilidade com dados existentes  
**Scale/Scope**: usuário único; todas as receitas existentes recebem `isFavorite = false` por padrão via migration

## Constitution Check

*GATE: Deve passar antes da Phase 0. Re-verificado após Phase 1.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Entidade Única e Escopo Mínimo | ⚠️ VIOLAÇÃO JUSTIFICADA | "favoritos" consta explicitamente na lista de exclusões do PRD em constitution.md. Violação documentada em Complexity Tracking. |
| II. API como Dona da Serialização | ✅ Pass | `isFavorite` é booleano nativo — sem serialização JSON adicional. |
| III. Cache via TanStack Query | ✅ Pass | Toggle usa `useMutation` com invalidação de cache; filtro usa query key `['recipes', category, onlyFavorites]`. |
| IV. Segurança de Tipos (Zod + TypeScript) | ✅ Pass | `isFavorite` adicionado ao schema Drizzle e ao `updateRecipeSchema` Zod. Tipo derivado do schema. |
| V. Simplicidade de UI com Base UI / shadcn | ✅ Pass | Botão de toggle usa `<Button>` shadcn; sem `asChild`; ícone via `lucide-react` (já disponível). |

> **Ação recomendada**: Remover "favoritos" da lista de exclusões no `constitution.md` após aprovação desta feature pelo product owner (o próprio usuário).

## Project Structure

### Documentation (this feature)

```text
specs/001-favorite-recipe/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
web/src/
  db/
    schema/
      recipes.ts           # MODIFY: adicionar coluna isFavorite
  lib/
    validators.ts          # MODIFY: adicionar isFavorite ao updateRecipeSchema
  app/
    api/
      recipes/
        route.ts           # MODIFY: suporte ao query param ?favorites=true
      recipes/[id]/
        route.ts           # MODIFY: persistir isFavorite via PUT
    recipes/[id]/
      page.tsx             # MODIFY: adicionar botão de toggle favorito
  hooks/
    use-recipes.ts         # MODIFY: useToggleFavorite + useRecipes com filtro favorites
  components/
    recipe-card.tsx        # MODIFY: adicionar botão de toggle favorito no card

drizzle/                   # GENERATED: nova migration isFavorite
```

**Structure Decision**: Feature puramente aditiva sobre a estrutura existente. Nenhum arquivo novo de rota ou página é criado — aproveitamos os endpoints e componentes existentes.

## Complexity Tracking

| Violação | Por que necessária | Alternativa mais simples rejeitada porque |
|----------|--------------------|------------------------------------------|
| Princípio I: "favoritos" excluído do PRD | Feature explicitamente solicitada pelo product owner via workflow speckit, com spec e clarificações concluídas. Estende a entidade `Recipe` sem adicionar entidades novas. Complexidade mínima (1 coluna booleana). | Recusar a feature contradiria a decisão explícita do product owner de adicioná-la ao produto. |
