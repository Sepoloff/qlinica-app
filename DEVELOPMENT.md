# Qlinica App - Guia de Desenvolvimento

## 📋 Visão Geral

Aplicação React Native para agendamento de consultas clínicas com:
- ✅ Autenticação JWT com AuthContext
- ✅ Integração API com retry logic e fallback
- ✅ Fluxo de booking multi-step
- ✅ Offline support com sincronização
- ✅ Notificações e lembretes
- ✅ Validação robusta de inputs
- ✅ Error boundaries e tratamento centralizado de erros

## 🏗️ Arquitetura

```
src/
├── screens/          # Écrans principais
│   ├── AuthScreens/  # Login, Register, ResetPassword
│   └── BookingScreens/ # Fluxo de agendamento
├── context/          # Estado global (Auth, Booking, Toast)
├── services/         # Lógica de negócio (API, Auth, Booking)
├── hooks/            # Custom hooks reutilizáveis
├── components/       # Componentes UI reutilizáveis
├── utils/            # Utilitários (validation, storage, etc)
├── constants/        # Cores, dados mock, mensagens
└── config/           # Configurações (API, Firebase)
```

## 🔐 Autenticação

### AuthContext (`src/context/AuthContext.tsx`)
```typescript
const { user, isAuthenticated, login, register, logout, updateUser, error } = useAuth();

// Login
await login('user@example.com', 'password123');

// Register
await register('user@example.com', 'Password123', 'João Silva');

// Logout
await logout();
```

**Validação:**
- Email: RFC 5322 compliant
- Password: Min 8 chars, 1 uppercase, 1 number
- Name: Min 2 chars, sem números

### Token Storage
- Guardado em AsyncStorage
- Incluído automaticamente em todos os requests via interceptor
- Auto-refresh em caso de expiração

## 🛒 Fluxo de Booking

### Passos:
1. **ServiceSelectionScreen** - Escolher serviço
2. **TherapistSelectionScreen** - Escolher terapeuta
3. **CalendarSelectionScreen** - Data e hora
4. **BookingSummaryScreen** - Confirmar agendamento

### Estado Global
```typescript
const { bookingData, setService, setTherapist, setDateTime, resetBooking } = useBooking();

// Ou via BookingFlowContext
const { bookingState, setBookingState, submitBooking } = useBookingFlow();
```

### Criar Booking
```typescript
const booking = await bookingService.createBooking({
  serviceId: 1,
  therapistId: 2,
  date: '22/03/2026',
  time: '14:30',
  notes: 'Observações opcionais'
});
```

## 📱 API & Integração

### Base URL
```
http://localhost:3000/api (development)
```

### Endpoints Utilizados

**Auth:**
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/logout` - Logout
- `PUT /auth/user` - Atualizar perfil

**Bookings:**
- `GET /bookings` - Listar agendamentos
- `GET /bookings/:id` - Detalhes de agendamento
- `POST /bookings` - Criar agendamento
- `PUT /bookings/:id` - Atualizar agendamento
- `DELETE /bookings/:id` - Cancelar agendamento

**Services:**
- `GET /services` - Listar serviços
- `GET /therapists` - Listar terapeutas
- `GET /therapists/:id/slots` - Horários disponíveis

### Retry Logic

Implementado em `src/config/api.ts`:
- Max 3 tentativas
- Exponential backoff com jitter
- 500ms inicial, máx 8s
- Falha em 401 (não tenta novamente)

```
Attempt 1: 500ms + random(0-500)
Attempt 2: 1000ms + random(0-500)
Attempt 3: 2000ms + random(0-500)
```

### Fallback de Dados Mock

Todos os serviços têm fallback:
```typescript
const services = await bookingService.getServices()
  .catch(() => convertMockServices());
```

## ✅ Validação

### Hooks Utilitários

```typescript
const { errors, validateField, validateForm, clearErrors } = useFormValidation();

// Validar campo individual
const error = validateField('email', 'user@example.com');

// Validar formulário inteiro
const result = validateForm('register', { 
  email, password, name 
});
```

### Validadores (`src/utils/validation.ts`)
- `validateEmail()` - RFC 5322
- `validatePassword()` - Min 8 chars, uppercase, number
- `validatePhone()` - Números portugueses
- `validateName()` - Min 2 chars
- `validateDate()` - Não passado

## 📲 Notificações

### Toast Notifications
```typescript
const toast = useQuickToast();

toast.success('Sucesso!');
toast.error('Erro!');
toast.info('Informação');
toast.warning('Aviso');
```

Duração padrão:
- Success: 3s
- Error: 4s
- Info: 3s
- Warning: 3.5s

### Sistema de Notificações
```typescript
const { 
  notifyBookingConfirmation, 
  scheduleAppointmentReminder 
} = useNotificationManager();

await notifyBookingConfirmation(
  'Dr. João', 
  'Fisioterapia', 
  new Date('2026-03-22T14:30:00')
);
```

## 🔄 Offline Support

### Fila de Sincronização
```typescript
const { queueCount, isSyncing, sync } = useOfflineSync();

// Sincronizar manualmente
await sync();
```

Operações offline:
- Agendamentos criados offline
- Edições guardadas localmente
- Sincronização automática quando online

## 📊 Analytics

### Eventos Rastreados
```typescript
const { trackScreenView, trackEvent, trackError } = useAnalytics();

trackScreenView('home');
trackEvent('booking_created', { serviceId: 1, therapistId: 2 });
trackError(error, { context: 'booking' });
```

## 🎨 Componentes Principais

### FormInput
```typescript
<FormInput
  label="Email"
  placeholder="user@example.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={errors.email}
/>
```

### LoadingSpinner
```typescript
<LoadingSpinner 
  fullScreen
  message="Carregando..."
  showProgress
  progress={45}
/>
```

### Button
```typescript
<Button
  label="Confirmar"
  onPress={handleConfirm}
  loading={isLoading}
  disabled={!isValid}
  variant="primary" // ou "secondary", "danger"
/>
```

### Card
```typescript
<Card style={{ marginBottom: 12 }}>
  <Text>Conteúdo do card</Text>
</Card>
```

## 🧪 Testing

### Estrutura
```
src/__tests__/
├── services/
├── utils/
└── hooks/
```

### Executar Testes
```bash
npm run test
```

## 📱 Build & Deploy

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

### EAS Submit
```bash
eas submit --platform android --latest
```

## 🐛 Debugging

### Logs
```typescript
import { logger } from '@/utils/logger';

logger.debug('Mensagem', 'Module', { data });
logger.warn('Aviso', 'Module', error);
logger.error('Erro', error, 'Module');
```

### React DevTools
```bash
npx react-native-debugger
```

### Network Inspection
O API client registra todas as requisições com timing e status.

## 🚀 Best Practices

### 1. Usar Hooks Customizados
```typescript
// ✅ Bom
const { user } = useAuth();
const { error, validateField } = useFormValidation();

// ❌ Evitar
const context = useContext(AuthContext);
```

### 2. Validação Antes de Submeter
```typescript
// ✅ Bom
const result = validateForm('register', data);
if (result.isValid) {
  await register(...);
}

// ❌ Evitar
await register(email, password, name); // Sem validação
```

### 3. Error Handling
```typescript
// ✅ Bom
try {
  await bookingService.createBooking(data);
  toast.success('Agendamento criado');
} catch (error) {
  const message = error.response?.data?.message || 'Erro desconhecido';
  toast.error(message);
}

// ❌ Evitar
await bookingService.createBooking(data); // Sem try/catch
```

### 4. Loading States
```typescript
// ✅ Bom
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    // ... operação
  } finally {
    setIsLoading(false);
  }
};

// ❌ Evitar
await bookingService.createBooking(data); // Sem feedback visual
```

### 5. Cleanup em useEffect
```typescript
// ✅ Bom
useEffect(() => {
  const subscription = onBookingUpdated(handleUpdate);
  return () => subscription?.unsubscribe();
}, []);

// ❌ Evitar
useEffect(() => {
  onBookingUpdated(handleUpdate); // Sem cleanup
}, []);
```

## 📚 Recursos

- [React Navigation](https://reactnavigation.org/)
- [Expo Documentation](https://docs.expo.dev/)
- [Axios Documentation](https://axios-http.com/)
- [React Hooks Guide](https://react.dev/reference/react/hooks)

## 🎯 Próximas Melhorias

- [ ] Push notifications via Firebase
- [ ] Sistema de avaliações
- [ ] Integração de pagamento
- [ ] Chat com terapeutas
- [ ] Histórico de consultas detalhado
- [ ] A/B testing setup
- [ ] Performance monitoring

---

**Última atualização:** Março 22, 2026
