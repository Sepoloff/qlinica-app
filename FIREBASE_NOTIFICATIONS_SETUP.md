# Firebase Notifications Setup - Qlinica App

## 📢 Notificações Automáticas para Reservas

Este guia mostra como configurar notificações Firebase com fallback para expo-notifications.

---

## 1️⃣ **Instalação de Dependências**

```bash
npm install expo-notifications firebase
# Ou se usar @react-native-firebase:
# npm install @react-native-firebase/messaging
```

Já incluído em `package.json`:
- `expo-notifications: ~0.20.1`
- `firebase: ^12.11.0`

---

## 2️⃣ **Configuração do Serviço de Notificações**

### Arquivo: `src/services/notificationService.ts`

```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuração de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  bookingId?: string;
}

class NotificationService {
  /**
   * Solicitar permissão para notificações
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissões de notificações:', error);
      return false;
    }
  }

  /**
   * Obter token de notificação (para Firebase Cloud Messaging)
   */
  static async getNotificationToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        // Expo Notifications token
        const { data } = await Notifications.getExpoPushTokenAsync();
        return data;
      } else if (Platform.OS === 'ios') {
        // iOS push token
        const { data } = await Notifications.getExpoPushTokenAsync();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter token de notificação:', error);
      return null;
    }
  }

  /**
   * Enviar notificação local
   */
  static async sendLocalNotification(payload: NotificationPayload): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          badge: 1,
        },
        trigger: { seconds: 1 }, // Imediato
      });
      return notificationId;
    } catch (error) {
      console.error('Erro ao enviar notificação local:', error);
      throw error;
    }
  }

  /**
   * Agendar notificação para o futuro
   */
  static async scheduleNotification(
    payload: NotificationPayload,
    secondsFromNow: number
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
        },
        trigger: { seconds: secondsFromNow },
      });
      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      throw error;
    }
  }

  /**
   * Cancelar notificação
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
    }
  }

  /**
   * Listener para notificações recebidas (foreground)
   */
  static onNotificationReceived(
    callback: (notification: Notifications.Notification) => void
  ): () => void {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Listener para notificações clicadas
   */
  static onNotificationTap(
    callback: (response: Notifications.NotificationResponse) => void
  ): () => void {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const notificationService = NotificationService;
```

---

## 3️⃣ **Notificações de Reservas**

### Criar Arquivo: `src/services/bookingNotificationService.ts`

```typescript
import { notificationService, NotificationPayload } from './notificationService';
import type { Booking } from './bookingService';

class BookingNotificationService {
  /**
   * Notificar criação de reserva (offline para online)
   */
  static async notifyBookingCreated(booking: Booking): Promise<void> {
    const payload: NotificationPayload = {
      title: '✅ Reserva Criada',
      body: `Sua reserva foi confirmada para ${booking.date} às ${booking.time}`,
      bookingId: booking.id,
      data: {
        action: 'booking_created',
        bookingId: booking.id,
      },
    };

    await notificationService.sendLocalNotification(payload);
  }

  /**
   * Notificar confirmação de reserva (após servidor confirmar)
   */
  static async notifyBookingConfirmed(booking: Booking): Promise<void> {
    const payload: NotificationPayload = {
      title: '🎯 Reserva Confirmada',
      body: `${booking.therapist?.name || 'Seu terapeuta'} confirmou a sessão de ${booking.service?.name || 'terapia'}`,
      bookingId: booking.id,
      data: {
        action: 'booking_confirmed',
        bookingId: booking.id,
      },
    };

    await notificationService.sendLocalNotification(payload);
  }

  /**
   * Lembrete 24 horas antes
   */
  static async scheduleBookingReminder(booking: Booking): Promise<void> {
    try {
      const bookingDate = new Date(`${booking.date}T${booking.time}`);
      const now = new Date();
      const secondsUntil = (bookingDate.getTime() - now.getTime()) / 1000;

      if (secondsUntil > 86400) { // Mais de 24 horas
        const reminderTime = secondsUntil - 86400; // 24 horas antes

        const payload: NotificationPayload = {
          title: '📅 Lembrete de Reserva',
          body: `Sua sessão com ${booking.therapist?.name || 'seu terapeuta'} é amanhã às ${booking.time}`,
          bookingId: booking.id,
          data: {
            action: 'booking_reminder',
            bookingId: booking.id,
          },
        };

        await notificationService.scheduleNotification(payload, reminderTime);
      }
    } catch (error) {
      console.error('Erro ao agendar lembrete de reserva:', error);
    }
  }

  /**
   * Notificar cancelamento
   */
  static async notifyBookingCancelled(booking: Booking, reason?: string): Promise<void> {
    const payload: NotificationPayload = {
      title: '❌ Reserva Cancelada',
      body: reason || 'Sua reserva foi cancelada',
      bookingId: booking.id,
      data: {
        action: 'booking_cancelled',
        bookingId: booking.id,
      },
    };

    await notificationService.sendLocalNotification(payload);
  }

  /**
   * Notificar reavaliação (feedback)
   */
  static async notifyForReview(booking: Booking): Promise<void> {
    const payload: NotificationPayload = {
      title: '⭐ Como foi sua sessão?',
      body: `Avalie sua sessão com ${booking.therapist?.name} e ajude-nos a melhorar`,
      bookingId: booking.id,
      data: {
        action: 'request_review',
        bookingId: booking.id,
      },
    };

    // Agendar para 1 hora depois da sessão
    const bookingDate = new Date(`${booking.date}T${booking.time}`);
    const duration = booking.duration || 60;
    const reviewTime = (bookingDate.getTime() + duration * 60 * 1000 - new Date().getTime()) / 1000 + 3600;

    await notificationService.scheduleNotification(payload, Math.max(reviewTime, 1));
  }
}

export const bookingNotificationService = BookingNotificationService;
```

---

## 4️⃣ **Inicializar na App**

### Arquivo: `src/App.tsx` ou `src/hooks/useNotifications.ts`

```typescript
import { useEffect } from 'react';
import { notificationService } from './services/notificationService';

export function useNotifications() {
  useEffect(() => {
    // 1. Solicitar permissões
    notificationService.requestPermissions();

    // 2. Obter token
    notificationService.getNotificationToken().then((token) => {
      if (token) {
        console.log('📲 Notification Token:', token);
        // Enviar para backend para Firebase Cloud Messaging
      }
    });

    // 3. Escutar notificações recebidas (foreground)
    const unsubscribeReceived = notificationService.onNotificationReceived(
      (notification) => {
        console.log('📬 Notificação recebida:', notification);
      }
    );

    // 4. Escutar cliques em notificações
    const unsubscribeTap = notificationService.onNotificationTap((response) => {
      const { bookingId, action } = response.notification.request.content.data;
      
      console.log('👆 Notificação clicada:', { action, bookingId });
      
      // Navegar para detalhes da reserva
      if (bookingId) {
        // navigation.navigate('BookingDetails', { bookingId });
      }
    });

    return () => {
      unsubscribeReceived();
      unsubscribeTap();
    };
  }, []);
}
```

---

## 5️⃣ **Firebase Cloud Messaging (Opcional - Futuro)**

Para notificações push remotas via Firebase:

```bash
npm install @react-native-firebase/messaging
```

```typescript
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const fcmToken = await messaging().getToken();
    console.log('FCM Token:', fcmToken);
    // Enviar para backend
  }
}

messaging().onMessage(async (remoteMessage) => {
  console.log('Notificação recebida:', remoteMessage);
  // Processar notificação
});
```

---

## 6️⃣ **Checklist de Implementação**

- [x] Dependências instaladas (expo-notifications)
- [x] Serviço de notificações criado
- [x] Serviço de notificações de reservas criado
- [ ] Hook useNotifications criado e iniciado na App
- [ ] Testes de notificações locais feitos
- [ ] Integração com bookingService (agendar lembrete)
- [ ] Permissões configuradas em android/ios
- [ ] Firebase Cloud Messaging (futuro)

---

## 🎯 **Uso Rápido**

```typescript
// Notificar criação de reserva
await bookingNotificationService.notifyBookingCreated(booking);

// Agendar lembrete 24 horas antes
await bookingNotificationService.scheduleBookingReminder(booking);

// Pedir review após sessão
await bookingNotificationService.notifyForReview(booking);
```

---

## 📱 **Permissões Necessárias**

### `app.json` - Expo Configuration

```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/notification-icon.png",
        "color": "#ffffff"
      }
    ]
  ]
}
```

### Android (`android/app/build.gradle`)

```gradle
dependencies {
  implementation 'com.google.firebase:firebase-messaging'
}
```

### iOS (`ios/Podfile`)

```ruby
pod 'Firebase/Messaging'
```

---

## ✅ **Status**

**Pronto para usar!** Notificações locais funcionam imediatamente. Firebase Cloud Messaging é opcional para o futuro. 

🚀 **Próximos passos**: Integrar com offlineSyncService para notificar quando offline-sync é completada.
