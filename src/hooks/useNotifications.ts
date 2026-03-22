/**
 * Hook para gerenciar notificações da app
 * Suporta expo-notifications com fallback
 */

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';

/**
 * Configurar notificações ao inicializar a app
 * Chamar no App.tsx ou arquivo raiz
 */
export function useNotifications() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // 1. Configurar handler padrão
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // 2. Solicitar permissões
    initializeNotifications();

    // 3. Escutar notificações recebidas
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notificação recebida em foreground:', {
          title: notification.request.content.title,
          body: notification.request.content.body,
        });
      }
    );

    // 4. Escutar cliques em notificações
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('👆 Notificação clicada:', {
          action: data.action,
          bookingId: data.bookingId,
        });

        // TODO: Navegar para tela apropriada baseado em data.action
        // Exemplo:
        // if (data.action === 'booking_reminder') {
        //   navigation.navigate('BookingDetails', { bookingId: data.bookingId });
        // }
      }
    );

    // Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
}

/**
 * Inicializar e solicitar permissões de notificações
 */
async function initializeNotifications(): Promise<void> {
  try {
    // Solicitar permissões
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      console.warn('⚠️ Permissão de notificações não concedida');
      return;
    }

    console.log('✅ Notificações ativadas com sucesso');

    // Obter token para push notifications (futuro FCM)
    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync();
      console.log('📲 Expo Push Token:', token);
      // TODO: Enviar token para backend
    } catch (error) {
      console.warn('⚠️ Erro ao obter Expo Push Token:', error);
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar notificações:', error);
  }
}

/**
 * Hook para testar notificações locais
 * Use apenas em desenvolvimento
 */
export function useTestNotifications() {
  return {
    /**
     * Enviar notificação de teste imediatamente
     */
    sendTestNotification: async () => {
      try {
        await notificationService.sendLocalNotification({
          title: '🧪 Notificação de Teste',
          body: 'Esta é uma notificação de teste do Qlinica',
          data: { type: 'test' },
        });
        console.log('✅ Notificação de teste enviada');
      } catch (error) {
        console.error('❌ Erro ao enviar notificação de teste:', error);
      }
    },

    /**
     * Agendar notificação para 5 segundos
     */
    scheduleTestNotification: async () => {
      try {
        await notificationService.scheduleNotification(
          {
            title: '⏰ Notificação Agendada',
            body: 'Esta notificação foi agendada para 5 segundos',
            data: { type: 'scheduled_test' },
          },
          5
        );
        console.log('✅ Notificação agendada para 5s');
      } catch (error) {
        console.error('❌ Erro ao agendar notificação:', error);
      }
    },
  };
}
