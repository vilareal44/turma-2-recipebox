# API Contracts: Favoritar Receita

**Branch**: `001-favorite-recipe` | **Date**: 2026-05-28

## Endpoints modificados

### GET /api/recipes

**Parâmetro novo**: `favorites` (opcional)

| Parâmetro | Tipo | Valores | Comportamento |
|-----------|------|---------|---------------|
| `favorites` | query string | `"true"` | Retorna apenas receitas com `isFavorite = true` |
| `favorites` | query string | ausente ou outro valor | Retorna todas as receitas (comportamento atual) |

O parâmetro `favorites` é combinável com o parâmetro `category` existente.

**Exemplos**:
```
GET /api/recipes                        → todas as receitas
GET /api/recipes?favorites=true         → somente favoritas
GET /api/recipes?category=Sobremesas    → receitas da categoria (inalterado)
```

**Response**: sem alteração na forma — retorna `Recipe[]` com o campo `isFavorite` agora presente em cada item.

---

### PUT /api/recipes/[id]

**Corpo da requisição**: aceita agora o campo `isFavorite` como opcional.

```json
// Exemplo: toggle para favoritado
{
  "isFavorite": true
}

// Exemplo: toggle para desfavoritado
{
  "isFavorite": false
}
```

Este endpoint já existe. A mudança é mínima: `isFavorite` é adicionado ao schema de validação Zod e persistido via Drizzle `update`. Os outros campos continuam opcionais como antes.

**Response** (sem alteração na forma):
```json
{
  "id": 1,
  "title": "Bolo de Cenoura",
  "isFavorite": true,
  ...
}
```

---

## Campos adicionados às responses existentes

Todas as rotas que retornam `Recipe` ou `Recipe[]` passarão a incluir `isFavorite: boolean` automaticamente após a migration — pois o campo é inferido do schema Drizzle.

| Rota | Antes | Depois |
|------|-------|--------|
| `GET /api/recipes` | sem `isFavorite` | com `isFavorite: boolean` |
| `GET /api/recipes/[id]` | sem `isFavorite` | com `isFavorite: boolean` |
| `PUT /api/recipes/[id]` | sem `isFavorite` | com `isFavorite: boolean` |

---

## Sem novos endpoints

Nenhum endpoint novo é criado. O toggle de favorito usa o `PUT /api/recipes/[id]` existente, consistente com a arquitetura atual.
