# Tasks: Favoritar Receita

**Input**: Design documents from `specs/001-favorite-recipe/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api.md ✅ | quickstart.md ✅

**Organization**: Tasks organizadas por user story para permitir implementação e teste independente de cada story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: User story correspondente (US1, US2, US3)
- Cada tarefa inclui caminho exato do arquivo

---

## Phase 1: Setup (Verificação de Ambiente)

**Purpose**: Garantir que o ambiente de desenvolvimento está pronto antes de qualquer modificação

- [X] T001 Verificar que `web/.env.local` existe com `DATABASE_URL` válido e que dependências estão instaladas (`bun install` dentro de `web/`)

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Schema Drizzle + migration + validação Zod — DEVE completar antes de qualquer implementação de hook ou UI

**⚠️ CRÍTICO**: Nenhuma user story pode começar antes desta fase estar completa

- [X] T002 Adicionar campo `isFavorite: boolean('is_favorite').notNull().default(false)` ao pgTable em `web/src/db/schema/recipes.ts`
- [X] T003 Gerar migration executando `bun run db:generate` dentro do diretório `web/`
- [X] T004 Aplicar migration executando `bun run db:migrate` dentro do diretório `web/`
- [X] T005 Adicionar `isFavorite: z.boolean().optional()` ao `updateRecipeSchema` em `web/src/lib/validators.ts`

**Checkpoint**: Schema atualizado, migration aplicada no Neon. O tipo `Recipe` (inferido via `$inferSelect`) passa a incluir automaticamente `isFavorite: boolean`.

---

## Phase 3: User Story 1 - Marcar receita como favorita (Priority: P1) 🎯 MVP

**Goal**: Usuário clica no ícone de coração em qualquer receita (card ou detalhe) e o estado muda imediatamente via atualização otimista — a persistência é confirmada ao recarregar a página.

**Independent Test**: Acessar qualquer receita → clicar no botão de favoritar → ícone muda imediatamente → recarregar a página → receita permanece com ícone favoritado.

### Implementation for User Story 1

- [X] T006 [US1] Atualizar o handler `PUT` em `web/src/app/api/recipes/[id]/route.ts` para incluir `isFavorite` no objeto `set({})` do Drizzle update, lendo do body já validado pelo `updateRecipeSchema`
- [X] T007 [US1] Adicionar função `useToggleFavorite(id: number, currentValue: boolean)` em `web/src/hooks/use-recipes.ts` usando `useMutation` do TanStack Query v5 com: `onMutate` (snapshot do cache + update otimista via `setQueryData`), `onError` (restaura snapshot + exibe toast de erro via Sonner), `onSettled` (invalida queries com prefixo `['recipes']` via `queryClient.invalidateQueries`)
- [X] T008 [P] [US1] Adicionar botão de toggle favorito com ícone `Heart` do `lucide-react` ao canto superior direito do card em `web/src/components/recipe-card.tsx`, implementando debounce local via `useRef` + `clearTimeout`/`setTimeout` e usando `useToggleFavorite`
- [X] T009 [P] [US1] Adicionar botão de toggle favorito com ícone `Heart` do `lucide-react` próximo ao título na página de detalhe em `web/src/app/recipes/[id]/page.tsx`, implementando debounce local via `useRef` + `clearTimeout`/`setTimeout` e usando `useToggleFavorite`

**Checkpoint**: US1 completa — favoritar via card e via página de detalhe deve funcionar com persistência, feedback visual imediato e rollback em caso de erro de rede.

---

## Phase 4: User Story 2 - Remover receita dos favoritos (Priority: P1)

**Goal**: O mesmo botão de toggle da US1 reverte o estado — receita é removida dos favoritos ao segundo clique, com debounce e rollback funcionando corretamente no sentido inverso.

**Independent Test**: Favoritar uma receita → clicar novamente no mesmo botão → ícone retorna ao estado não-favoritado → recarregar → receita aparece como não favoritada.

> **Nota**: US2 é coberta pela implementação de toggle da US1 (mesmo hook, mesmo botão). Esta fase garante a correta invalidação de cache ao desfavoritar — essencial para que a receita suma imediatamente do filtro de favoritas (US3) ao ser desfavoritada.

### Implementation for User Story 2

- [X] T010 [US2] Confirmar que `queryClient.invalidateQueries({ queryKey: ['recipes'] })` em `onSettled` de `useToggleFavorite` em `web/src/hooks/use-recipes.ts` usa prefixo sem predicado adicional, garantindo invalidação de todas as variantes de cache (`['recipes']`, `['recipes', category]`, `['recipes', category, true]`, etc.)
- [X] T011 [P] [US2] Garantir cleanup do debounce no unmount do toggle button em `web/src/components/recipe-card.tsx` — o `clearTimeout` deve ser chamado no retorno do `useEffect` ou equivalente para evitar memory leak e chamadas de API após desmontagem do componente
- [X] T012 [P] [US2] Garantir cleanup do debounce no unmount do toggle button em `web/src/app/recipes/[id]/page.tsx` — mesmo tratamento de cleanup do T011

**Checkpoint**: US1 + US2 completas — toggle bidirecional funciona; cliques rápidos respeitam debounce; falha de rede reverte estado e exibe toast; sem memory leaks.

---

## Phase 5: User Story 3 - Visualizar lista de receitas favoritas (Priority: P2)

**Goal**: Usuário aplica filtro "Favoritas" na listagem e vê apenas as receitas marcadas; ao desfavoritar dentro do filtro, a receita some imediatamente; quando sem favoritas, mensagem vazia é exibida.

**Independent Test**: Favoritar 2+ receitas → aplicar filtro "Favoritas" → somente as favoritas aparecem → desfavoritar uma → some imediatamente → desfavoritar todas → empty state com mensagem aparece.

### Implementation for User Story 3

- [X] T013 [US3] Atualizar handler `GET` em `web/src/app/api/recipes/route.ts` para adicionar filtro `where(eq(recipes.isFavorite, true))` quando query param `favorites=true` estiver presente (combinável com filtro `category` existente via `and()`)
- [X] T014 [US3] Atualizar assinatura e implementação de `useRecipes` em `web/src/hooks/use-recipes.ts` para aceitar segundo parâmetro `onlyFavorites?: boolean`, incluí-lo na query key (`['recipes', category, onlyFavorites]`) e passar `?favorites=true` na URL do fetch quando `onlyFavorites === true`
- [X] T015 [US3] Adicionar botão/toggle "Favoritas" na barra de filtros de `web/src/app/recipes-client.tsx`, gerenciando estado booleano local `onlyFavorites` e passando-o para `useRecipes`
- [X] T016 [US3] Adicionar empty state em `web/src/app/recipes-client.tsx` que exibe mensagem "Nenhuma receita favoritada ainda." quando `data` está vazio e `onlyFavorites === true`

**Checkpoint**: US3 completa — filtro "Favoritas" funciona; desfavoritar dentro do filtro remove a receita imediatamente; empty state exibido quando sem favoritas.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de qualidade e validação manual completa do fluxo ponta a ponta

- [X] T017 [P] Executar `bun run check-types` dentro de `web/` e corrigir todos os erros de TypeScript reportados
- [X] T018 [P] Executar `bun run lint` dentro de `web/` e corrigir todos os warnings ESLint reportados — código da feature está lint-clean. Restam apenas issues pré-existentes fora do escopo: 1 error em `recipe-form.tsx` (criação/edição, fora do escopo) e 2 warnings `<img>` pré-existentes em `page.tsx`/`recipe-card.tsx`.
- [ ] T019 Executar verificação manual completa conforme os 6 cenários de aceite descritos em `specs/001-favorite-recipe/quickstart.md` (favoritar via card, persistência, filtro de favoritas, desfavoritar via detalhe, erro de rede com rollback, cliques rápidos com debounce) — **PENDENTE: requer verificação manual no browser pelo usuário**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: Depende da Phase 1 — **BLOQUEIA todas as user stories**
- **US1 (Phase 3)**: Depende da Phase 2 — pode iniciar após T002–T005 estarem completos
- **US2 (Phase 4)**: Depende de US1 — T010–T012 requerem `useToggleFavorite` (T007) e os botões (T008, T009)
- **US3 (Phase 5)**: Depende da Phase 2 — pode iniciar em paralelo com US1/US2 se houver capacidade de equipe
- **Polish (Phase 6)**: Depende de todas as user stories desejadas estarem completas

### User Story Dependencies

- **US1 (P1)**: Pode iniciar após Foundational — sem dependências de outras stories
- **US2 (P1)**: Depende de US1 (T007, T008, T009) — é a fase de consolidação do toggle
- **US3 (P2)**: Pode iniciar após Foundational — independente de US1/US2 (o cenário de aceite US3.3 depende de US2 estar funcional, mas pode ser validado ao final)

### Within Each User Story

- T002 → T003 → T004 sequencial (schema antes de gerar migration, migration antes de aplicar)
- T005 pode rodar em paralelo com T003/T004 (edita arquivo diferente do schema)
- T007 (hook) deve completar antes de T008 e T009 (componentes consomem o hook)
- T008 e T009 podem rodar em paralelo (arquivos diferentes)
- T011 e T012 podem rodar em paralelo (arquivos diferentes)
- T017 e T018 podem rodar em paralelo (ferramentas independentes)

### Parallel Opportunities

- T008, T009: arquivos diferentes — rodam em paralelo após T007
- T011, T012: arquivos diferentes — rodam em paralelo após T008 e T009
- T017, T018: ferramentas independentes — rodam em paralelo

---

## Parallel Example: User Story 1

```bash
# Após T007 (hook useToggleFavorite) estar completo:
T008: "Adicionar botão favorito em web/src/components/recipe-card.tsx"
T009: "Adicionar botão favorito em web/src/app/recipes/[id]/page.tsx"
# Rodam em paralelo — arquivos diferentes, mesma dependência (T007)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 apenas)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (**CRÍTICO** — bloqueia tudo)
3. Completar Phase 3: User Story 1 (toggle básico)
4. Completar Phase 4: User Story 2 (debounce + cleanup)
5. **PARAR E VALIDAR**: Favoritar/desfavoritar deve funcionar com persistência, rollback e sem memory leaks
6. Deploy/demo se aprovado

### Incremental Delivery

1. Setup + Foundational → Base pronta (schema + migration aplicada)
2. US1 (Phase 3) → Toggle funcionando → Deploy/Demo (**MVP!**)
3. US2 (Phase 4) → Debounce + cleanup completos → Deploy/Demo
4. US3 (Phase 5) → Filtro de favoritas → Deploy/Demo
5. Polish (Phase 6) → Types + lint + validação manual → Pronto para merge

---

## Notes

- [P] = arquivos diferentes, sem dependências entre si — podem rodar em paralelo
- [USn] = qual user story esta task pertence (rastreabilidade)
- Testes automatizados não solicitados — verificação via `check-types` + `lint` + teste manual
- Nunca usar `db:push` em scripts não-interativos — sempre `db:generate` + `db:migrate`
- Commit após cada task ou grupo lógico
- Parar em cada Checkpoint para validar a story de forma independente antes de avançar
