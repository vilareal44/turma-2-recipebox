# Feature Specification: Favoritar Receita

**Feature Branch**: `001-favorite-recipe`  
**Created**: 2026-05-28  
**Status**: Draft  
**Input**: User description: "preciso implementar a feature de favoritar uma receita"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Marcar receita como favorita (Priority: P1)

O usuário visualiza uma receita e deseja marcá-la como favorita para acessá-la facilmente depois. Ele clica no ícone de coração (ou estrela) na página de detalhes ou no card da receita na listagem, e a receita é adicionada à sua lista de favoritas.

**Why this priority**: É a ação central da feature — sem ela, nada mais funciona. Entrega valor imediato: o usuário consegue salvar uma receita que gosta.

**Independent Test**: Pode ser testado acessando qualquer receita, clicando no botão de favoritar e verificando que o estado visual muda e persiste ao recarregar a página.

**Acceptance Scenarios**:

1. **Given** o usuário está na página de detalhes de uma receita não favoritada, **When** ele clica no botão de favoritar, **Then** o ícone muda para o estado "favoritado" e a receita passa a constar na lista de favoritas.
2. **Given** o usuário está na listagem de receitas, **When** ele clica no botão de favoritar em um card, **Then** o ícone do card muda imediatamente para o estado "favoritado".
3. **Given** o usuário favoritou uma receita, **When** ele recarrega a página, **Then** a receita continua aparecendo como favoritada.

---

### User Story 2 - Remover receita dos favoritos (Priority: P1)

O usuário decide que não quer mais uma receita na sua lista de favoritas e desfavorita-a clicando no mesmo botão.

**Why this priority**: Complemento direto do P1 — a reversibilidade é essencial para que o usuário se sinta no controle.

**Independent Test**: Pode ser testado favoritando uma receita e depois clicando novamente no botão para desfavoritar, verificando que o estado retorna ao normal.

**Acceptance Scenarios**:

1. **Given** o usuário está em uma receita já favoritada, **When** ele clica novamente no botão de favoritar, **Then** o ícone retorna ao estado "não favoritado" e a receita é removida da lista de favoritas.
2. **Given** a receita é desfavoritada na listagem, **When** o usuário navega para outra página e volta, **Then** a receita ainda aparece como não favoritada.

---

### User Story 3 - Visualizar lista de receitas favoritas (Priority: P2)

O usuário quer ver todas as receitas que marcou como favoritas em um único lugar, para escolher o que cozinhar sem precisar procurar entre todas as receitas.

**Why this priority**: Dá utilidade prática à feature de favoritar — sem uma forma de ver os favoritos, o benefício é limitado.

**Independent Test**: Pode ser testado favoritando algumas receitas e verificando que elas aparecem agrupadas ou filtradas quando o usuário acessa a view/filtro de favoritas.

**Acceptance Scenarios**:

1. **Given** o usuário favoritou pelo menos uma receita, **When** ele aplica o filtro "Favoritas" na listagem (ou acessa a seção de favoritas), **Then** somente as receitas favoritadas são exibidas na mesma ordem da listagem geral.
2. **Given** o usuário não favoritou nenhuma receita, **When** ele acessa a lista de favoritas, **Then** uma mensagem vazia é exibida indicando que não há receitas favoritas ainda.
3. **Given** o usuário está na lista de favoritas, **When** ele desfavorita uma receita, **Then** essa receita some imediatamente da lista.

---

### Edge Cases

- **Cliques rápidos**: O sistema aplica debounce — o ícone responde visualmente de imediato, mas a API só é chamada após pausa sem novos cliques; múltiplos cliques não geram chamadas empilhadas.
- **Erro de rede**: O sistema usa atualização otimista — o ícone muda imediatamente; se a API falhar, o estado reverte e um toast de erro é exibido.
- O que acontece quando todas as receitas favoritadas são removidas da lista de favoritas?

## Clarifications

### Session 2026-05-28

- Q: Como o sistema se comporta se a requisição de favoritar falhar (erro de rede)? → A: Atualização otimista — o ícone muda imediatamente no clique; se a API falhar, o estado reverte ao valor anterior e um toast de erro é exibido ao usuário.
- Q: Como o sistema lida com cliques rápidos e repetidos no botão de favoritar? → A: Debounce — o ícone muda visualmente no primeiro clique, mas a requisição à API só é disparada após uma pausa sem novos cliques; cliques adicionais apenas alternam o estado visual local.
- Q: Em que ordem as receitas favoritas aparecem na lista? → A: Mesma ordenação da listagem geral (padrão do app, ex: mais recentes primeiro), sem lógica adicional de ordenação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir que o usuário marque qualquer receita como favorita.
- **FR-002**: O sistema DEVE permitir que o usuário remova uma receita dos favoritos.
- **FR-003**: O sistema DEVE persistir o estado de favorito de cada receita entre sessões (recarregamento da página).
- **FR-004**: O sistema DEVE exibir visualmente o estado de favorito (favoritado/não favoritado) no card da listagem e na página de detalhes de cada receita.
- **FR-005**: O sistema DEVE disponibilizar uma forma de filtrar/visualizar somente as receitas favoritadas.
- **FR-006**: O estado de favorito DEVE ser atualizado de forma imediata na interface, sem necessidade de recarregar a página.
- **FR-007**: O sistema DEVE exibir uma mensagem adequada quando a lista de favoritas estiver vazia.
- **FR-008**: O sistema DEVE aplicar debounce no botão de favoritar: o estado visual muda imediatamente, mas a requisição à API só é disparada após pausa sem novos cliques, evitando chamadas empilhadas.
- **FR-009**: Em caso de falha na API ao favoritar/desfavoritar, o sistema DEVE reverter o estado visual ao valor anterior e exibir uma notificação de erro ao usuário.

### Key Entities

- **Receita**: Entidade existente. Ganha um novo atributo booleano indicando se está ou não nos favoritos do usuário.
- **Favorito**: Representa o vínculo entre usuário e receita favoritada. Como o app é de usuário único, pode ser representado como um campo direto na receita ou em uma estrutura auxiliar separada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue favoritar ou desfavoritar uma receita em menos de 2 segundos (da ação ao feedback visual).
- **SC-002**: O estado de favorito persiste corretamente em 100% dos casos após recarregar a página.
- **SC-003**: A lista de receitas favoritas exibe apenas as receitas marcadas, sem falsos positivos ou ausências.
- **SC-004**: Nenhuma ação dupla ou clique rápido gera estado inconsistente (ex: receita favoritada e desfavoritada ao mesmo tempo).

## Assumptions

- O app é de usuário único — não há conceito de "favoritos por conta/perfil", o estado é global para a aplicação.
- O campo de favorito é armazenado junto à receita no banco de dados existente, sem necessidade de tabela separada de favoritos.
- A interface de listagem já existente será aproveitada para exibir o filtro de favoritas, sem criar uma página separada.
- A lista de favoritas segue a mesma ordenação da listagem geral (sem lógica de ordenação adicional).
- Não há requisito de exportação ou compartilhamento da lista de favoritas.
- A feature abrange apenas receitas já cadastradas — não há impacto no fluxo de criação/edição de receitas.
