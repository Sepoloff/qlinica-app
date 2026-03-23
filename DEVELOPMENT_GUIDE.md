# 🛠️ Qlinica Development Guide

## Como Usar os Novos Hooks & Componentes

### 1. Real-Time Form Validation

#### useRealTimeValidation Hook

**Uso Básico:**
```typescript
import { useRealTimeValidation } from '@/hooks/useRealTimeValidation';

export function MyForm() {
  const { fields, updateField, validateAll, hasErrors } = useRealTimeValidation({
    email: (value) => {
      if (!value) return 'Email é obrigatório';
      if (!value.includes('@')) return 'Email inválido';
      return null; // Sem erro
    },
    password: (value) => {
      if (!value) return 'Senha é obrigatória';
      if (value.length < 8) return 'Mínimo 8 caracteres';
      return null;
    },
  });

  const handleSubmit = async () => {
    const isValid = await validateAll();
    if (!isValid) {
      showToast('Por favor corrija os erros', 'error');
      return;
    }
    // Submit form
  };

  return (
    <>
      <FormField
        label="Email"
        value={fields.email.value}
        onChangeText={(text) => updateField('email', text)}
        error={fields.email.isTouched ? fields.email.error : null}
        isValidating={fields.email.isValidating}
        isValid={fields.email.value && !fields.email.error}
      />
      <Button
        title="Enviar"
        disabled={hasErrors}
        onPress={handleSubmit}
      />
    </>
  );
}
```

**Features:**
- ✅ Debounce automático (300ms)
- ✅ Estados: validating, valid, error
- ✅ Limpeza automática de timers
- ✅ Múltiplos validadores

---

### 2. Async Operations Management

#### useAsyncOperation Hook

**Uso Básico:**
```typescript
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { OperationStatus } from '@/components/OperationStatus';

export function LoginForm() {
  const { state, execute, error, reset } = useAsyncOperation<void>();

  const handleLogin = async () => {
    await execute(async () => {
      const response = await api.post('/auth/login', { email, password });
      // Handle response
    });
  };

  return (
    <>
      <OperationStatus
        state={state}
        message="Entrando..."
        errorMessage={error?.message}
        onRetry={handleLogin}
        onDismiss={reset}
      />
      <Button
        title="Entrar"
        disabled={state === 'loading'}
        onPress={handleLogin}
      />
    </>
  );
}
```

**States:**
- `'idle'` - Inicial
- `'loading'` - Processando
- `'success'` - Sucesso
- `'error'` - Erro

---

### 3. Offline Operations Queue

#### useOfflineQueue Hook

**Uso Básico:**
```typescript
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function BookingFlow() {
  const { queue, addToQueue, processQueue } = useOfflineQueue();
  const { isOnline } = useNetworkStatus();

  const handleCreateBooking = async (data) => {
    if (!isOnline) {
      // Queue for later
      await addToQueue('create_booking', data, 3); // Max 3 retries
      showToast('Agendamento será criado quando reconectar', 'info');
      return;
    }

    // Create immediately
    try {
      const response = await api.post('/bookings', data);
      showToast('Agendamento criado com sucesso!', 'success');
    } catch (error) {
      await addToQueue('create_booking', data, 3);
      showToast('Salvo offline. Será sincronizado em breve.', 'info');
    }
  };

  // Process queue when online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue(async (operation) => {
        await api.post('/bookings', operation.data);
      });
    }
  }, [isOnline, queue.length]);

  return (
    <>
      <OfflineQueueIndicator
        queueSize={queue.length}
        isOnline={isOnline}
        onRetry={() => processQueue(...)}
      />
      {/* Form content */}
    </>
  );
}
```

**Features:**
- ✅ Persistência em AsyncStorage
- ✅ Auto-retry com backoff
- ✅ Max attempts configurável
- ✅ Error tracking

---

### 4. Analytics Tracking

#### useSimpleAnalytics Hook

**Uso Básico:**
```typescript
import { useSimpleAnalytics } from '@/hooks/useSimpleAnalytics';

export function HomeScreen() {
  const { trackScreenView, trackEvent, trackError, trackTiming } = useSimpleAnalytics();

  useEffect(() => {
    // Track screen view
    trackScreenView('home', { userId: user?.id });
  }, []);

  const handleBooking = async () => {
    const startTime = Date.now();

    try {
      // Track event
      trackEvent('booking_started', { serviceId: '123' });

      const result = await createBooking();

      // Track conversion
      trackConversion('booking_completed', 150); // 150€ value

      // Track timing
      trackTiming('booking_creation', Date.now() - startTime);
    } catch (error) {
      trackError(error, { screen: 'home', action: 'booking' });
    }
  };

  return (
    <Button title="Agendar" onPress={handleBooking} />
  );
}
```

**Métodos:**
- `trackEvent(name, properties)` - Evento customizado
- `trackScreenView(screen, properties)` - Vista de tela
- `trackError(error, context)` - Erro com contexto
- `trackTiming(name, ms, properties)` - Medição de performance
- `trackConversion(type, value)` - Conversão/revenue

---

### 5. Empty States

#### EmptyStateView Component

**Uso Básico:**
```typescript
import { EmptyStateView } from '@/components/EmptyStateView';

export function BookingsScreen() {
  if (bookings.length === 0) {
    return (
      <EmptyStateView
        icon="📅"
        title="Nenhum agendamento"
        description="Crie sua primeira consulta para começar"
        actionLabel="Agendar Consulta"
        onAction={() => navigation.navigate('Booking')}
        actionLabelSecondary="Ver serviços"
        onActionSecondary={() => navigation.navigate('Services')}
        spacing="large"
      />
    );
  }

  return <BookingsList bookings={bookings} />;
}
```

**Props:**
- `icon` - Emoji ou símbolo
- `title` - Título
- `description` - Descrição opcional
- `actionLabel` / `onAction` - Botão principal
- `actionLabelSecondary` / `onActionSecondary` - Botão secundário
- `spacing` - 'small' | 'medium' | 'large'

---

## 📝 Best Practices

### 1. Validação em Formulários
```typescript
// ✅ BOM: Usar FormField com useRealTimeValidation
const { fields, updateField } = useRealTimeValidation({...});

<FormField
  value={fields.email.value}
  onChangeText={(text) => updateField('email', text)}
  error={fields.email.isTouched ? fields.email.error : null}
  isValidating={fields.email.isValidating}
/>
```

### 2. Operações Async
```typescript
// ✅ BOM: Usar useAsyncOperation
const { state, execute } = useAsyncOperation();

// ❌ RUIM: Gerenciar manualmente loading/error
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### 3. Offline Support
```typescript
// ✅ BOM: Queue automática para offline
if (!isOnline) {
  await addToQueue('operation', data);
  showToast('Salvo offline');
}

// ❌ RUIM: Falhar sem retry
try {
  await api.post(data);
} catch {
  // Perder dados
}
```

### 4. Analytics
```typescript
// ✅ BOM: Track eventos importantes
trackEvent('button_clicked', { buttonName: 'login' });

// ❌ RUIM: Sem contexto
console.log('Clicked');
```

---

## 🔧 Configuration

### Debounce Delay
```typescript
// Default: 300ms
const { fields, updateField } = useRealTimeValidation(validators, 500); // Custom delay
```

### Offline Queue Attempts
```typescript
// Default: 3 attempts
await addToQueue('operation', data, 5); // Custom max attempts
```

### Storage Key
```typescript
// Default: 'qlinica_offline_queue'
const { queue } = useOfflineQueue('my_custom_key');
```

---

## 📊 Performance Tips

1. **Debounce validators** para não fazer requests a cada keystroke
2. **Use offline queue** para operações críticas
3. **Batch analytics events** antes de enviar
4. **Cache validation results** quando possível
5. **Clean up timers** no unmount (automático nos hooks)

---

## 🐛 Debugging

### View Queue Status
```typescript
const { queue } = useOfflineQueue();
console.log('Queued operations:', queue);
```

### Check Validation State
```typescript
const { fields } = useRealTimeValidation({...});
console.log('Validation errors:', fields);
```

### Track Operations
```typescript
const { state } = useAsyncOperation();
console.log('Current state:', state); // 'idle' | 'loading' | 'success' | 'error'
```

---

## 📚 Referências

- [useRealTimeValidation](./src/hooks/useRealTimeValidation.ts)
- [useAsyncOperation](./src/hooks/useAsyncOperation.ts)
- [useOfflineQueue](./src/hooks/useOfflineQueue.ts)
- [useSimpleAnalytics](./src/hooks/useSimpleAnalytics.ts)
- [FormField](./src/components/FormField.tsx)
- [OperationStatus](./src/components/OperationStatus.tsx)
- [OfflineQueueIndicator](./src/components/OfflineQueueIndicator.tsx)
- [EmptyStateView](./src/components/EmptyStateView.tsx)

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/Sepoloff/qlinica-app.git
cd qlinica-app
npm install

# Start development
npm start

# Scan QR with Expo Go
# Test on iOS/Android
```

---

**Happy coding! 🎉**
