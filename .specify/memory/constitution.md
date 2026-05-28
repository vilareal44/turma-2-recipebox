<!--
## Sync Impact Report

**Version change**: (template placeholder) → 1.0.0
**Bump type**: MINOR — primeira versão concreta, substituição completa dos placeholders

### Princípios definidos (novos)
- I. Entidade Única e Escopo Mínimo
- II. API como Dona da Serialização
- III. Cache via TanStack Query
- IV. Segurança de Tipos (Zod + TypeScript)
- V. Simplicidade de UI com Base UI / shadcn

### Seções adicionadas
- Stack & Ambiente
- Fluxo de Desenvolvimento

### Seções removidas
- Nenhuma (template completo preenchido)

### Templates verificados
- ✅ `.specify/templates/plan-template.md` — Constitution Check alinhado com princípios
- ✅ `.specify/templates/spec-template.md` — sem referências incompatíveis
- ✅ `.specify/templates/tasks-template.md` — caminhos e fases compatíveis com arquitetura `web/`
- ✅ `CLAUDE.md` — fonte primária de contexto técnico; constituição está consistente

### Deferred TODOs
- Nenhum
-->

# RecipeBox Constitution

## Core Principles

### I. Entidade Única e Escopo Mínimo

O app gerencia **uma única entidade** (`Recipe`). Toda feature DEVE derivar diretamente desta entidade.
Funcionalidades fora do PRD (autenticação, busca textual, favoritos, avaliações, múltiplos usuários,
categorias customizadas, nutrição, escalonamento de porções) DEVEM ser recusadas sem exceção.
Complexidade adicionada DEVE ser justificada com referência explícita a um requisito do PRD.
Abstrações antecipadas (YAGNI) são proibidas — três linhas similares são melhores que uma
abstração prematura.

**Rationale**: app de uso pessoal, usuário único, sem autenticação. Escopo mínimo garante
entrega rápida e manutenção trivial.

### II. API como Dona da Serialização

Os handlers de API (`web/src/app/api/`) são os únicos responsáveis por `JSON.parse` e
`JSON.stringify` dos campos array (`ingredients`, `instructions`). Hooks e componentes DEVEM
receber e enviar arrays JS, nunca strings JSON. A coerção de `imageUrl`: string vazia (`""`) DEVE
ser convertida para `null` antes de persistir no banco — exclusivamente na camada de API.

**Rationale**: evita duplicação de lógica de serialização espalhada pelo codebase, tornando
contratos da API previsíveis e o banco de dados internamente consistente.

### III. Cache via TanStack Query

Todo data fetching do cliente DEVE passar pelos hooks de TanStack Query definidos em
`web/src/hooks/use-recipes.ts`. Chamadas `fetch` diretas em componentes são proibidas.
Cache keys DEVEM incluir todos os parâmetros de filtro (ex.: `['recipes', category]`) para
garantir invalidação correta por filtro. O cliente TanStack Query é centralizado em
`web/src/lib/query-client.ts`.

**Rationale**: cache consistente, invalidação previsível e separação entre camada de dados
e camada de apresentação sem boilerplate.

### IV. Segurança de Tipos (Zod + TypeScript)

Toda entrada de API DEVE ser validada com Zod v4 (`web/src/lib/validators.ts`) no boundary
da requisição. Tipos TypeScript derivam do schema Drizzle (`web/src/db/schema/recipes.ts`) ou
de schemas Zod — nunca definidos manualmente de forma duplicada. O tipo `any` é proibido.
O comando `bun run check-types` DEVE passar sem erros antes de qualquer PR.

**Rationale**: erros de tipagem em tempo de execução são eliminados na compilação; Zod garante
que dados inválidos jamais chegam ao banco de dados.

### V. Simplicidade de UI com Base UI / shadcn

Primitivos de UI DEVEM usar `@base-ui/react` (não Radix). Renderização polimórfica usa a prop
`render`, nunca `asChild`: `<Button render={<Link href="/" />}>label</Button>`.
Componentes shadcn/ui (style: base-nova) ficam exclusivamente em `web/src/components/ui/`.
Não se criam componentes UI customizados quando um shadcn já atende. Feedback ao usuário
(criar/editar/excluir) DEVE usar Sonner toast.

**Rationale**: API de `@base-ui/react` difere de Radix; misturar padrões gera bugs silenciosos.
Padronização em shadcn reduz superfície de UI para manter.

## Stack & Ambiente

- **Runtime/Package manager**: Bun
- **Framework**: Next.js 16 (App Router, Turbopack) — ler `node_modules/next/dist/docs/` antes
  de introduzir padrões novos; breaking changes desta versão DEVEM ser verificados.
- **ORM**: Drizzle ORM com driver HTTP Neon (`@neondatabase/serverless`)
- **Banco**: Neon PostgreSQL — `DATABASE_URL` em `web/.env.local`
- **Migrations**: sempre `db:generate` + `db:migrate`; `db:push` é proibido em automação
  (requer TTY interativo).
- **Validação**: Zod v4
- **Data fetching**: TanStack Query v5
- **Toasts**: Sonner
- Todo código-fonte fica em `web/`.

## Fluxo de Desenvolvimento

Antes de qualquer PR ou commit de feature:

1. `bun run check-types` — DEVE passar sem erros.
2. `bun run lint` — DEVE passar sem warnings não suprimidos.
3. Verificação manual da golden path no browser (`bun run dev`).
4. Mudanças de schema DEVEM ser acompanhadas de migration gerada (`db:generate` + `db:migrate`).
5. Todo PR DEVE incluir um **Constitution Check** explícito no plano confirmando conformidade
   com os cinco princípios acima.

Complexity tracking: se um PR introduz violação justificada, a justificativa DEVE ser
documentada na tabela de "Complexity Tracking" do `plan.md` correspondente.

## Governance

Esta constituição tem precedência sobre qualquer outra prática de desenvolvimento. Emendas exigem:

1. Atualização de `.specify/memory/constitution.md` com bump de versão semântica.
2. Atualização de `CLAUDE.md` se a mudança afeta convenções documentadas lá.
3. Revisão dos templates em `.specify/templates/` para consistência.

Toda revisão de PR DEVE verificar conformidade com os princípios. Complexidade adicionada
DEVE ser justificada explicitamente — o ônus da prova é de quem adiciona, não de quem questiona.

**Versioning policy**:
- MAJOR: remoção ou redefinição incompatível de princípio.
- MINOR: novo princípio ou seção adicionada.
- PATCH: clarificações, correções de redação.

**Version**: 1.0.0 | **Ratified**: 2026-05-28 | **Last Amended**: 2026-05-28
