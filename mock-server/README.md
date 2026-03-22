# Qlinica Mock Server

Um servidor API mock para desenvolvimento e testes da app Qlinica antes do backend real estar pronto.

## Instalação

### 1. Instalar json-server globalmente
```bash
npm install -g json-server
```

### 2. Ou instalar como dev dependency (recomendado)
```bash
cd /Users/marcelolopes/qlinica-app
npm install --save-dev json-server
```

## Uso

### Via npm script (recomendado)

Adicionar ao `package.json`:
```json
{
  "scripts": {
    "mock-server": "json-server --watch mock-server/db.json --port 3000"
  }
}
```

Então executar:
```bash
npm run mock-server
```

### Via CLI direto
```bash
json-server --watch mock-server/db.json --port 3000
```

## URL Base
```
http://localhost:3000/api
```

### Nota: O json-server adiciona `/api` automaticamente via rewrites

Para configurar custom routes, criar arquivo `mock-server/routes.json`:
```json
{
  "/api/*": "/$1"
}
```

E executar:
```bash
json-server --watch mock-server/db.json --routes mock-server/routes.json --port 3000
```

## Endpoints Disponíveis

### Autenticação
- `POST /api/auth/login` - Login (simula, não valida)
- `POST /api/auth/register` - Register (simula)
- `POST /api/auth/logout` - Logout (simula)
- `PUT /api/auth/user` - Update user profile

### Serviços
- `GET /api/services` - Listar serviços
- `GET /api/services/:id` - Obter serviço específico

### Terapeutas
- `GET /api/therapists` - Listar terapeutas
- `GET /api/therapists/:id` - Obter terapeuta específico
- `GET /api/therapists/:id/availability` - Obter disponibilidade

### Agendamentos
- `GET /api/bookings` - Listar bookings do user
- `GET /api/bookings/:id` - Obter booking específico
- `POST /api/bookings` - Criar novo booking
- `PUT /api/bookings/:id` - Atualizar booking
- `DELETE /api/bookings/:id` - Cancelar booking

### Pagamentos
- `GET /api/payments` - Listar payments
- `POST /api/payments` - Processar pagamento

### Reviews
- `GET /api/reviews` - Listar reviews
- `POST /api/reviews` - Criar review

## Usando com a App

### 1. Configurar API_BASE_URL

No arquivo `src/config/api.ts` ou `.env`:
```
REACT_APP_API_URL=http://localhost:3000/api
```

### 2. Iniciar Mock Server
```bash
npm run mock-server
```

### 3. Iniciar a App
```bash
npm start
# Depois escolher plataforma (ios/android/web)
```

## Dados Mock

Os dados mock estão em `mock-server/db.json`:

- **4 Terapeutas**: Paulo, Marta, Jorge, Sofia
- **6 Serviços**: Fisioterapia, Osteopatia, Pilates, Massagem, Fala, Nutrição
- **2 Bookings de exemplo**: Para testar listagem
- **1 Payment de exemplo**: Para testar histórico

## Modificar Dados

1. Editar `mock-server/db.json`
2. Salvar (json-server recarrega automaticamente)
3. Fazer refresh na app

### Exemplo: Adicionar novo booking

```json
{
  "id": "booking_3",
  "user_id": "user_123",
  "service_id": 3,
  "therapist_id": 3,
  "date": "2026-03-30",
  "time": "14:00",
  "duration": 60,
  "status": "confirmed",
  "location": "Clínica Centro, Sala 5",
  "notes": "Aula de pilates",
  "price": 55,
  "vat": 12.65,
  "total": 67.65,
  "paid": false,
  "created_at": "2026-03-22T16:00:00Z",
  "updated_at": "2026-03-22T16:00:00Z"
}
```

## Limitações

- **Autenticação simples**: Não valida credenciais reais
- **Sem persistência**: Dados resetam ao reiniciar servidor
- **Sem validações complexas**: Aceita qualquer request válida
- **Sem JWT tokens**: Retorna token mock apenas
- **Sem lógica de negócio**: Só simula endpoints

## Próximos Passos

Quando o backend real estiver pronto:

1. Substituir `REACT_APP_API_URL` na config
2. Remover mock-server
3. Testar com backend real
4. Ajustar API calls conforme necessário

## Troubleshooting

### Porta 3000 já está em uso
```bash
# Usar porta diferente
json-server --watch mock-server/db.json --port 3001
```

### CORS errors
- json-server ativa CORS automaticamente
- Se persisti, configurar headers no axios

### Dados não aparecem
1. Verificar se server está rodando
2. Verificar console da app para erros
3. Confirmar URL da API está correta

## Desenvolvimento

Para adicionar novo endpoint mock:

1. Adicionar dados em `db.json`
2. Reiniciar json-server
3. Endpoint fica disponível automaticamente

Exemplo: Adicionar `discussions` em `db.json`:
```json
{
  "discussions": [
    {"id": 1, "title": "...", "messages": [...]}
  ]
}
```

Pronto! Endpoints disponíveis:
- `GET /api/discussions`
- `GET /api/discussions/1`
- `POST /api/discussions`
- `PUT /api/discussions/1`
- `DELETE /api/discussions/1`

---

**Última atualização**: 2026-03-22
**Versão**: 1.0.0
