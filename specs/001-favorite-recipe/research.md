# Research: Favoritar Receita

**Branch**: `001-favorite-recipe` | **Date**: 2026-05-28

## Decisão 1: Coluna booleana no schema Drizzle

**Decision**: Adicionar `isFavorite: boolean('is_favorite').notNull().default(false)` diretamente na tabela `recipes`.

**Rationale**: A spec e as assumptions confirmam que o favorito pertence à receita (app single-user, sem tabela de usuários). Um campo booleano é o menor acréscimo possível. O `DEFAULT false` garante que todas as receitas existentes recebam o valor correto sem precisar de backfill manual.

**Alternatives considered**:
- Tabela separada de favoritos (recipe_favorites): rejeitada por excesso de complexidade para um app single-user sem necessidade de favoritos por usuário.
- Armazenar lista de IDs em localStorage: rejeitada porque não persiste no banco, quebrando SC-002 (persistência obrigatória).

---

## Decisão 2: Atualização otimista com debounce em TanStack Query v5

**Decision**: Hook `useToggleFavorite` usando `useMutation` do TanStack Query v5 com:
- `onMutate`: aplica a mudança otimista no cache imediatamente antes da requisição.
- `onError`: reverte o cache ao snapshot anterior e exibe toast de erro via Sonner.
- `onSettled`: invalida as queries `['recipes']` para sincronizar com o servidor.
- Debounce: implementado com `useRef` + `clearTimeout`/`setTimeout` no componente, prevenindo múltiplas chamadas à API em cliques rápidos.

**Rationale**: O padrão `onMutate → onError rollback` é o mecanismo oficial do TanStack Query v5 para atualizações otimistas. O debounce é feito no componente (não no hook) para manter o hook reutilizável e sem acoplamento a timing.

**Alternatives considered**:
- Desabilitar botão durante a requisição (otimismo conservador): rejeitado porque a spec (clarificação Q1) escolheu atualização otimista.
- Debounce dentro do hook com `useDeferredValue`: mais complexo, sem vantagem real sobre `useRef` + `setTimeout`.

---

## Decisão 3: Filtro de favoritas na API e no cache

**Decision**: Adicionar parâmetro `?favorites=true` à rota `GET /api/recipes`. No hook `useRecipes`, a query key passa a ser `['recipes', category, onlyFavorites]` onde `onlyFavorites` é `boolean | undefined`.

**Rationale**: Segue o padrão já existente de filtro por `category`. Cache separado por filtro garante que alterar o filtro não invalide cache de outros filtros (Princípio III da Constitution). A API filtra no banco (mais eficiente que filtrar no cliente).

**Alternatives considered**:
- Filtrar apenas no cliente (sem parâmetro na API): rejeitado porque requereria buscar todas as receitas a cada mudança de filtro, ineficiente e inconsistente com o padrão de filtro por categoria.
- Endpoint separado `/api/recipes/favorites`: desnecessário dado que o endpoint existente já suporta query params; criaria duplicação.

---

## Decisão 4: Ponto de entrada do botão de favoritar

**Decision**: Botão de toggle de favorito aparece em dois lugares:
1. No `recipe-card.tsx` (listagem) — ícone coração no canto superior direito do card.
2. Na página de detalhe da receita (`/recipes/[id]`) — botão próximo ao título.

**Rationale**: A spec (FR-001, FR-004, User Stories 1 e 2) exige que o estado seja visível e acionável tanto na listagem quanto no detalhe. Centralizar a lógica no hook `useToggleFavorite` evita duplicação.

**Alternatives considered**:
- Apenas na página de detalhe: rejeitado porque a spec exige visibilidade na listagem (FR-004, User Story 1 cenário 2).
- Componente `FavoriteButton` isolado: útil se a lógica for complexa; para um ícone com onClick + estado, inline no card e no detalhe é suficiente dado o princípio de não criar abstrações antecipadas.
