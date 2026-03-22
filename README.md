# Qlinica - iOS & Android App

Uma aplicação React Native de agendamento de consultas clínicas para iOS e Android, criada com Expo.

**Status:** 🚀 MVP Ready (85% complete) | **Version:** 0.3.0

## 📱 Plataformas Suportadas

- ✅ **iOS** (iPhone, iPad)
- ✅ **Android** (Phones, Tablets)
- ✅ **Web** (via Expo Web)

## 🎯 Funcionalidades Implementadas ✅

### Autenticação
- ✅ **LoginScreen**: Email/password com validação
- ✅ **RegisterScreen**: Novo registro com força de password
- ✅ **AuthContext**: JWT token management com auto-login
- ✅ **Password Validation**: Requisitos de segurança

### Telas Principais
- ✅ **Home Screen**: Dashboard com próximas consultas, grid de serviços, pull-to-refresh
- ✅ **Bookings Screen**: Histórico com abas (Próximas/Passadas), cancelamento
- ✅ **Profile Screen**: Edição de dados, preferências de notificação, logout
- ✅ **Dark Theme**: Design premium com paleta ouro/cinzento

### Fluxo de Agendamento
- ✅ **ServiceSelectionScreen**: Seleção com descrição e preço
- ✅ **TherapistSelectionScreen**: Escolha com ratings e disponibilidade
- ✅ **CalendarSelectionScreen**: Picker de data e horário
- ✅ **BookingSummaryScreen**: Confirmação com edição
- ✅ **BookingDetailsScreen**: Visualização com remarcar/cancelar
- ✅ **Navegação Stack**: Fluxo completo integrado
- ✅ **TypeScript Compilation**: All files passing type checking

### Componentes & UX
- ✅ **6 Serviços Clínicos**: Fisioterapia, Osteopatia, Pilates, Massagem, Terapia da Fala, Nutrição
- ✅ **4 Terapeutas**: Com ratings e disponibilidade
- ✅ **Bottom Tab Navigation**: Navegação intuitiva
- ✅ **Skeleton Loaders**: Loading states em todas as telas de dados
- ✅ **Toast Notifications**: Feedback visual para ações
- ✅ **Form Validation**: Hook-based validation system
- ✅ **Error Boundaries**: Error handling robusto

## 🎨 Design

- **Cores**: Navy escuro (#2C3E50) + Ouro (#D4AF8F)
- **Tipografia**: Cormorant Garamond + DM Sans
- **Layout**: Mobile-first, responsivo para tablets
- **Animações**: Transições suaves e visuais elegantes

## 🚀 Como Começar

### Pré-requisitos

```bash
# Node.js 14+ e npm/yarn
node --version  # v14+
npm --version   # 6+

# Expo CLI
npm install -g expo-cli
```

### Instalação

```bash
# Clonar repositório
git clone <repo>
cd qlinica-app

# Instalar dependências
npm install
```

### Desenvolvimento

```bash
# Iniciar servidor Expo
npm start

# Opções:
npm run ios      # Abrir no simulador iOS (macOS apenas)
npm run android  # Abrir no emulador Android
npm run web      # Abrir na web

# Ou via Expo CLI:
expo start       # QR code para testar no telemóvel físico
```

## 🔨 Build & Deployment

### Build Android

```bash
# Via Expo Cloud Build (recomendado)
npm run build-android

# Ou localmente
eas build --platform android
```

### Build iOS

```bash
# Requer conta Apple Developer
npm run build-ios

# Ou
eas build --platform ios
```

## 📦 Estrutura do Projeto

```
qlinica-app/
├── App.tsx                      # Entry point
├── app.json                     # Expo config
├── package.json                 # Dependencies
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Home dashboard
│   │   ├── BookingsScreen.tsx   # Booking history
│   │   └── ProfileScreen.tsx    # User profile
│   ├── components/
│   │   └── TabBarIcon.tsx       # Navigation icons
│   └── constants/
│       ├── Colors.ts           # Color palette
│       └── Data.ts             # Mock data
└── assets/
    ├── icon.png
    ├── splash.png
    └── fonts/
```

## 🎯 Funcionalidades Adicionadas Recentemente (Session 4)

### ✅ Payment Integration
- ✅ **Payment Service**: Stripe integration ready with payment methods management
- ✅ **Payment Screen**: Professional payment UI with card form
- ✅ **usePayment Hook**: Easy integration of payment logic in components
- ✅ **Price Calculation**: Automatic VAT (23%) calculation for Portugal
- ✅ **Payment History**: Track all transactions
- ✅ **Security**: PCI compliance ready

### ✅ Advanced Analytics
- ✅ **Session Tracking**: Monitor user sessions and behavior
- ✅ **Conversion Funnel**: Track booking-to-payment conversion
- ✅ **Engagement Metrics**: User activity analysis
- ✅ **Event Batching**: Efficient analytics batching
- ✅ **Error Tracking**: Context-aware error reporting

### ✅ Error Recovery
- ✅ **Circuit Breaker**: Resilient error handling pattern
- ✅ **Exponential Backoff**: Smart retry strategies
- ✅ **Error Classification**: User-friendly error messages
- ✅ **Recovery Actions**: Automatic error resolution

### ✅ Testing Infrastructure
- ✅ **Mock Data**: Comprehensive mock data for testing
- ✅ **Test Builders**: Convenient test data generation
- ✅ **Performance Utilities**: Measure function execution time
- ✅ **Assertion Helpers**: Validate test data

## 🎯 Features em Desenvolvimento

### Próximo Sprint (P1)
- [ ] Stripe SDK Integration
  - [ ] Real card processing via Stripe
  - [ ] CardField component
  - [ ] Apple Pay support

- [ ] Analytics Dashboard
  - [ ] User metrics visualization
  - [ ] Conversion tracking dashboard
  - [ ] Revenue analytics

### Sprint 2 (P2)
- [ ] Password Reset Flow
- [ ] Foto de Perfil
- [ ] Chat com Terapeuta
- [ ] Reviews e Ratings (do lado do cliente)
- [ ] Pagamentos in-app (checkout flow)

### Sprint 3 (P3)
- [ ] Geolocalização
- [ ] Mapa de clínicas
- [ ] Integração com calendário do sistema
- [ ] Export de comprovante PDF
- [ ] A/B Testing

## 📊 Tech Stack

- **React Native** - Framework nativo
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação nativa com stack navigator
- **TypeScript** - Type safety completo
- **Axios** - HTTP client com interceptors
- **AsyncStorage** - Persistent storage local
- **React Hooks** - useContext, useState, useEffect, custom hooks
- **EAS Build** - Build serviços na cloud
- **Linear Gradient** - UI gradientes
- **Stripe** - Payment processing (ready for integration)
- **Firebase** - Authentication & real-time database

### Services Implementados
- **authService** - Autenticação com JWT
- **bookingService** - Gestão de agendamentos
- **paymentService** - Processamento de pagamentos
- **analyticsService** - Event tracking
- **advancedAnalyticsService** - Advanced metrics & conversion
- **notificationService** - Push notifications
- **offlineSyncService** - Offline queue management
- **errorRecoveryService** - Error handling & resilience

### Componentes Customizados
- Button (4 variants, 3 sizes, loading states)
- Card (3 variants)
- FormInput (com validação)
- SkeletonLoader (shimmer animations)
- Toast (4 tipos, auto-dismiss)
- ErrorBoundary
- AlertModal
- Rating (stars)
- Badge
- Checkbox
- E mais...

## 🔐 Segurança ✅

- ✅ Autenticação JWT
- ✅ Token refresh logic
- ✅ Secure token storage
- ⏳ Encriptação de dados sensíveis (next)
- ⏳ GDPR compliance (next)
- ⏳ Rate limiting no backend (next)

## 🧪 Development

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Debugging

```bash
# Enable React DevTools
npm run debug

# View logs
npm run logs

# Clear cache
npm run clean
```

## 📖 Component Library

All reusable components are in `src/components/` with:
- TypeScript types
- JSDoc comments
- Usage examples
- Accessibility features

Import example:
```typescript
import { Button, Card, Toast, SkeletonLoader } from './components';
```

## 🎓 Development Patterns

### Custom Hooks
```typescript
// Form validation
const { values, errors, setFieldValue, validateForm } = useFormValidation({...});

// Safe API calls with retry
const { data, loading, error } = useSafeAPI('/endpoint');

// Authentication
const { user, login, register, logout, isAuthenticated } = useAuth();
```

### Context API
- AuthContext: Authentication state
- BookingContext: Booking flow state
- ToastContext: Notifications

## 📊 Performance

- ✅ Skeleton loaders for perceived performance
- ✅ Lazy image loading
- ✅ Component memoization
- ✅ Optimized re-renders
- ✅ Bundle size: ~850KB (uncompressed)

## 🐛 Troubleshooting

### Build fails
```bash
# Clear cache and reinstall
npm run clean
npm install
npm start
```

### Metro bundler issues
```bash
# Reset bundler
expo start --clear
```

### Debugger not working
```bash
# Restart debugger
npm run debug:restart
```

## 📞 Support

- 📧 Email: dev@qlinica.pt
- 📱 GitHub Issues: [Qlinica App Issues](https://github.com/Sepoloff/qlinica-app/issues)
- 📚 Documentation: See `/docs` folder

## 📄 Licença

Proprietary - Qlinica

---

**Criada em**: Março 2026  
**Última atualização**: 22 Março 2026  
**Status**: MVP Ready 🚀 (80% complete)  
**Próximo Sprint**: API Integration Testing
