# Qlinica Backend API Specification

## Base URL
```
http://localhost:3000/api
```

## Autenticação
Todas as requisições (exceto auth) requerem:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Authentication Endpoints

### POST /auth/login
Fazer login com email e password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "João Silva",
    "phone": "+351912345678",
    "avatar": "https://...",
    "preferences": {
      "notifications": true,
      "language": "pt",
      "theme": "dark"
    }
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### POST /auth/register
Registar novo utilizador.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "name": "Maria Santos"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_456",
    "email": "newuser@example.com",
    "name": "Maria Santos",
    "phone": null,
    "avatar": null,
    "preferences": {
      "notifications": true,
      "language": "pt",
      "theme": "dark"
    }
  }
}
```

---

### POST /auth/logout
Logout do utilizador.

**Request:**
```json
{}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### PUT /auth/user
Atualizar dados do utilizador.

**Request:**
```json
{
  "name": "João da Silva",
  "phone": "+351912345678",
  "avatar": "https://...",
  "preferences": {
    "notifications": true,
    "language": "pt",
    "theme": "light"
  }
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "João da Silva",
    "phone": "+351912345678",
    "avatar": "https://...",
    "preferences": {
      "notifications": true,
      "language": "pt",
      "theme": "light"
    }
  }
}
```

---

### POST /auth/password-reset
Solicitar reset de password.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

---

## 2. Services Endpoints

### GET /services
Obter lista de serviços disponíveis.

**Query Params:**
- `?category=fisioterapia` (opcional)
- `?limit=10&offset=0` (paginação)

**Response (200):**
```json
{
  "data": [
    {
      "id": "service_1",
      "name": "Fisioterapia",
      "description": "Tratamento de lesões e reabilitação",
      "price": 60,
      "duration": 60,
      "category": "fisioterapia",
      "icon": "https://...",
      "rating": 4.8,
      "reviews_count": 45,
      "available": true
    },
    {
      "id": "service_2",
      "name": "Osteopatia",
      "description": "Alinhamento estrutural do corpo",
      "price": 70,
      "duration": 45,
      "category": "osteopatia",
      "icon": "https://...",
      "rating": 4.9,
      "reviews_count": 32,
      "available": true
    }
  ],
  "total": 6
}
```

---

### GET /services/:id
Obter detalhes de um serviço.

**Response (200):**
```json
{
  "id": "service_1",
  "name": "Fisioterapia",
  "description": "Tratamento de lesões e reabilitação",
  "price": 60,
  "duration": 60,
  "category": "fisioterapia",
  "icon": "https://...",
  "rating": 4.8,
  "reviews_count": 45,
  "available": true,
  "details": "Serviço completo de fisioterapia..."
}
```

---

## 3. Therapists Endpoints

### GET /therapists
Obter lista de terapeutas.

**Query Params:**
- `?service_id=service_1` (filtrar por serviço)
- `?available=true` (apenas disponíveis)

**Response (200):**
```json
{
  "data": [
    {
      "id": "therapist_1",
      "name": "Dr. Paulo Silva",
      "specialty": "Fisioterapia",
      "avatar": "https://...",
      "rating": 4.9,
      "reviews_count": 78,
      "bio": "Especialista em reabilitação desportiva...",
      "available": true,
      "phone": "+351912345678",
      "experience_years": 8,
      "services": ["service_1", "service_3"],
      "availability": {
        "monday": ["09:00-10:00", "10:00-11:00", "14:00-15:00"],
        "tuesday": ["09:00-10:00", "10:00-11:00", "14:00-15:00"],
        "wednesday": ["09:00-10:00", "10:00-11:00", "14:00-15:00"],
        "thursday": ["09:00-10:00", "10:00-11:00", "14:00-15:00"],
        "friday": ["09:00-10:00", "10:00-11:00", "14:00-15:00"],
        "saturday": [],
        "sunday": []
      }
    }
  ],
  "total": 4
}
```

---

### GET /therapists/:id
Obter detalhes de um terapeuta.

**Response (200):**
```json
{
  "id": "therapist_1",
  "name": "Dr. Paulo Silva",
  "specialty": "Fisioterapia",
  "avatar": "https://...",
  "rating": 4.9,
  "reviews_count": 78,
  "bio": "Especialista em reabilitação desportiva",
  "available": true,
  "phone": "+351912345678",
  "email": "paulo@clinica.pt",
  "experience_years": 8,
  "languages": ["Português", "Inglês"],
  "certifications": ["Fisioterapia", "Reabilitação Desportiva"],
  "services": ["service_1", "service_3"],
  "availability": {...},
  "reviews": [...]
}
```

---

### GET /therapists/:id/availability
Obter disponibilidade em tempo real de um terapeuta.

**Query Params:**
- `?date=2026-03-25` (data específica)
- `?month=2026-03` (mês específico)

**Response (200):**
```json
{
  "therapist_id": "therapist_1",
  "available_slots": [
    {
      "date": "2026-03-25",
      "time": "09:00",
      "duration": 60,
      "available": true
    },
    {
      "date": "2026-03-25",
      "time": "10:00",
      "duration": 60,
      "available": true
    }
  ]
}
```

---

## 4. Bookings Endpoints

### GET /bookings
Obter bookings do utilizador autenticado.

**Query Params:**
- `?status=upcoming|past|cancelled` (filtrar)
- `?limit=10&offset=0` (paginação)

**Response (200):**
```json
{
  "data": [
    {
      "id": "booking_123",
      "service": {
        "id": "service_1",
        "name": "Fisioterapia"
      },
      "therapist": {
        "id": "therapist_1",
        "name": "Dr. Paulo Silva"
      },
      "date": "2026-03-25",
      "time": "10:00",
      "duration": 60,
      "status": "confirmed",
      "location": "Clínica Centro, Sala 3",
      "notes": "Lesão no ombro",
      "price": 60,
      "paid": false,
      "cancelled_at": null,
      "created_at": "2026-03-22T15:30:00Z",
      "updated_at": "2026-03-22T15:30:00Z"
    }
  ],
  "total": 5
}
```

---

### GET /bookings/:id
Obter detalhes de um booking específico.

**Response (200):**
```json
{
  "id": "booking_123",
  "service": {
    "id": "service_1",
    "name": "Fisioterapia",
    "description": "Tratamento de lesões",
    "price": 60,
    "duration": 60
  },
  "therapist": {
    "id": "therapist_1",
    "name": "Dr. Paulo Silva",
    "avatar": "https://...",
    "phone": "+351912345678"
  },
  "date": "2026-03-25",
  "time": "10:00",
  "duration": 60,
  "status": "confirmed",
  "location": "Clínica Centro, Sala 3",
  "notes": "Lesão no ombro",
  "price": 60,
  "vat": 13.8,
  "total": 73.8,
  "paid": false,
  "payment_method": null,
  "cancelled_at": null,
  "created_at": "2026-03-22T15:30:00Z",
  "updated_at": "2026-03-22T15:30:00Z"
}
```

---

### POST /bookings
Criar novo booking.

**Request:**
```json
{
  "service_id": "service_1",
  "therapist_id": "therapist_1",
  "date": "2026-03-25",
  "time": "10:00",
  "notes": "Lesão no ombro"
}
```

**Response (201):**
```json
{
  "id": "booking_124",
  "service": {...},
  "therapist": {...},
  "date": "2026-03-25",
  "time": "10:00",
  "duration": 60,
  "status": "pending",
  "notes": "Lesão no ombro",
  "price": 60,
  "vat": 13.8,
  "total": 73.8,
  "paid": false,
  "created_at": "2026-03-22T15:30:00Z"
}
```

---

### PUT /bookings/:id
Atualizar um booking existente.

**Request:**
```json
{
  "date": "2026-03-26",
  "time": "14:00",
  "notes": "Lesão no ombro (piorou)"
}
```

**Response (200):**
```json
{
  "id": "booking_123",
  "service": {...},
  "therapist": {...},
  "date": "2026-03-26",
  "time": "14:00",
  "duration": 60,
  "status": "confirmed",
  "notes": "Lesão no ombro (piorou)",
  "updated_at": "2026-03-22T16:00:00Z"
}
```

---

### DELETE /bookings/:id
Cancelar um booking.

**Query Params:**
- `?reason=change_mind` (motivo de cancelamento)

**Response (200):**
```json
{
  "id": "booking_123",
  "status": "cancelled",
  "cancelled_at": "2026-03-22T16:05:00Z",
  "message": "Booking cancelled successfully"
}
```

---

## 5. Payments Endpoints

### POST /payments
Processar pagamento de um booking.

**Request:**
```json
{
  "booking_id": "booking_123",
  "payment_method": "card",
  "card": {
    "number": "4242424242424242",
    "exp_month": 12,
    "exp_year": 2027,
    "cvc": "314"
  }
}
```

**Response (200):**
```json
{
  "id": "payment_123",
  "booking_id": "booking_123",
  "amount": 73.8,
  "currency": "EUR",
  "status": "succeeded",
  "payment_method": "card",
  "transaction_id": "stripe_txn_123",
  "created_at": "2026-03-22T16:10:00Z"
}
```

---

### GET /payments
Obter histórico de pagamentos do utilizador.

**Response (200):**
```json
{
  "data": [
    {
      "id": "payment_123",
      "booking_id": "booking_123",
      "amount": 73.8,
      "currency": "EUR",
      "status": "succeeded",
      "payment_method": "card",
      "date": "2026-03-22T16:10:00Z"
    }
  ],
  "total": 3
}
```

---

## 6. Reviews Endpoints

### POST /reviews
Deixar review de um booking.

**Request:**
```json
{
  "booking_id": "booking_123",
  "rating": 5,
  "comment": "Excelente serviço! Recomendo."
}
```

**Response (201):**
```json
{
  "id": "review_456",
  "booking_id": "booking_123",
  "therapist_id": "therapist_1",
  "service_id": "service_1",
  "rating": 5,
  "comment": "Excelente serviço! Recomendo.",
  "created_at": "2026-03-22T16:15:00Z"
}
```

---

### GET /therapists/:id/reviews
Obter reviews de um terapeuta.

**Response (200):**
```json
{
  "data": [
    {
      "id": "review_456",
      "user_name": "João Silva",
      "rating": 5,
      "comment": "Excelente serviço! Recomendo.",
      "date": "2026-03-22T16:15:00Z"
    }
  ],
  "average_rating": 4.8,
  "total_reviews": 78
}
```

---

## 7. Notifications Endpoints

### POST /notifications/subscribe
Subscrever a push notifications.

**Request:**
```json
{
  "device_token": "ExponentPushToken[...]"
}
```

**Response (200):**
```json
{
  "message": "Device subscribed to notifications"
}
```

---

### POST /notifications/send
Enviar notificação (admin/scheduler apenas).

**Request:**
```json
{
  "user_id": "user_123",
  "title": "Consulta em 1 hora",
  "body": "Sua consulta com Dr. Paulo Silva começa em 1 hora",
  "data": {
    "booking_id": "booking_123"
  }
}
```

**Response (200):**
```json
{
  "message": "Notification sent",
  "notification_id": "notif_789"
}
```

---

## Error Handling

Todos os erros seguem este formato:

```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "status": 400
}
```

### Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

- **Limite**: 100 requisições por minuto por IP
- **Headers de resposta**:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 87
  - `X-RateLimit-Reset`: 1645555200

---

## Mock Server Setup (para testes)

```bash
# Usar json-server para mock API rápido
npm install -g json-server

# Criar db.json com estrutura esperada
json-server --watch db.json --port 3000
```

---

**Última atualização**: 2026-03-22
**Versão**: 1.0.0
