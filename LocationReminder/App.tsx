import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { databaseService } from './src/services/DatabaseService';
import { locationService } from './src/services/LocationService';
import { NotificationService } from './src/services/NotificationService';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await databaseService.initialize();
      console.log('Database initialized');

      // Initialize notification service
      await NotificationService.initialize();
      console.log('Notifications initialized');

      // Initialize location service
      try {
        await locationService.initialize();
        console.log('Location service initialized');
      } catch (locationError) {
        console.warn('Location service initialization failed:', locationError);
        Alert.alert(
          'Location Permission Required',
          'This app requires location access to send you location-based reminders. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
      }

      // Set up notification listeners
      const notificationListener = NotificationService.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification received:', notification);
        }
      );

      const responseListener = NotificationService.addNotificationResponseReceivedListener(
        (response) => {
          console.log('Notification response:', response);
          // Handle notification tap if needed
        }
      );

      setIsReady(true);

      // Cleanup function
      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    } catch (error) {
      console.error('App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!isReady) {
    // You could add a splash screen component here
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
