import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ServiceSelectionScreen from './src/screens/ServiceSelectionScreen';
import TherapistSelectionScreen from './src/screens/TherapistSelectionScreen';
import CalendarSelectionScreen from './src/screens/CalendarSelectionScreen';
import { TabBarIcon } from './src/components/TabBarIcon';
import { BookingProvider } from './src/context/BookingContext';
import { AuthProvider } from './src/context/AuthContext';

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

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <>
          <StatusBar barStyle="light-content" />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                animationEnabled: true,
                cardStyle: { backgroundColor: '#2C3E50' },
              }}
            >
              <Stack.Screen
                name="MainTabs"
                component={TabNavigator}
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
            </Stack.Navigator>
          </NavigationContainer>
        </>
      </BookingProvider>
    </AuthProvider>
  );
}
