# 🎨 Enhanced Components Guide

## Overview

Este guia descreve os novos componentes e hooks adicionados na integração de melhorias.

## 📦 Novos Componentes

### 1. EnhancedFormField

Campo de formulário avançado com validação em tempo real.

#### Características
- ✅ Validação em tempo real (regex pattern matching)
- ✅ Min/Max length validation
- ✅ Ícones de status (✓, ✕, ⟳)
- ✅ Toggle para password visibility
- ✅ Character counter
- ✅ Campos obrigatórios com asterisco
- ✅ Mensagens de erro animadas
- ✅ Helper text

#### Props
```typescript
interface EnhancedFormFieldProps extends TextInputProps {
  label?: string;                    // Campo label
  placeholder?: string;              // Placeholder text
  error?: string;                    // Error message
  helperText?: string;               // Helper text abaixo
  icon?: string;                     // Ícone à esquerda
  rightIcon?: string;                // Ícone à direita
  onRightIconPress?: () => void;     // Right icon callback
  validationState?: ValidationState; // 'idle' | 'validating' | 'valid' | 'error'
  showValidationIcon?: boolean;      // Mostrar ícones
  containerStyle?: ViewStyle;        // Custom container style
  secureTextEntry?: boolean;         // Password field
  toggleSecureEntry?: boolean;       // Mostrar toggle de visibilidade
  minLength?: number;                // Mínimo caracteres
  maxLength?: number;                // Máximo caracteres
  pattern?: RegExp;                  // Regex pattern
  patternErrorMessage?: string;      // Mensagem de erro padrão
  onValidationChange?: (valid: boolean) => void;
  required?: boolean;
  requiredMessage?: string;
}
```

#### Exemplo de Uso
```typescript
import { EnhancedFormField } from '@/components';

export function MyForm() {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9]/;

  return (
    <EnhancedFormField
      label="Email"
      placeholder="seu@email.com"
      value={email}
      onChangeText={setEmail}
      icon="📧"
      pattern={EMAIL_REGEX}
      patternErrorMessage="Email inválido"
      onValidationChange={setEmailValid}
      required
      maxLength={254}
    />
  );
}
```

---

### 2. ErrorState

Componente versátil para exibir erros com múltiplos variantes.

#### Características
- ✅ 3 variantes: alert, card, inline
- ✅ Ícones visuais customizáveis
- ✅ Botão de retry integrado
- ✅ Títulos e subtítulos
- ✅ Cores por tipo de erro

#### Props
```typescript
interface ErrorStateProps {
  error: string | Error | null;     // Mensagem de erro
  onRetry?: () => void;             // Callback do botão retry
  title?: string;                   // Título do erro
  subtitle?: string;                // Subtítulo
  showIcon?: boolean;               // Mostrar ícone
  variant?: 'alert' | 'card' | 'inline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullHeight?: boolean;             // Preencher altura
}
```

#### Exemplo de Uso
```typescript
import { ErrorState } from '@/components';

// Alert variant - para erros importantes
<ErrorState
  error="Credenciais inválidas"
  title="Erro ao Fazer Login"
  variant="alert"
  onRetry={() => clearError()}
  subtitle="Verifique email e senha"
/>

// Card variant - para erros em cards
<ErrorState
  error="Falha ao carregar dados"
  variant="card"
  onRetry={refetch}
/>

// Inline variant - para erros pequenos
<ErrorState
  error="Campo obrigatório"
  variant="inline"
/>
```

---

### 3. BookingSummaryCard

Exibição completa de detalhes de agendamento.

#### Características
- ✅ Seções organizadas (service, therapist, date/time, notes)
- ✅ Botões de edição para cada seção
- ✅ Breakdown de preço
- ✅ Status de confirmação
- ✅ Ícones semânticos

#### Props
```typescript
interface BookingSummaryCardProps {
  data: BookingSummaryData;         // Dados do agendamento
  onEditService?: () => void;       // Edit service handler
  onEditTherapist?: () => void;     // Edit therapist handler
  onEditDateTime?: () => void;      // Edit date/time handler
  onEditNotes?: () => void;         // Edit notes handler
  loading?: boolean;
  style?: ViewStyle;
}

interface BookingSummaryData {
  service?: {
    id: number | string;
    name: string;
    price: string;
    duration: string;
  };
  therapist?: {
    id: number | string;
    name: string;
    specialty: string;
    rating?: number;
  };
  date?: string;
  time?: string;
  notes?: string;
  total?: string;
}
```

#### Exemplo de Uso
```typescript
import { BookingSummaryCard } from '@/components';
import { useNavigation } from '@react-navigation/native';

export function BookingReviewScreen() {
  const navigation = useNavigation();
  
  const bookingData = {
    service: {
      id: 1,
      name: 'Psicologia - Sessão Individual',
      price: '€50.00',
      duration: '50 min'
    },
    therapist: {
      id: 1,
      name: 'Dr. João Silva',
      specialty: 'Psicologia Clínica',
      rating: 4.8
    },
    date: '25 Março 2026',
    time: '14:30',
    notes: 'Primeira sessão, trazer documentação',
    total: '€50.00'
  };

  return (
    <BookingSummaryCard
      data={bookingData}
      onEditService={() => navigation.navigate('ServiceSelection')}
      onEditTherapist={() => navigation.navigate('TherapistSelection')}
      onEditDateTime={() => navigation.navigate('CalendarSelection')}
      onEditNotes={() => navigation.navigate('BookingNotes')}
    />
  );
}
```

---

## 🎣 Novos Hooks

### 1. useAuthIntegration

Hook para gerenciar autenticação com JWT refresh automático.

#### Características
- ✅ Auto-refresh de token antes de expirar
- ✅ Intervalo configurável
- ✅ Callbacks para eventos
- ✅ Refresh manual disponível

#### Props
```typescript
interface UseAuthIntegrationOptions {
  autoRefresh?: boolean;           // Enable auto-refresh (default: true)
  refreshInterval?: number;        // Intervalo em ms (default: 60000)
  onTokenExpired?: () => void;     // Token expirou
  onRefreshFailed?: () => void;    // Refresh falhou
}
```

#### Return Value
```typescript
{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  manualRefresh: () => Promise<void>;
}
```

#### Exemplo de Uso
```typescript
import { useAuthIntegration } from '@/hooks/useAuthIntegration';
import { useToast } from '@/context/ToastContext';

export function AppContainer() {
  const { showToast } = useToast();
  
  const auth = useAuthIntegration({
    autoRefresh: true,
    refreshInterval: 60000, // 1 minuto
    onTokenExpired: () => {
      showToast('🔐 Sessão expirada. Faça login novamente.', 'error');
    },
    onRefreshFailed: () => {
      showToast('⚠️ Falha ao renovar sessão. Tente novamente.', 'error');
    }
  });

  if (auth.isLoading) {
    return <LoadingScreen />;
  }

  if (!auth.isAuthenticated) {
    return <LoginScreen />;
  }

  return <MainApp />;
}
```

---

## 🛠️ Novos Services

### 1. validationService

Serviço centralizado com funções de validação avançada.

#### Funções
```typescript
// Login
validateLoginForm(email: string, password: string): ValidationResult

// Registration
validateRegistrationForm(email: string, password: string, name: string, passwordConfirm?: string): ValidationResult

// Booking
validateBookingForm(serviceId?: string | number, therapistId?: string | number, date?: Date, time?: string): ValidationResult

// Profile
validateProfileUpdate(name?: string, phone?: string, email?: string): ValidationResult

// Password Strength
getPasswordStrengthFeedback(password: string): PasswordStrengthResult

// Extended Validators
validateEmailExtended(email: string): ValidationResult
validatePhoneExtended(phone: string): ValidationResult

// Batch Validation
validateBatch(fields: Record<string, any>, validators: Record<string, Function>): Record<string, ValidationResult>
hasValidationErrors(results: Record<string, ValidationResult>): boolean
getAllValidationErrors(results: Record<string, ValidationResult>): string[]
```

#### Exemplo de Uso
```typescript
import { validateLoginForm, getPasswordStrengthFeedback } from '@/services/validationService';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const result = validateLoginForm(email, password);
    
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    
    // Proceed with login
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    const strength = getPasswordStrengthFeedback(pwd);
    
    console.log(`Strength: ${strength.strength}`);
    console.log(`Suggestions: ${strength.feedback.join(', ')}`);
  };

  return (
    <View>
      {errors.map((err, i) => <Text key={i}>{err}</Text>)}
      <EnhancedFormField
        label="Password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
      />
    </View>
  );
}
```

---

## 🔐 Token Management Utilities

### tokenRefresh.ts

Utilitários para gerenciar JWT tokens.

#### Funções
```typescript
// Decode JWT payload (client-side only)
decodeJWT(token: string): any

// Check if token should be refreshed
shouldRefreshToken(token: string): boolean

// Get remaining expiry time
getTokenExpiryTime(token: string): number | null

// Attempt refresh
refreshJWTToken(): Promise<boolean>

// Auto-refresh if needed
autoRefreshTokenIfNeeded(): Promise<boolean>

// Get token info (debugging)
getTokenInfo(): Promise<TokenInfo | null>
```

#### Exemplo de Uso
```typescript
import { shouldRefreshToken, refreshJWTToken, getTokenInfo } from '@/utils/tokenRefresh';
import { authStorage } from '@/utils/storage';

// Check if refresh needed
const token = await authStorage.getToken();
if (token && shouldRefreshToken(token)) {
  const success = await refreshJWTToken();
  console.log('Refresh result:', success);
}

// Debug token info
const info = await getTokenInfo();
console.log('Token expires in:', info?.expiresIn);
console.log('Should refresh:', info?.shouldRefresh);
```

---

## 🎨 Integração com Existing Components

### LoadingButton
Botão com estado de loading integrado.

```typescript
import { LoadingButton } from '@/components';

<LoadingButton
  onPress={handleLogin}
  title="Entrar"
  loading={isLoading}
  disabled={!isValid}
/>
```

### LoadingSpinner
Spinner com suporte a múltiplos variantes.

```typescript
import { LoadingSpinner } from '@/components';

<LoadingSpinner
  variant="branded"
  message="Carregando..."
  showProgress
  progress={45}
/>
```

---

## 🎯 Best Practices

### 1. Validação
```typescript
// ❌ Não fazer
if (!email) showError('Email obrigatório');

// ✅ Fazer
const validation = validateEmailExtended(email);
if (!validation.valid) showErrors(validation.errors);
```

### 2. Error Handling
```typescript
// ❌ Não fazer
try { login() } catch(e) { alert(e.message) }

// ✅ Fazer
try { 
  login() 
} catch(e) { 
  <ErrorState error={e} variant="alert" onRetry={handleRetry} />
}
```

### 3. Loading States
```typescript
// ❌ Não fazer
<Button disabled={loading} />

// ✅ Fazer
<LoadingButton loading={loading} onPress={handleSubmit} />
```

### 4. Form Fields
```typescript
// ❌ Não fazer
<TextInput />

// ✅ Fazer
<EnhancedFormField
  pattern={REGEX}
  onValidationChange={setValid}
  icon="📧"
/>
```

---

## 🧪 Testing

Ver `TESTING_GUIDE_ENHANCED.md` para detalhes completos.

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { EnhancedFormField } from '@/components';

describe('EnhancedFormField', () => {
  it('should show validation error', () => {
    const { getByText } = render(
      <EnhancedFormField
        pattern={EMAIL_REGEX}
        value="invalid"
      />
    );
    
    expect(getByText(/Email inválido/)).toBeTruthy();
  });
});
```

---

## 📚 Próximos Passos

1. **Testar todos os componentes** - Veja `TESTING_GUIDE_ENHANCED.md`
2. **Integrar nos screens** - Substitua componentes antigos pelos novos
3. **Update navigation** - Configure routes para novos screens
4. **Deploy** - Teste em ambiente de staging primeiro

## 📞 Support

Para dúvidas ou issues:
1. Verifique `INTEGRATION_SUMMARY.md`
2. Consulte `TESTING_GUIDE_ENHANCED.md`
3. Revise exemplos em `src/screens/AuthScreens/LoginScreenEnhanced.tsx`
