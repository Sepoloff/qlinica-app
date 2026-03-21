# Qlinica - iOS & Android App

Uma aplicação React Native de agendamento de consultas clínicas para iOS e Android, criada com Expo.

## 📱 Plataformas Suportadas

- ✅ **iOS** (iPhone, iPad)
- ✅ **Android** (Phones, Tablets)
- ✅ **Web** (via Expo Web)

## 🎯 Funcionalidades

- **Home Screen**: Dashboard com próximas consultas e grid de serviços
- **6 Serviços Clínicos**: Fisioterapia, Osteopatia, Pilates, Massagem, Terapia da Fala, Nutrição
- **Bookings Screen**: Histórico de marcações com abas (Próximas/Passadas)
- **Profile Screen**: Dados pessoais, preferências de notificação, histórico
- **4 Terapeutas**: Com ratings e disponibilidade
- **Bottom Tab Navigation**: Navegação simples e intuitiva
- **Dark Theme**: Design premium com paleta ouro/cinzento

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

## 🎯 Próximas Features

- [ ] Fluxo completo de agendamento (serviço → terapeuta → data/hora)
- [ ] Integração com API de backend
- [ ] Push notifications
- [ ] Geolocalização
- [ ] Pagamentos in-app
- [ ] Chat com terapeuta
- [ ] Reviews e ratings

## 📊 Tech Stack

- **React Native** - Framework nativo
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação nativa
- **TypeScript** - Type safety
- **EAS Build** - Build serviços na cloud

## 🔐 Segurança

- [ ] Autenticação segura
- [ ] Encriptação de dados
- [ ] GDPR compliance
- [ ] Rate limiting

## 📄 Licença

Proprietary - Qlinica

---

**Criada em**: Março 2026
**Status**: Em desenvolvimento 🚀
