# Quickstart: Favoritar Receita

**Branch**: `001-favorite-recipe` | **Date**: 2026-05-28

## Pré-requisitos

- `web/.env.local` com `DATABASE_URL` apontando para Neon PostgreSQL
- Dependências instaladas (`bun install` dentro de `web/`)

## Ordem de implementação

Siga esta ordem para evitar erros de compilação intermediários:

### 1. Schema e Migration

```bash
# Dentro de web/
# 1. Editar web/src/db/schema/recipes.ts — adicionar isFavorite
# 2. Gerar a migration
bun run db:generate

# 3. Aplicar no banco
bun run db:migrate
```

### 2. Validação

```bash
# Editar web/src/lib/validators.ts — adicionar isFavorite ao updateRecipeSchema
```

### 3. API

```bash
# Editar web/src/app/api/recipes/route.ts — suporte a ?favorites=true
# Editar web/src/app/api/recipes/[id]/route.ts — persistir isFavorite no PUT
```

### 4. Hook

```bash
# Editar web/src/hooks/use-recipes.ts:
# - useRecipes: aceitar parâmetro onlyFavorites e incluir na query key
# - Adicionar useToggleFavorite com otimismo + rollback + debounce
```

### 5. UI

```bash
# Editar web/src/components/recipe-card.tsx — botão de toggle no card
# Editar web/src/app/recipes/[id]/page.tsx — botão de toggle na página de detalhe
# Editar web/src/app/recipes-client.tsx — filtro "Favoritas"
```

### 6. Verificação

```bash
# Dentro de web/
bun run check-types   # deve passar sem erros
bun run lint          # deve passar sem warnings

# Iniciar servidor de desenvolvimento
bun run dev

# Verificar manualmente:
# 1. Favoritar uma receita via card → ícone muda imediatamente
# 2. Recarregar a página → receita permanece favoritada
# 3. Filtrar por "Favoritas" → somente as favoritas aparecem
# 4. Desfavoritar via detalhe → receita some do filtro de favoritas
# 5. Simular erro de rede (DevTools → Network → Offline) → ícone reverte + toast de erro
# 6. Clicar rapidamente múltiplas vezes → apenas uma chamada à API é feita
```

## Artefatos de referência

| Arquivo | Propósito |
|---------|-----------|
| [spec.md](./spec.md) | Requisitos funcionais e cenários de aceite |
| [research.md](./research.md) | Decisões técnicas e justificativas |
| [data-model.md](./data-model.md) | Schema Drizzle e tipos TypeScript |
| [contracts/api.md](./contracts/api.md) | Contratos dos endpoints modificados |
