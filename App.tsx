import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ServiceSelectionScreen from './src/screens/ServiceSelectionScreen';
import TherapistSelectionScreen from './src/screens/TherapistSelectionScreen';
import CalendarSelectionScreen from './src/screens/CalendarSelectionScreen';
import BookingSummaryScreen from './src/screens/BookingSummaryScreen';
import BookingDetailsScreen from './src/screens/BookingDetailsScreen';
import LoginScreen from './src/screens/AuthScreens/LoginScreen';
import RegisterScreen from './src/screens/AuthScreens/RegisterScreen';
import { TabBarIcon } from './src/components/TabBarIcon';
import { ToastDisplay } from './src/components/ToastDisplay';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { BookingProvider } from './src/context/BookingContext';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { useAuth } from './src/context/AuthContext';
import { initializeNotifications } from './src/services/notificationService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#D4AF8F',
        tabBarInactiveTintColor: '#8895a0',
        tabBarStyle: {
          backgroundColor: '#1a252f',
          borderTopColor: '#34495E',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'DMSans',
          marginTop: 4,
        },
        tabBarIcon: ({ color }) => <TabBarIcon name={route.name} color={color} />,
      })}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Início',
        }}
      />
      <Tab.Screen
        name="bookings"
        component={BookingsScreen}
        options={{
          title: 'Marcações',
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Initialize notifications on app start
  useEffect(() => {
    initializeNotifications().catch((error) => {
      console.warn('Notification initialization failed:', error);
    });
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#2C3E50', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#D4AF8F', fontSize: 18 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              presentation: 'card',
            }}
          />
        </>
      ) : (
        // App Stack
        <>
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{
            }}
          />
          <Stack.Screen
            name="ServiceSelection"
            component={ServiceSelectionScreen}
            options={{
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="TherapistSelection"
            component={TherapistSelectionScreen}
            options={{
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="CalendarSelection"
            component={CalendarSelectionScreen}
            options={{
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="BookingSummary"
            component={BookingSummaryScreen}
            options={{
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="BookingDetails"
            component={BookingDetailsScreen}
            options={{
              presentation: 'card',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <ToastProvider>
            <NotificationProvider>
              <StatusBar style="light" />
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
              <ToastDisplay />
            </NotificationProvider>
          </ToastProvider>
        </BookingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
