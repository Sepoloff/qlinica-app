# 🎯 PRIORIDADE 2: Fluxo de Agendamento - Melhorias

Data: 22 de Março de 2026 | Hora: 18:17 (Lisbon)

## 📋 Status Atual

Os screens do booking flow estão implementados mas precisam de melhorias:
- ✅ ServiceSelectionScreen.tsx
- ✅ TherapistSelectionScreen.tsx
- ✅ CalendarSelectionScreen.tsx
- ✅ BookingSummaryScreen.tsx

Problema encontrado:
- ❌ Há dois contextos similares: `BookingContext` e `BookingFlowContext`
- ❌ Não está claro qual usar
- ❌ Pode haver inconsistência de estado entre screens

---

## 🎯 Melhorias Recomendadas

### 1. Consolidar Contextos
**Opção A: Usar BookingFlowContext (recomendado)**
- Mais robusto com `submitBooking()` integrado
- Tem `isSubmitting` e `error` states
- Atualmente usado em ServiceSelectionScreen

**Opção B: Usar BookingContext (mais simples)**
- Mais enxuto
- Melhor para apenas guardar estado

**Ação**: Consolidar para usar apenas `BookingFlowContext` em todos os screens

### 2. Melhorar Persistência Entre Screens
```typescript
// ❌ Problema atual
- Screen 1: Seleciona serviço
- Screen 2: Seleciona terapeuta
- Screen 3: Seleciona data/hora
- Se voltar para Screen 1, estado pode estar perdido

// ✅ Solução
- Usar AsyncStorage para persistir booking em progresso
- Recuperar ao voltar para screen anterior
- Mostrar "Continuar booking anterior?" se houver
```

### 3. Validação Entre Screens
```typescript
// ✅ Implementar em cada screen
- ServiceSelectionScreen: validar se serviço está selecionado
- TherapistSelectionScreen: validar se terapeuta está disponível no dia
- CalendarSelectionScreen: validar se data é futura e horário é válido
- BookingSummaryScreen: validar todos os dados antes de criar

// ✅ Mostrar erros claros
- Toast para erro rápido
- Modal para erro crítico
```

### 4. Progress Indicator
```typescript
// ✅ Adicionar em todos os screens
<ProgressIndicator 
  current={1} 
  total={4} 
  label="Serviço"
/>

// Screens:
// 1: ServiceSelectionScreen
// 2: TherapistSelectionScreen
// 3: CalendarSelectionScreen
// 4: BookingSummaryScreen
```

### 5. Back Button Behavior
```typescript
// ✅ Implementar
- Back button volta para anterior
- Mantém estado selecionado
- No ServiceSelectionScreen, confirma se deseja descartar booking

// Alert:
// "Descartar agendamento em progresso?"
// - Descartar: resetBooking()
// - Continuar: mantém estado
```

### 6. Retry Automático
```typescript
// ✅ Em BookingSummaryScreen
- Se createBooking falhar, mostrar retry button
- Com exponential backoff (implementado em API)
- Máximo 3 tentativas antes de erro final
```

### 7. State Persistence em AsyncStorage
```typescript
// ✅ Novo hook: useBookingPersistence
- Salva estado do booking em AsyncStorage após cada screen
- Recupera ao iniciar
- Limpa após sucesso ou cancelamento

const { bookingData } = useBookingPersistence({
  key: 'booking_in_progress',
  autoSave: true,
});
```

### 8. Melhorar UI/UX
```typescript
// ✅ ServiceSelectionScreen
- [ ] Mostrar todos os dados do serviço antes de selecionar
- [ ] Adicionar imagem do serviço (se disponível)
- [ ] Mostrar horário de funcionamento

// ✅ TherapistSelectionScreen
- [ ] Mostrar fotos dos terapeutas
- [ ] Mostrar rating e reviews
- [ ] Mostrar especialidades
- [ ] Filtrar por disponibilidade

// ✅ CalendarSelectionScreen
- [ ] Destacar datas com horários disponíveis
- [ ] Mostrar horários como grid interativo
- [ ] Impedir seleção de data passada
- [ ] Mostrar "Próximo horário disponível"

// ✅ BookingSummaryScreen
- [ ] Mostrar tudo em um resumo claro
- [ ] Permitir editar cada etapa (voltar)
- [ ] Mostrar preço total
- [ ] Mostrar confirmação visual após criar
```

---

## 🔄 Fluxo Recomendado

```
1. HomeScreen
   ↓
   [Clica "Agendar"]
   ↓
2. ServiceSelectionScreen
   - useBookingFlow.setBookingState({ serviceId })
   - Próximo botão habilitado após seleção
   ↓
3. TherapistSelectionScreen
   - Filtra terapeutas por serviço
   - useBookingFlow.setBookingState({ therapistId })
   - Próximo botão habilitado após seleção
   ↓
4. CalendarSelectionScreen
   - Mostra disponibilidade do terapeuta
   - useBookingFlow.setBookingState({ date, time })
   - Próximo botão habilitado após seleção
   ↓
5. BookingSummaryScreen
   - Mostra resumo completo
   - useBookingFlow.submitBooking()
   - Se sucesso → HomeScreen com notificação
   - Se erro → Retry button
```

---

## 📝 Checklist de Implementação

### Context Consolidation
- [ ] Remover BookingContext (ou deixar como deprecated)
- [ ] Usar BookingFlowContext em todos os screens
- [ ] Atualizar imports nos screens

### Persistência
- [ ] Criar `useBookingPersistence` hook
- [ ] Salvar estado em AsyncStorage após cada screen
- [ ] Recuperar ao abrir App
- [ ] Mostrar "Continuar booking anterior?" se houver

### Validação
- [ ] ServiceSelectionScreen: validar serviço selecionado
- [ ] TherapistSelectionScreen: validar terapeuta disponível
- [ ] CalendarSelectionScreen: validar data futura e horário válido
- [ ] BookingSummaryScreen: validar todos os dados

### Progress Indicator
- [ ] Implementar ProgressIndicator component
- [ ] Adicionar em todos os 4 screens
- [ ] Mostrar passo atual (1/4, 2/4, 3/4, 4/4)

### Back Button
- [ ] Implementar confirmação em ServiceSelectionScreen
- [ ] Manter estado ao voltar
- [ ] Testes de navegação

### Retry Logic
- [ ] Implementar retry em BookingSummaryScreen
- [ ] Usar exponential backoff
- [ ] Máximo 3 tentativas

### UI/UX
- [ ] Melhorar visual dos 4 screens
- [ ] Adicionar imagens/ícones
- [ ] Mostrar dados completos antes de próximo passo
- [ ] Animações suaves entre screens

### Testing
- [ ] Testar fluxo completo
- [ ] Testar back navigation
- [ ] Testar error scenarios
- [ ] Testar persistência com app kill

---

## 🚀 Próximas Ações

1. **Hoje**: Consolidar contextos e adicionar persistência
2. **Amanhã**: Implementar validações e retry logic
3. **Dia seguinte**: Melhorar UI/UX dos screens
4. **Testing**: Testes completos do fluxo

---

## 📊 Estimativa

- Consolidação: 30 min
- Persistência: 45 min
- Validações: 30 min
- Retry Logic: 20 min
- UI/UX: 60 min
- Testing: 45 min
- **Total**: ~4h

---

## 💡 Notes

- BookingContext está bem estruturado, pode ser mantido como wrapper simples
- BookingFlowContext tem submit logic que é importante manter
- Ambos podem coexistir, mas um deve ser principal
- Recomendação: BookingFlowContext como principal

