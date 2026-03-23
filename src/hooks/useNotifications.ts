/**
 * Hook para gerenciar notificações da app
 * Suporta expo-notifications com fallback
 */

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { initializeNotifications, notificationService } from '../services/notificationService';

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
 * (initializeNotifications is imported from notificationService)
 */

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
        // Send a booking confirmation as test
        await notificationService.sendBookingConfirmationNotification('Test Therapist', 'Test Service', new Date());
        console.log('✅ Notificação de teste enviada');
      } catch (error) {
        console.error('❌ Erro ao enviar notificação de teste:', error);
      }
    },

    /**
     * Agendar notificação para depois
     */
    scheduleTestNotification: async () => {
      try {
        // Schedule a reminder notification
        const futureDate = new Date();
        futureDate.setSeconds(futureDate.getSeconds() + 5);
        await notificationService.sendBookingReminderNotification('Test Therapist', 'Test Service', futureDate);
        console.log('✅ Notificação agendada para 5s');
      } catch (error) {
        console.error('❌ Erro ao agendar notificação:', error);
      }
    },
  };
}
