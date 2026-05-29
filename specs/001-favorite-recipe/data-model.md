# Data Model: Favoritar Receita

**Branch**: `001-favorite-recipe` | **Date**: 2026-05-28

## Entidade: Recipe (alteração)

A entidade `Recipe` já existe. Esta feature adiciona um único campo:

| Campo | Tipo | Coluna SQL | Restrições | Default |
|-------|------|-----------|-----------|---------|
| `isFavorite` | `boolean` | `is_favorite` | `NOT NULL` | `false` |

**Impacto em tipos TypeScript**:

```typescript
// web/src/db/schema/recipes.ts — acréscimo ao pgTable
isFavorite: boolean('is_favorite').notNull().default(false),

// O tipo Recipe (já inferido de RecipeRow) passa a incluir automaticamente:
// isFavorite: boolean
```

Não é necessário alterar o tipo `Recipe` manualmente — ele deriva de `$inferSelect` e incluirá `isFavorite` automaticamente após a mudança no schema.

O tipo `NewRecipe` (usado nas inserções) também incluirá `isFavorite` como opcional (default `false`).

## Validação Zod

Arquivo: `web/src/lib/validators.ts`

```typescript
// updateRecipeSchema — adicionar campo opcional:
isFavorite: z.boolean().optional(),
```

Não adicionado ao `createRecipeSchema` — novas receitas sempre iniciam com `isFavorite = false` via default do banco.

## Migration

Gerada via `bun run db:generate` após alteração do schema.

SQL esperado:
```sql
ALTER TABLE "recipes" ADD COLUMN "is_favorite" boolean DEFAULT false NOT NULL;
```

O `DEFAULT false NOT NULL` garante que todas as linhas existentes recebam o valor `false` sem backfill manual.

## Transições de estado

```
não favoritada (isFavorite = false)
       ↕  [toggle]
favoritada (isFavorite = true)
```

Não há estados intermediários. A transição é sempre um toggle simples.

## Impacto em dados existentes

- Todas as receitas existentes receberão `isFavorite = false` via `DEFAULT` da migration.
- Nenhuma receita existente será afetada negativamente.
- Nenhum backfill ou script adicional é necessário.
