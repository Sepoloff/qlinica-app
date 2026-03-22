# Components & Hooks Guide

Documentação dos componentes reutilizáveis e hooks customizados da aplicação Qlinica.

## 📦 Componentes

### Button

Botão versátil com múltiplas variantes e tamanhos.

**Variantes:**
- `primary` - Botão principal (dourado)
- `secondary` - Botão secundário (outline dourado)
- `danger` - Botão de ação destrutiva (vermelho)
- `success` - Botão de confirmação (verde)
- `outline` - Botão com borda

**Tamanhos:**
- `small` - 8px vertical, 12px fontSize
- `medium` - 12px vertical, 14px fontSize
- `large` - 16px vertical, 16px fontSize

**Exemplo de Uso:**

```typescript
import { Button } from '@/components';

export default function MyScreen() {
  return (
    <>
      <Button
        title="Agendar Consulta"
        onPress={() => navigation.navigate('ServiceSelection')}
        variant="primary"
        size="large"
        fullWidth
      />

      <Button
        title="Cancelar"
        onPress={() => navigation.goBack()}
        variant="secondary"
        size="medium"
      />

      <Button
        title="Apagar"
        onPress={handleDelete}
        variant="danger"
        icon="🗑️"
        loading={isDeleting}
        disabled={isDeleting}
      />
    </>
  );
}
```

---

### Card

Componente para agrupar conteúdo com estilo consistente.

**Props:**
- `shadow` - Adiciona sombra
- `bordered` - Adiciona borda dourada
- `highlighted` - Realça o card com fundo dourado
- `disabled` - Estado desativado

**Exemplo de Uso:**

```typescript
import { Card } from '@/components';

export default function BookingCard() {
  return (
    <Card shadow bordered>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
        Fisioterapia
      </Text>
      <Text style={{ color: '#888', marginBottom: 12 }}>
        Dra. Ana Silva - 20 Mar, 10:00
      </Text>
      <Button title="Ver Detalhes" onPress={() => {}} />
    </Card>
  );
}
```

---

### Header

Header reutilizável para o topo das telas.

**Props:**
- `title` - Título principal
- `subtitle` - Subtítulo opcional
- `showBackButton` - Mostrar botão voltar
- `rightElement` - Elemento customizado à direita

**Exemplo de Uso:**

```typescript
import { Header, Button } from '@/components';

export default function MyScreen() {
  return (
    <>
      <Header
        title="Minhas Marcações"
        subtitle="5 agendamentos"
        showBackButton
        rightElement={<Text>⚙️</Text>}
      />
      {/* Conteúdo da tela */}
    </>
  );
}
```

---

### InputField

Campo de entrada com validação integrada.

**Tipos Suportados:**
- `text` - Texto simples
- `email` - E-mail
- `password` - Senha com toggle
- `phone` - Telefone
- `number` - Números apenas

**Exemplo de Uso:**

```typescript
import { InputField } from '@/components';
import { useFormValidation } from '@/hooks';

export default function LoginScreen() {
  const { errors, validateField } = useFormValidation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <InputField
        label="E-mail"
        placeholder="seu@email.com"
        type="email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          validateField('email', text);
        }}
        error={errors.email}
        icon="📧"
      />

      <InputField
        label="Palavra-passe"
        placeholder="Sua password..."
        type="password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          validateField('password', text);
        }}
        error={errors.password}
        icon="🔒"
      />
    </>
  );
}
```

---

### LoadingSpinner

Indicador de carregamento customizado.

**Exemplo de Uso:**

```typescript
import { LoadingSpinner } from '@/components';

export default function MyScreen() {
  const { data, loading } = useAsync(() => bookingService.getBookings(), {
    autoLoad: true,
  });

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando marcações..." />;
  }

  return <Text>{data?.length} marcações</Text>;
}
```

---

### EmptyState

Estado vazio para quando não há dados.

**Exemplo de Uso:**

```typescript
import { EmptyState } from '@/components';

export default function BookingsScreen() {
  const { data } = useAsync(() => bookingService.getBookings());

  if (!data?.length) {
    return (
      <EmptyState
        icon="📋"
        title="Sem marcações"
        message="Você não tem nenhuma consulta agendada"
        actionLabel="Agendar Agora"
        onAction={() => navigation.navigate('ServiceSelection')}
      />
    );
  }

  return <BookingsList bookings={data} />;
}
```

---

## 🎣 Hooks

### useFormValidation

Gerencia validação de formulários.

**Métodos:**
- `validateField(fieldName, value)` - Valida um campo
- `validateForm(formType, data)` - Valida um formulário completo
- `clearErrors()` - Limpa todos os erros
- `clearFieldError(fieldName)` - Limpa erro de um campo

**Tipos de Formulário:**
- `login` - Email + Password
- `register` - Email + Password + Name + Phone (opt)
- `booking` - ServiceId + TherapistId + Date + Time
- `profile` - Name + Phone + Email

**Exemplo de Uso:**

```typescript
import { useFormValidation } from '@/hooks';

export default function RegisterScreen() {
  const { errors, validateForm, clearErrors } = useFormValidation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleRegister = async () => {
    const { isValid } = validateForm('register', formData);

    if (!isValid) return;

    try {
      await authService.register(formData);
    } catch (err) {
      // Erro
    }
  };

  return (
    <>
      <InputField
        label="E-mail"
        value={formData.email}
        onChangeText={(email) => setFormData({ ...formData, email })}
        error={errors.email}
      />
      {/* Outros fields */}
      <Button title="Registrar" onPress={handleRegister} />
    </>
  );
}
```

---

### useAsync

Gerencia operações assincronamente com loading/error states.

**Retorna:**
- `data` - Dados retornados
- `loading` - Estado de carregamento
- `error` - Erro ocorrido
- `refetch(params)` - Recarregar dados
- `reset()` - Resetar estado

**Exemplo de Uso:**

```typescript
import { useAsync } from '@/hooks';

export default function BookingsScreen() {
  const { data: bookings, loading, error, refetch } = useAsync(
    () => bookingService.getBookings(),
    {
      autoLoad: true,
      onSuccess: (data) => console.log('✅ Bookings loaded'),
      onError: (error) => console.log('❌ Error:', error),
    }
  );

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refetch} />
      }
    >
      {loading && <LoadingSpinner />}
      {error && <EmptyState icon="⚠️" title="Erro" message={error.message} />}
      {bookings?.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </ScrollView>
  );
}
```

---

### usePersist

Persiste dados em AsyncStorage.

**Retorna:**
- `data` - Dados persistidos
- `loading` - Estado de carregamento inicial
- `save(data)` - Salvar dados
- `remove()` - Remover dados
- `reset()` - Reset ao valor inicial

**Exemplo de Uso:**

```typescript
import { usePersist } from '@/hooks';

export default function BookingFlowScreen() {
  const { data: draftBooking, save, remove } = usePersist(
    'bookingDraft',
    null,
    {
      onError: (error) => console.error('Storage error:', error),
    }
  );

  const handleSaveDraft = async (booking) => {
    await save(booking);
    toast.success('Rascunho salvo');
  };

  return (
    <>
      {draftBooking && (
        <Button
          title={`Continuar: ${draftBooking.serviceName}`}
          onPress={() => loadDraft(draftBooking)}
        />
      )}
    </>
  );
}
```

---

### useDebounce

Debounce para valores (útil para busca, filtros).

**Exemplo de Uso:**

```typescript
import { useDebounce } from '@/hooks';
import { useAsync } from '@/hooks';

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: results } = useAsync(
    () => bookingService.searchTherapists(debouncedSearchTerm),
    {
      dependencies: [debouncedSearchTerm],
    }
  );

  return (
    <>
      <InputField
        placeholder="Buscar terapeuta..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {results?.map((therapist) => (
        <TherapistCard key={therapist.id} therapist={therapist} />
      ))}
    </>
  );
}
```

---

### useThrottle

Throttle para funções de alta frequência (scroll, resize).

**Exemplo de Uso:**

```typescript
import { useThrottle } from '@/hooks';

export default function ScrollableList() {
  const handleScroll = useThrottle(() => {
    console.log('Scroll throttled');
    loadMoreData();
  }, 1000);

  return (
    <ScrollView onScroll={handleScroll}>
      {/* Content */}
    </ScrollView>
  );
}
```

---

### useBookingFlow

Gerencia o fluxo de agendamento multi-screen.

**Retorna:**
- `bookingState` - Estado atual do agendamento
- `selectService(id)` - Selecionar serviço
- `selectTherapist(id)` - Selecionar terapeuta
- `selectDateTime(date, time)` - Selecionar data/hora
- `addNotes(notes)` - Adicionar notas
- `submitBooking()` - Submeter agendamento
- `isSubmitting` - Estado de submissão
- `error` - Erro de submissão
- `isComplete` - Verifica se booking está completo
- `resetBooking()` - Reset do estado

**Exemplo de Uso:**

```typescript
import { useBookingFlow } from '@/hooks';

export default function BookingSummaryScreen() {
  const {
    bookingState,
    submitBooking,
    isSubmitting,
    error,
    isComplete,
  } = useBookingFlow();

  const handleConfirmBooking = async () => {
    if (!isComplete) {
      toast.error('Complete all fields');
      return;
    }

    try {
      const result = await submitBooking();
      toast.success('Agendamento realizado!');
      navigation.navigate('bookings');
    } catch (err) {
      toast.error(error || 'Erro ao agendar');
    }
  };

  return (
    <>
      <Card>
        <Text>Serviço: {bookingState.serviceId}</Text>
        <Text>Terapeuta: {bookingState.therapistId}</Text>
        <Text>Data: {bookingState.date}</Text>
        <Text>Hora: {bookingState.time}</Text>
      </Card>
      <Button
        title="Confirmar Agendamento"
        onPress={handleConfirmBooking}
        loading={isSubmitting}
        disabled={!isComplete || isSubmitting}
      />
    </>
  );
}
```

---

## 🎨 Design System

### Cores

```typescript
import { COLORS } from '@/constants/Colors';

// Primary
COLORS.primary      // #2C3E50 (Navy)
COLORS.primaryDark  // #1a252f
COLORS.primaryLight // #34495E

// Accent
COLORS.gold         // #D4AF8F (Dourado)

// Status
COLORS.success      // Verde
COLORS.danger       // Vermelho
COLORS.warning      // Laranja
COLORS.grey         // Cinzento

COLORS.white        // #FFFFFF
COLORS.black        // #000000
```

### Fonts

```typescript
// Titulos (Serif)
fontFamily: 'Cormorant'

// Body (Sans)
fontFamily: 'DMSans'
```

---

## 📝 Best Practices

1. **Sempre usar componentes reutilizáveis** em vez de criar novos
2. **Usar hooks para logic comum** (validação, async, storage)
3. **Aplicar debounce em buscas** (delay 500ms)
4. **Aplicar throttle em scroll** (delay 1000ms)
5. **Sempre limpar errors após validação** bem-sucedida
6. **Mostrar loading states** durante async operations
7. **Usar EmptyState para dados vazios** em listas
8. **Persistir dados importantes** com usePersist

---

**Últimas atualizações:** 2026-03-22
