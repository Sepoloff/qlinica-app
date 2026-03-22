# Qlinica - Backend Integration Guide

Guia passo-a-passo para integrar o backend real com a app Qlinica.

## 📋 Checklist de Pré-requisitos

- [ ] Backend Node.js/Express criado (ou use Firebase)
- [ ] Endpoints implementados segundo `BACKEND_API_SPEC.md`
- [ ] Database configurado (MongoDB, PostgreSQL, etc)
- [ ] JWT authentication implementado
- [ ] CORS configurado para aceitar requests da app

---

## 🚀 Fase 1: Configuração da API

### 1.1 Definir URL do Backend

**Arquivo:** `src/config/api.ts`

```typescript
// Atualizar base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.qlinica.com/api';
```

**Arquivo:** `.env` ou `.env.local`

```
REACT_APP_API_URL=https://api.qlinica.com/api
```

### 1.2 Testar Conexão

Depois de atualizar a URL, testar num componente:

```typescript
import { api } from '../config/api';

// Test endpoint
const response = await api.get('/services');
console.log('API connection test:', response.data);
```

### 1.3 CORS Configuration

Se o backend é separado, garantir CORS está habilitado:

```javascript
// Backend (Express)
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:19006',     // Expo web
    'http://localhost:3000',      // Expo CLI
    'https://qlinica.app'         // Production domain
  ],
  credentials: true
}));
```

---

## 🔐 Fase 2: Autenticação

### 2.1 Implementar Login Backend

O `AuthContext` já está pronto. Apenas garantir que os endpoints retornam:

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "phone": "+351912345678",
    "avatar": "https://...",
    "preferences": { ... }
  }
}
```

### 2.2 Implementar Register Backend

Request esperado:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "User Name"
}
```

Response esperado:
```json
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

### 2.3 Testar Autenticação

```bash
# Usar a app para fazer login
# Ou testar via curl:

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123"}'
```

---

## 📊 Fase 3: Serviços e Dados

### 3.1 Implementar GET /services

```javascript
// Backend
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find({ available: true });
    res.json({ data: services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Frontend já chama via `bookingService.getServices()`.

### 3.2 Implementar GET /therapists

```javascript
// Backend
app.get('/api/therapists', async (req, res) => {
  try {
    const therapists = await Therapist.find();
    res.json({ data: therapists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3.3 Implementar GET /therapists/:id/availability

```javascript
// Backend
app.get('/api/therapists/:id/availability', async (req, res) => {
  try {
    const { date } = req.query;
    const therapist = await Therapist.findById(req.params.id);
    
    // Get booked slots for date
    const bookings = await Booking.find({
      therapist_id: req.params.id,
      date: date,
      status: { $ne: 'cancelled' }
    });
    
    // Calculate available slots (9:00 - 17:00, 60 min slots)
    const allSlots = [];
    for (let h = 9; h < 17; h++) {
      allSlots.push(`${h.toString().padStart(2, '0')}:00`);
    }
    
    const bookedTimes = bookings.map(b => b.time);
    const available_slots = allSlots
      .filter(time => !bookedTimes.includes(time))
      .map(time => ({ date, time, available: true }));
    
    res.json({ available_slots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📅 Fase 4: Agendamentos (Bookings)

### 4.1 Implementar GET /bookings

```javascript
// Backend - Requires authentication
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    
    let query = { user_id: userId };
    if (status) query.status = status;
    
    const bookings = await Booking.find(query)
      .populate('service_id')
      .populate('therapist_id')
      .sort({ date: -1 });
    
    res.json({ data: bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4.2 Implementar POST /bookings

```javascript
// Backend - Create new booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { service_id, therapist_id, date, time, notes } = req.body;
    
    // Validate
    if (!service_id || !therapist_id || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check availability
    const existingBooking = await Booking.findOne({
      therapist_id,
      date,
      time,
      status: { $ne: 'cancelled' }
    });
    
    if (existingBooking) {
      return res.status(409).json({ error: 'Time slot not available' });
    }
    
    // Get service price
    const service = await Service.findById(service_id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Calculate price with VAT (23% for Portugal)
    const vat = service.price * 0.23;
    const total = service.price + vat;
    
    // Create booking
    const booking = new Booking({
      user_id: req.user.id,
      service_id,
      therapist_id,
      date,
      time,
      duration: service.duration,
      notes,
      status: 'confirmed',
      location: 'Clínica Centro',
      price: service.price,
      vat,
      total,
      paid: false
    });
    
    await booking.save();
    
    // Populate relations before sending
    await booking.populate('service_id therapist_id');
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4.3 Implementar PUT /bookings/:id

```javascript
// Backend - Update booking
app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { date, time, notes } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Only update if user is owner
    if (booking.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if new slot is available (if changing date/time)
    if ((date && date !== booking.date) || (time && time !== booking.time)) {
      const newDate = date || booking.date;
      const newTime = time || booking.time;
      
      const conflicting = await Booking.findOne({
        therapist_id: booking.therapist_id,
        date: newDate,
        time: newTime,
        status: { $ne: 'cancelled' },
        _id: { $ne: req.params.id }
      });
      
      if (conflicting) {
        return res.status(409).json({ error: 'New time slot not available' });
      }
    }
    
    // Update fields
    if (date) booking.date = date;
    if (time) booking.time = time;
    if (notes !== undefined) booking.notes = notes;
    booking.updated_at = new Date();
    
    await booking.save();
    await booking.populate('service_id therapist_id');
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4.4 Implementar DELETE /bookings/:id (Cancel)

```javascript
// Backend - Cancel booking
app.post('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Only user can cancel their own booking
    if (booking.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    booking.status = 'cancelled';
    booking.cancelled_at = new Date();
    booking.updated_at = new Date();
    
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 💳 Fase 5: Pagamentos (Opcional, ver PaymentScreen)

### 5.1 Implementar POST /payments

```javascript
// Backend - Process payment (Stripe integration)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { booking_id, payment_method, token } = req.body;
    
    const booking = await Booking.findById(booking_id);
    if (!booking || booking.user_id.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.paid) {
      return res.status(409).json({ error: 'Already paid' });
    }
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.total * 100), // Amount in cents
      currency: 'eur',
      payment_method: token,
      confirm: true,
      return_url: 'exp://qlinica/payment-success'
    });
    
    if (paymentIntent.status === 'succeeded') {
      booking.paid = true;
      booking.payment_method = payment_method;
      booking.transaction_id = paymentIntent.id;
      booking.updated_at = new Date();
      await booking.save();
      
      // Create payment record
      const payment = new Payment({
        booking_id: booking_id,
        user_id: req.user.id,
        amount: booking.total,
        currency: 'EUR',
        status: 'succeeded',
        payment_method: payment_method,
        transaction_id: paymentIntent.id
      });
      await payment.save();
      
      res.json({ status: 'succeeded', payment });
    } else {
      res.status(400).json({ error: 'Payment failed', status: paymentIntent.status });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔐 Authentication Middleware

Todos os endpoints protegidos devem usar este middleware:

```javascript
// Backend
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  });
}
```

---

## 🧪 Teste de Integração

### 1. Mock Server Test (sem backend real)

```bash
# Terminal 1: Start mock server
npm run mock-server

# Terminal 2: Start app
npm start
# Selecionar ios/android/web
```

Todos os endpoints retornarão mock data do `mock-server/db.json`.

### 2. Real Backend Test

```bash
# Atualizar REACT_APP_API_URL em .env
REACT_APP_API_URL=http://localhost:3000/api  # ou seu backend

# Iniciar app
npm start
```

### 3. Testes Manuais

**Login:**
1. Abrir app
2. Ir para AuthScreen
3. Enter email: `joao@example.com`, password: `TestPass123`
4. Verificar se redirecionado para HomeScreen

**Bookings:**
1. Na HomeScreen, clicar em "Agendar Consulta"
2. Selecionar serviço (ex: Fisioterapia)
3. Selecionar terapeuta (ex: Dr. Paulo Silva)
4. Selecionar data e hora
5. Confirmar agendamento
6. Verificar se aparece em BookingsScreen

---

## 🐛 Troubleshooting

### "Network error" ou "Failed to fetch"

1. Verificar se backend está rodando
2. Verificar CORS configuration
3. Verificar `REACT_APP_API_URL` está correto
4. Verificar firewall/proxy

### "401 Unauthorized"

1. Token expirado - fazer logout e login novamente
2. Backend não retornou token após login
3. JWT_SECRET mismatch entre backend e app

### "409 Conflict" (Time slot not available)

1. Terapeuta não tem este horário disponível
2. Outro user já agendou este slot
3. Implementar proper availability checking no backend

---

## 📱 Deploy & Production

### 1. Build APK para Android

```bash
npm run build-android
# Ou
eas build --platform android
```

### 2. Build IPA para iOS

```bash
npm run build-ios
# Requer conta Apple Developer
eas build --platform ios
```

### 3. Update API URL para Production

```
REACT_APP_API_URL=https://api.qlinica.com/api
```

### 4. Configure CORS para Production

```javascript
app.use(cors({
  origin: 'https://qlinica.app',
  credentials: true
}));
```

---

## 📚 Recursos Úteis

- [Express.js Guide](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Stripe Integration](https://stripe.com/docs)
- [CORS Explanation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Última atualização**: 2026-03-22
**Versão**: 1.0.0
