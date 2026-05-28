# PRD — RecipeBox


## 1. Objetivo de Negócio

Permitir que uma pessoa **gerencie suas receitas de cozinha** em um só lugar: cadastrar, consultar, editar e excluir receitas, com filtro por categoria. App de uso pessoal, sem autenticação e sem múltiplos usuários.

**Métrica de sucesso:** usuário consegue cadastrar uma receita e reencontrá-la depois pela listagem/filtro, sem fricção.

## 2. Escopo

App full-stack com:
- **backend** — CRUD de receitas + filtro por categoria.
- **frontend** — listar, criar, ver detalhe e editar receitas.

Sem login, sem favoritos, sem busca textual, sem avaliações, sem múltiplos usuários. (Ver seção 7.)

## 3. Modelo de Dados

Entidade única: **Recipe**.

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `id` | number | auto | PK auto-incremento |
| `title` | string | sim | 1–200 chars |
| `description` | string | sim | 1–1000 chars |
| `category` | enum | sim | um de: `breakfast`, `lunch`, `dinner`, `dessert`, `snack` |
| `prepTime` | number (min) | sim | inteiro, 0–1440 |
| `cookTime` | number (min) | sim | inteiro, 0–1440 |
| `servings` | number | sim | inteiro, 1–100 |
| `ingredients` | string[] | sim | ao menos 1 item; cada item não-vazio |
| `instructions` | string[] | sim | ao menos 1 item; cada item não-vazio |
| `imageUrl` | string \| null | não | URL válida; string vazia vira `null` |
| `createdAt` | timestamp | auto | preenchido na criação |
| `updatedAt` | timestamp | auto | atualizado em cada edição |

Notas de persistência:
- `ingredients` e `instructions` são guardados como **JSON stringificado** em colunas de texto, serializados/desserializados na camada de serviço.
- `imageUrl` vazio (`""`) deve ser convertido para `null` antes de salvar.

## 4. API REST

Base: `/recipes`. Validação de entrada em todos os endpoints de escrita.

| Método | Rota | Query/Path | Body | Resposta | Status |
|--------|------|-----------|------|----------|--------|
| GET | `/recipes` | `?category=` (opcional) | — | `Recipe[]` | 200 |
| GET | `/recipes/:id` | `id` | — | `Recipe` | 200 / 404 |
| POST | `/recipes` | — | campos de criação (seção 3, sem `id`/timestamps) | `Recipe` | 201 |
| PUT | `/recipes/:id` | `id` | qualquer subconjunto dos campos (todos opcionais) | `Recipe` | 200 / 404 |
| DELETE | `/recipes/:id` | `id` | — | `{ success: boolean }` | 200 / 404 |

Comportamento:
- `GET /recipes?category=dinner` retorna só as receitas com `category` igual ao valor.
- `GET /recipes` sem query retorna todas.
- 404 quando o `id` não existe (GET/:id, PUT, DELETE), com mensagem `Recipe with ID {id} not found`.
- CORS liberado para a origem do front.

## 5. Web — Telas

| Rota | Tela | O que faz |
|------|------|-----------|
| `/` | Home / Listagem | Grid de cards de receita. Botões de filtro: All, Breakfast, Lunch, Dinner, Dessert, Snack. Estados de loading e vazio. |
| `/recipes/new` | Criar | Formulário de cadastro. Em sucesso, redireciona e mostra toast. |
| `/recipes/:id` | Detalhe | Mostra título, descrição, badge de categoria, prepTime/cookTime, servings, lista de ingredientes, instruções numeradas, imagem (se houver). Botões Editar e Excluir. |
| `/recipes/:id/edit` | Editar | Mesmo formulário do create, pré-preenchido. |

Requisitos de UX:
- Card mostra imagem (ou placeholder), título e descrição curta.
- Formulário de receita é compartilhado entre criar e editar; permite adicionar/remover linhas de ingredientes e de instruções.
- Feedback de ações (criar/editar/excluir) via toast.
- Excluir deve confirmar antes de apagar.


## 7. Fora de escopo (não implementar)

Autenticação/contas, busca textual, ordenação, favoritos, avaliações/comentários, tags de dieta, nutrição, lista de compras, escalonamento de porções, categorias customizadas.

## 8. Critérios de Aceite

- [ ] É possível criar uma receita válida e ela aparece na listagem.
- [ ] Campos inválidos (ex.: título vazio, categoria fora do enum, sem ingredientes) são rejeitados pela API.
- [ ] Filtro por categoria na Home retorna apenas as receitas da categoria.
- [ ] Tela de detalhe mostra todos os campos corretamente.
- [ ] Editar uma receita persiste as mudanças e atualiza `updatedAt`.
- [ ] Excluir remove a receita da listagem.
- [ ] `imageUrl` vazio é salvo como `null` e o card mostra placeholder.
- [ ] Acessar um `id` inexistente retorna 404 na API.
