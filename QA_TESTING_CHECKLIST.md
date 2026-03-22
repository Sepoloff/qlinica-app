# Qlinica App - QA Testing Checklist

Checklist completo para testes da aplicação antes de deploy.

---

## 📱 Pré-requisitos de Teste

- [ ] Expo CLI instalado (`npm install -g expo-cli`)
- [ ] Node.js 14+ e npm/yarn
- [ ] Simulador iOS (macOS) ou Android (Windows/Mac/Linux)
- [ ] Dispositivo físico com app Expo instalada (opcional)
- [ ] Backend rodando (mock server ou real)
- [ ] Navegador para testes web

---

## 🔐 Autenticação (Login/Register)

### Login Tests
- [ ] Login com credenciais válidas funciona
- [ ] Login com email inválido mostra erro
- [ ] Login com password inválida mostra erro
- [ ] Token é armazenado em AsyncStorage
- [ ] Auto-login funciona ao abrir app
- [ ] Logout limpa token e dados
- [ ] Logout redireciona para AuthScreen

### Register Tests
- [ ] Register com email inválido mostra erro
- [ ] Register com password fraca mostra erro (< 8 chars, sem uppercase, sem número)
- [ ] Register com dados válidos cria conta
- [ ] Nova conta faz login automaticamente
- [ ] Email não duplicado (validação backend)
- [ ] Password é armazenado com hash

### Password Reset Tests
- [ ] Solicitar reset funciona
- [ ] Email de reset é recebido
- [ ] Link do email abre app corretamente
- [ ] Novo password é aceito
- [ ] Login com novo password funciona

---

## 🏠 Home Screen Tests

### Display Tests
- [ ] Screen carrega sem erros
- [ ] Services grid exibe 6 serviços
- [ ] Upcoming bookings aparecem (máximo 3)
- [ ] Skeleton loaders aparecem durante carregamento
- [ ] Greeting message mostra nome do user

### Interaction Tests
- [ ] "Agendar Consulta" navega para ServiceSelectionScreen
- [ ] Clicar em serviço navega corretamente
- [ ] Pull-to-refresh funciona
- [ ] Refresh atualiza dados
- [ ] Error message aparece se falhar carregamento

### Data Tests
- [ ] Services carregam do backend
- [ ] Bookings carregam para user autenticado
- [ ] Prices exibem corretamente
- [ ] Ratings exibem corretamente (se aplicável)

---

## 📅 Booking Flow Tests

### Service Selection Screen
- [ ] Grid de 6 serviços exibe corretamente
- [ ] Descrição e preço aparecem
- [ ] Clicar em serviço seleciona
- [ ] Texto "Próxima" aparece
- [ ] Back button funciona

### Therapist Selection Screen
- [ ] Terapeutas filtrados por serviço
- [ ] Rating e reviews contam exibem
- [ ] Avatar/foto do terapeuta aparece
- [ ] Bio do terapeuta é legível
- [ ] Clicar em terapeuta seleciona
- [ ] Back button não perde dados

### Calendar/Date Selection Screen
- [ ] Calendar picker abre
- [ ] Datas passadas são desabilitadas
- [ ] Time slots carregam corretamente
- [ ] Horários indisponíveis são cinzentos
- [ ] Clicar em horário seleciona
- [ ] Data e hora selecionadas são exibidas

### Booking Summary Screen
- [ ] Serviço, terapeuta, data e hora aparecem
- [ ] Preço sem VAT aparece
- [ ] VAT (23%) é calculado corretamente
- [ ] Total com VAT aparece
- [ ] Notas opcionais podem ser editadas
- [ ] "Confirmar Agendamento" cria booking
- [ ] Sucesso mostra toast notification
- [ ] Redireciona para BookingsScreen

### Error Cases
- [ ] Slot já não disponível mostra erro
- [ ] Network error mostra retry option
- [ ] Timeout mostra retry option
- [ ] Cancelar booking (back button) não salva

---

## 📋 Bookings Screen Tests

### Display Tests
- [ ] Abas "Próximas" e "Passadas" funcionam
- [ ] Bookings aparecem em abas corretas
- [ ] Booking cards exibem informações corretas
- [ ] Data e hora formatadas corretamente (português)
- [ ] Terapeuta e serviço nomes aparecem

### Próximas Consultas
- [ ] Apenas bookings futuros aparecem
- [ ] Bookings ordenados por data (mais próximos primeiro)
- [ ] "Remarcar" navega para calendar
- [ ] "Cancelar" mostra confirmação
- [ ] Confirmar cancelamento atualiza lista

### Passadas Consultas
- [ ] Apenas bookings passados aparecem
- [ ] Bookings ordenados por data (mais recentes primeiro)
- [ ] "Ver detalhes" navega para BookingDetailsScreen
- [ ] "Deixar review" abre review modal

### Interaction Tests
- [ ] Swipe entre abas funciona (se implementado)
- [ ] Pull-to-refresh atualiza lista
- [ ] Spinner aparece durante refresh
- [ ] Empty state aparece se não houver bookings
- [ ] Clicar em booking abre detalhes

---

## 👤 Profile Screen Tests

### Display Tests
- [ ] Nome do user aparece
- [ ] Email aparece
- [ ] Phone (se preenchido) aparece
- [ ] Avatar aparece (ou placeholder)

### Edit Profile Tests
- [ ] Clicar "Editar Perfil" abre modal
- [ ] Nome pode ser editado
- [ ] Phone pode ser editado
- [ ] Phone validation funciona (+351 para Portugal)
- [ ] "Salvar" atualiza perfil
- [ ] Toast mostra sucesso/erro

### Preferences Tests
- [ ] Notificações SMS podem ser ativadas/desativadas
- [ ] Notificações Email podem ser ativadas/desativadas
- [ ] Notificações Push podem ser ativadas/desativadas
- [ ] Preferências são persistidas (AsyncStorage)
- [ ] Preferências carregam ao voltar para screen

### Logout Tests
- [ ] "Logout" mostra confirmação
- [ ] Confirmar logout limpa dados
- [ ] Redireciona para AuthScreen
- [ ] Token é removido
- [ ] AsyncStorage é limpo

---

## 💳 Payment Tests (se implementado)

### Payment Screen
- [ ] Payment modal abre
- [ ] Card number field valida
- [ ] Expiry date field valida
- [ ] CVC field valida
- [ ] "Pagar" processa pagamento
- [ ] Sucesso mostra mensagem
- [ ] Erro mostra retry option

### Payment History
- [ ] Pagamentos anterior aparecem em lista
- [ ] Status (succeeded/failed) aparece
- [ ] Amount e data aparecem
- [ ] Clicar mostra detalhes completos

---

## 🎨 UI/UX Tests

### Visual Consistency
- [ ] Cores (navy + ouro) aplicadas corretamente
- [ ] Fonts (Cormorant Garamond + DM Sans) carregam
- [ ] Spacing e padding consistente (16-20px)
- [ ] Border radius consistente (14px)
- [ ] Sombras aparecem em cards

### Dark Mode
- [ ] Dark mode toggle funciona
- [ ] Cores ajustam corretamente
- [ ] Texto legível em ambos modos
- [ ] Preferência salva e persiste

### Responsive Design
- [ ] Layouts funcionam em diferentes tamanhos
- [ ] iPhone (compact)
- [ ] iPad (medium)
- [ ] Android tablets (large)

### Loading States
- [ ] Loading spinners aparecem
- [ ] Botões desabilitados durante ação
- [ ] Toast messages aparecem
- [ ] Skeleton loaders animam

### Animations
- [ ] Transições entre screens suaves
- [ ] Loading spinner gira
- [ ] List animations funciona
- [ ] Touch feedback visual aparece

---

## 📡 Network Tests

### Normal Connection
- [ ] App funciona em WiFi
- [ ] App funciona em 4G/5G
- [ ] Dados carregam em tempo razoável

### Poor Connection
- [ ] App não trava com conexão lenta
- [ ] Retry logic funciona após timeout
- [ ] Spinner aparece durante retry
- [ ] Error message legível

### Offline Mode
- [ ] App não trava quando offline
- [ ] Cached data aparece (se implementado)
- [ ] Sync queue salva ações (se implementado)
- [ ] Sync acontece quando volta online

### Network Switch
- [ ] Switch WiFi ↔ 4G sem erros
- [ ] Dados atualizam após switch
- [ ] Requests não duplicados

---

## 🔒 Security Tests

### Token Management
- [ ] Token armazenado em AsyncStorage (seguro)
- [ ] Token enviado em header Authorization
- [ ] Token removido ao logout
- [ ] Token refreshado se expirado (401 handling)

### Input Validation
- [ ] SQL injection não possível
- [ ] XSS não possível (inputs escapados)
- [ ] CSRF tokens (se aplicável)
- [ ] Password não armazenado em plaintext

### Data Privacy
- [ ] Sensitive data não é logado
- [ ] Personal info não é visível sem auth
- [ ] User só vê seus próprios dados

---

## 🐛 Error Handling Tests

### Network Errors
- [ ] 500 error mostra mensagem amigável
- [ ] 404 error mostra mensagem específica
- [ ] 401 (token expirado) faz logout
- [ ] 429 (rate limited) com retry

### Form Errors
- [ ] Required fields validados
- [ ] Invalid email rejected
- [ ] Weak password rejected
- [ ] Error messages em português

### Recovery
- [ ] Retry button funciona
- [ ] Back button funciona
- [ ] State não é perdido em erros

---

## ⚡ Performance Tests

### Load Times
- [ ] App inicia em < 3 segundos
- [ ] Screens carregam em < 1 segundo
- [ ] Imagens carregam rapido (lazy loading)
- [ ] Listas não lagam (virtualization)

### Memory Usage
- [ ] App não vaza memória
- [ ] Memory usage constante após 10min
- [ ] Sem crashes inexplicados

### Battery Usage
- [ ] Não drena bateria rapidamente
- [ ] Background tasks otimizados
- [ ] Notifications não causam wake-ups

### Bundle Size
- [ ] APK size < 50MB
- [ ] IPA size < 100MB
- [ ] JS bundle < 500KB

---

## 📊 Analytics Tests

### Event Tracking
- [ ] Impressões de screen tracked
- [ ] Cliques em botões tracked
- [ ] Conversões de booking tracked
- [ ] Erros tracked com contexto

### No PII in Analytics
- [ ] Emails não são trackados
- [ ] Passwords não são trackados
- [ ] Credenciais não são logadas
- [ ] User IDs são anonimizados (se possível)

---

## 🧪 Device-Specific Tests

### iOS
- [ ] App roda em iOS 13+
- [ ] iPhone compatibility
- [ ] iPad landscape mode
- [ ] Notch/Safe area respeitado
- [ ] Status bar tem cor correta
- [ ] Back gesture funciona

### Android
- [ ] App roda em Android 8+
- [ ] Phone compatibility
- [ ] Tablet landscape mode
- [ ] Notch/Cutout respeitado
- [ ] Navigation bar respeita
- [ ] Back button funciona

### Web
- [ ] App roda em Chrome/Firefox/Safari
- [ ] Responsive em diferentes viewports
- [ ] Touch gestures funcionam
- [ ] Teclado funciona

---

## ✅ Final Checklist

### Before Release
- [ ] Todos os testes acima passam
- [ ] README.md está atualizado
- [ ] CHANGELOG.md está atualizado
- [ ] Versão incrementada em app.json
- [ ] API_URL para production
- [ ] Analytics enabled
- [ ] Error reporting enabled
- [ ] Crash logs enabled

### Deployment
- [ ] APK gerado e testado
- [ ] IPA gerado e testado
- [ ] Build no simulador/emulador
- [ ] Sign certificates corretos
- [ ] Privacy policy accepted
- [ ] LGPD/GDPR compliant

### Post-Release
- [ ] Monitor crash reports
- [ ] Monitor analytics
- [ ] Check user feedback
- [ ] Fix bugs rapidamente
- [ ] Plan próxima release

---

## 🎯 Performance Benchmarks

| Métrica | Target | Atual |
|---------|--------|-------|
| App Start | < 3s | ? |
| Screen Load | < 1s | ? |
| API Response | < 2s | ? |
| APK Size | < 50MB | ? |
| Memory Usage | < 100MB | ? |
| Battery (24h) | > 80% | ? |

---

## 📝 Test Report Template

```markdown
# Test Report - [Date]

## Environment
- Device: [iPhone 13 / Samsung Galaxy / Web]
- OS Version: [iOS 15.2 / Android 12 / Chrome 98]
- App Version: [1.0.0]
- Backend: [Mock Server / Real Backend]

## Results
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Skipped: [X]

## Bugs Found
1. [Bug #1 - Priority: High]
   - Steps to reproduce
   - Expected vs Actual
   
2. [Bug #2 - Priority: Medium]
   - ...

## Notes
- [Any additional notes]
```

---

**Última atualização**: 2026-03-22
**Versão**: 1.0.0

Usar como guia durante testes. Marcar checkboxes conforme progresso.
