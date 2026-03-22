# Qlinica App - Deployment Guide

Guia completo para fazer build e deploy da app para iOS App Store e Google Play Store.

---

## 📋 Pré-requisitos

### Para Android (Google Play Store)
- [ ] Conta Google Play Developer ($25 taxa única)
- [ ] Keystore gerada (ou EAS irá gerar)
- [ ] Versão incrementada em app.json
- [ ] Mínimo 512x512px icon
- [ ] Screenshots (3 obrigatórios)
- [ ] Descrição e keywords
- [ ] Privacy policy URL
- [ ] Contact email

### Para iOS (App Store)
- [ ] Conta Apple Developer ($99/ano)
- [ ] Mac com Xcode instalado
- [ ] Apple ID e app-specific password
- [ ] Certificates e provisioning profiles
- [ ] Versão incrementada em app.json
- [ ] Mínimo 1024x1024px icon
- [ ] Screenshots para iPhone e iPad
- [ ] Descrição, keywords, categorias
- [ ] Privacy policy URL
- [ ] ESRB rating assessment

---

## 🔧 Pré-Deploy Configuration

### 1. Update app.json

```json
{
  "expo": {
    "name": "Qlinica",
    "slug": "qlinica",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": "./assets/splash.png",
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.qlinica.app",
      "buildNumber": "1",
      "config": {
        "usesNonExemptEncryption": false
      },
      "privacyManifests": [
        {
          "NSPrivacyTracking": false,
          "NSPrivacyTrackingDomains": []
        }
      ]
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2C3E50"
      },
      "package": "com.qlinica.app",
      "versionCode": 1,
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.CAMERA",
        "android.permission.LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "scheme": "qlinica",
    "plugins": [
      "expo-notifications"
    ]
  }
}
```

### 2. Environment Variables

Criar `.env.production`:
```
REACT_APP_API_URL=https://api.qlinica.com/api
REACT_APP_ENVIRONMENT=production
REACT_APP_SENTRY_DSN=https://key@sentry.io/project
```

### 3. Version Management

```bash
# Increment version
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# This updates app.json and package.json
```

### 4. Update Changelog

```markdown
# Changelog

## [1.0.0] - 2026-03-22

### Added
- Initial release
- User authentication (login/register)
- Complete booking flow
- Payment integration
- Push notifications
- Dark theme support

### Fixed
- API integration issues
- UI responsive design

### Security
- JWT token encryption
- Password strength validation
- User data protection
```

---

## 🤖 Build with EAS (Recommended)

EAS (Expo Application Services) é recomendado para builds simplificados.

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Configure EAS

```bash
cd /Users/marcelolopes/qlinica-app
eas init
# Selecionar projeto existente ou criar novo
```

Criar `eas.json`:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_ID",
        "appleId": "your-email@example.com",
        "ascAppPassword": "YOUR_APP_PASSWORD",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccount": "path/to/service-account.json"
      }
    }
  }
}
```

### 3. Build Android (EAS)

```bash
# Preview build (testing)
eas build --platform android --profile preview

# Production build (submit to store)
eas build --platform android --profile production

# Ou direto:
npm run build-android
```

Tempo estimado: 10-15 minutos

### 4. Build iOS (EAS)

```bash
# Preview build (testing)
eas build --platform ios --profile preview

# Production build (submit to store)
eas build --platform ios --profile production

# Ou direto:
npm run build-ios
```

Tempo estimado: 15-20 minutos

---

## 📦 Manual Build (Alternativa)

Se preferir build local:

### Android Manual Build

```bash
# 1. Gerar keystore (primeira vez apenas)
keytool -genkey-dv \
  -keystore ~/my-release-key.jks \
  -alias my-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# 2. Build APK
eas build --platform android --local

# Ou com Expo Go:
expo build:android -t apk

# APK estará em ./android/app/release/
```

### iOS Manual Build

```bash
# 1. Gerar keychain
security create-keychain -p password ~/Library/Keychains/ios-build.keychain

# 2. Build IPA
eas build --platform ios --local

# Ou com Xcode:
cd ios
xcodebuild -workspace Qlinica.xcworkspace \
  -scheme Qlinica \
  -configuration Release \
  -derivedDataPath build
```

---

## 🎮 Testing Build Localmente

### Android

```bash
# Instalar APK em emulador/device
adb install app-release.apk

# Ou via Expo:
npm run android
```

### iOS

```bash
# Instalar no simulador
xcrun simctl install booted app.ipa

# Ou via Expo:
npm run ios
```

### Testar todos os flows
- [ ] Login/Register
- [ ] Booking completo
- [ ] Payment (test mode)
- [ ] Notifications
- [ ] Dark mode
- [ ] Offline sync

---

## 🎯 Submit to App Stores

### Android - Google Play

#### 1. Criar app no Google Play Console

1. Ir para [play.google.com/console](https://play.google.com/console)
2. Criar novo app
3. Preencher detalhes básicos
4. Ativar categories e content rating

#### 2. Preparar Listagem

- **Title**: Qlinica - Agendamentos Clínicos
- **Short description**: Reserve consultas clínicas online
- **Full description**: 
  ```
  Qlinica é a forma mais fácil de agendar consultas clínicas.
  
  Funcionalidades:
  - Agendamentos online 24/7
  - Múltiplos serviços clínicos
  - Terapeutas experientes
  - Pagamento seguro
  - Notificações em tempo real
  - Dark mode
  
  Serviços:
  - Fisioterapia
  - Osteopatia
  - Pilates
  - Massagem
  - Terapia da Fala
  - Nutrição
  ```

#### 3. Adicionar Screenshots

Mínimo 2, máximo 8 por tipo de device:
- Telemóvel: 1080x1920px, PNG/JPG
- Tablet: 1920x1080px, PNG/JPG

Exemplos:
- Screenshot 1: Home screen
- Screenshot 2: Booking flow
- Screenshot 3: Confirmação
- Screenshot 4: Histórico

#### 4. Icone e Banner

- **Icon**: 512x512px (JPEG/PNG/GIF)
- **Feature Graphic**: 1024x500px (PNG/JPG)
- **Promo Graphic**: 180x120px (PNG/JPG)

#### 5. Content Rating

Responder questionário IAMAI/Google Play:
- Violence: None
- Drugs: None
- Profanity: None
- Adult content: None
- Alcohol/Tobacco: None
- Gambling: None

#### 6. Upload APK

1. Ir a "Release" → "Production"
2. Upload APK gerado
3. Preencher release notes
4. Revisar e submeter

Tempo de review: 1-3 horas

### iOS - App Store

#### 1. Criar app no App Store Connect

1. Ir para [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. My Apps → Create New App
3. Preencher informações:
   - **Platform**: iOS, macOS (opcional)
   - **App Name**: Qlinica
   - **Primary Language**: Portuguese (Portugal)
   - **Bundle ID**: com.qlinica.app
   - **SKU**: qlinica-001

#### 2. Preparar App Information

- **Subtitle**: Agendamentos clínicos
- **Category**: Medical
- **Privacy Policy**: https://qlinica.app/privacy
- **Content Rights**: Selecionar "Yes"

#### 3. Pricing & Availability

- **Regions**: Portugal + resto EU
- **Price**: Free (0.00€)
- **Availability**: Todos

#### 4. Screenshots

Para cada tamanho de device (iPhone 6.7", 6.1", 5.5", etc):
- 6-10 screenshots recomendados
- Formato: 2208x1242px minimum
- PNG/JPG

#### 5. Preview Video (Opcional)

- Máximo 30 segundos
- MP4, MOV, ProRes
- 4K preferred

#### 6. Keywords & Description

**Keywords** (máximo 100 caracteres):
```
agendamentos, consultas, fisioterapia, saúde, clínica
```

**Description**:
```
Qlinica é a plataforma de agendamentos clínicos mais prática de Portugal.

Agende consultas em segundos:
• Fisioterapia
• Osteopatia
• Pilates
• Massagem terapêutica
• Terapia da fala
• Nutrição clínica

Características:
✓ Agendamentos online 24/7
✓ Múltiplos terapeutas
✓ Pagamento seguro
✓ Notificações automáticas
✓ Interface intuitiva
✓ Modo escuro

Comece hoje - grátis!
```

**Support URL**: https://qlinica.app/support
**Marketing URL**: https://qlinica.app

#### 7. Ratings & Review Information

- **Age Rating**: 4+
- **Alcohol, Tobacco, Drugs**: No
- **Violence**: No
- **Sexual Content**: No
- **Gambling**: No
- **Medical/Health Info**: Yes (informational only)

#### 8. Upload Build

Via Transporter ou TestFlight:

```bash
# Usar EAS
eas submit --platform ios --profile production

# Ou manual com Transporter
# 1. Download Transporter do App Store
# 2. Selecionar IPA
# 3. Upload
```

#### 9. Review Status

- **Before Review**: 24-48 horas para preparar
- **In Review**: 24-48 horas processamento
- **Approved/Rejected**: Email notification

Tempo total: 2-5 dias

---

## 🚀 Launch Checklist

Antes de submeter:

- [ ] Versão incrementada
- [ ] Changelog atualizado
- [ ] API_URL para production
- [ ] Analytics configurado
- [ ] Error reporting ativo
- [ ] Privacy policy finalizada
- [ ] Icons/Screenshots prontos
- [ ] Testing completo passado
- [ ] Performance otimizada
- [ ] No console errors
- [ ] Acessibilidade testada
- [ ] Dark mode testado
- [ ] Redes testadas (WiFi + 4G)

---

## 📱 Post-Launch Monitoring

### Primeiro Mês

- [ ] Monitorar crash reports diariamente
- [ ] Responder reviews no Play Store
- [ ] Verificar downloads/retention
- [ ] Otimizar based on feedback
- [ ] Hotfix para bugs críticos

### Métricas para Acompanhar

```
Daily Active Users (DAU)
Monthly Active Users (MAU)
Crash Rate
Session Duration
Booking Conversion Rate
Payment Success Rate
App Store Rating
Review Sentiment
```

### Alertas para Configurar

- Crash rate > 1%
- Rating < 3.5 stars
- Negative reviews aumentando
- Slow API responses

---

## 🔄 Update Strategy

### Minor Updates (1.0.1, 1.0.2)
- Bug fixes
- Performance improvements
- Pode ignorar Play Store review às vezes

### Feature Updates (1.1.0, 1.2.0)
- Novos features
- Exige Play Store review (1-3 dias)
- Sempre increment version

### Major Updates (2.0.0)
- Redesign ou mudanças significativas
- Exige revisão cuidada
- Pode quebrar compatibilidade

---

## 🎯 Version Roadmap

```
v1.0.0 (2026-03-22) - MVP Launch
├─ Basic booking flow
├─ Authentication
└─ Payment integration

v1.1.0 (2026-04-15) - Polish & Features
├─ Reviews system
├─ Advanced filtering
└─ Dark mode improvements

v1.2.0 (2026-05-15) - Engagement
├─ Loyalty program
├─ Referral system
└─ Push campaigns

v2.0.0 (2026-07-01) - Major Revision
├─ Redesign UI
├─ AI recommendations
└─ Video consultations
```

---

## 🆘 Troubleshooting Deploy

### Build falha com "error: ENOSPC"
```bash
# Limpar build cache
rm -rf node_modules .expo
npm install
```

### EAS build timeout
```bash
# Tentar novamente
eas build --platform android --clear-cache

# Ou usar local build
eas build --platform android --local
```

### TestFlight rejection
- Verificar requirements em Human Guidelines
- Fornecer demo account (não bloqueado por paywall)
- Responder feedback do reviewer

### App Store rejection
Razões comuns:
1. Privacy policy não tem link funcional
2. Funcionalidades não funcionam (beta features)
3. Crashes ou bugs
4. Não segue guidelines de design

Soluções:
- Ler rejection feedback cuidadosamente
- Fazer fix conforme indicado
- Resubmeter com update notes

---

## 📚 Recursos Úteis

- [EAS Build Docs](https://docs.expo.dev/eas-update/)
- [Google Play Console Help](https://support.google.com/googleplay)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [iOS Human Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Android Policy Center](https://play.google.com/about/privacy-security-deception/)

---

**Última atualização**: 2026-03-22
**Versão**: 1.0.0

Seguir este guia garante deploy sem problemas para ambas lojas.
