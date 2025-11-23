# TOON Converter API

Uma API simples e rápida para converter JSON para TOON format e vice-versa.

## O que é TOON?

TOON (Token-Oriented Object Notation) é um formato compacto e legível que reduz tokens em até 60% comparado com JSON, mantendo a mesma informação.

## Features

- ✅ Converter JSON → TOON
- ✅ Converter TOON → JSON
- ✅ Suporte a batch (múltiplos itens)
- ✅ Opções avançadas (delimiters, key folding)
- ✅ Health check integrado
- ✅ CORS habilitado
- ✅ Docker ready

## Quick Start

### Localmente

```bash
npm install
npm start
```

A API rodará em `http://localhost:3000`

### Com Docker

```bash
docker compose up -d
```

## Endpoints

### 1. Converter JSON para TOON
```bash
POST /encode
Content-Type: application/json

{
  "data": {
    "users": [
      { "id": 1, "name": "Alice" },
      { "id": 2, "name": "Bob" }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "toon": "users[2]{id,name}:\n1,Alice\n2,Bob",
  "originalSize": 82,
  "toonSize": 42,
  "savings": "48.8%"
}
```

### 2. Converter TOON para JSON
```bash
POST /decode
Content-Type: application/json

{
  "toon": "users[2]{id,name}:\n1,Alice\n2,Bob"
}
```

### 3. Encode com opções avançadas
```bash
POST /encode-advanced
Content-Type: application/json

{
  "data": { "items": [{ "id": 1, "name": "Test" }] },
  "delimiter": "\t",
  "keyFolding": "off",
  "indent": 2
}
```

**Delimiters:**
- `","` (padrão - comma)
- `"\t"` (tab - mais eficiente em tokens)
- `"|"` (pipe)

### 4. Converter múltiplos itens
```bash
POST /encode-batch
Content-Type: application/json

{
  "items": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
```

### 5. Health Check
```bash
GET /health
```

## Variáveis de Ambiente

- `PORT` - Porta da API (padrão: 3000)
- `NODE_ENV` - production ou development

## Deploy no Portainer

1. Crie um novo Stack no Portainer
2. Escolha "Repository"
3. Preencha:
   - Repository URL: `https://github.com/seu-usuario/toon-api.git`
   - Repository reference: `main`
   - Compose path: `docker-compose.yml`
4. Clique em Deploy

## Estrutura do Projeto

```
toon-api/
├── index.js                 # Aplicação principal
├── package.json             # Dependências
├── Dockerfile               # Build Docker
├── docker-compose.yml       # Compose para Portainer
├── .dockerignore            # Arquivos ignorados no Docker
└── README.md                # Este arquivo
```

## Dependências

- express: ^4.18.2
- cors: ^2.8.5
- @toon-format/toon: ^2.0.0

## Exemplos de Uso

### JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:3000/encode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: { users: [{ id: 1, name: 'Alice' }] }
  })
});
const result = await response.json();
console.log(result.toon);
```

### cURL

```bash
curl -X POST http://localhost:3000/encode \
  -H "Content-Type: application/json" \
  -d '{"data":{"users":[{"id":1,"name":"Alice"}]}}'
```

## License

MIT

## Documentação

- [TOON Format Specification](https://github.com/toon-format/spec)
- [TOON SDK](https://github.com/toon-format/toon)