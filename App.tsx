import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import HomeScreen from './src/screens/HomeScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { TabBarIcon } from './src/components/TabBarIcon';

const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Cormorant': require('./assets/fonts/Cormorant-Bold.ttf'),
    'DMSans': require('./assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Bold': require('./assets/fonts/DMSans-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
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
      </NavigationContainer>
    </>
  );
}
