import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  Switch,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

import { databaseService } from '../services/DatabaseService';
import { NotificationService } from '../services/NotificationService';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [totalReminders, setTotalReminders] = useState(0);
  const [activeReminders, setActiveReminders] = useState(0);

  useEffect(() => {
    loadStats();
    checkNotificationPermissions();
  }, []);

  const loadStats = async () => {
    try {
      const reminders = await databaseService.getAllReminders();
      setTotalReminders(reminders.length);
      setActiveReminders(reminders.filter(r => r.isActive).length);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        setNotificationsEnabled(status === 'granted');
        
        if (status !== 'granted') {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications in your device settings to receive location reminders.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
      } catch (error) {
        console.error('Failed to request notification permissions:', error);
        setNotificationsEnabled(false);
      }
    } else {
      Alert.alert(
        'Disable Notifications',
        'Disabling notifications will prevent you from receiving location reminders. You can re-enable them in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', style: 'destructive', onPress: () => setNotificationsEnabled(false) }
        ]
      );
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your reminders. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const reminders = await databaseService.getAllReminders();
              for (const reminder of reminders) {
                await databaseService.deleteReminder(reminder.id);
              }
              await loadStats();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.error('Failed to clear data:', error);
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const openLocationSettings = () => {
    Alert.alert(
      'Location Permissions',
      'To receive location-based reminders, please ensure location permissions are enabled in your device settings.',
      [
        { text: 'OK', style: 'default' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent, 
    showArrow = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#007AFF" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && <Ionicons name="chevron-forward" size={20} color="#ccc" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalReminders}</Text>
              <Text style={styles.statLabel}>Total Reminders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{activeReminders}</Text>
              <Text style={styles.statLabel}>Active Reminders</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive alerts when entering reminder locations"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          <SettingItem
            icon="location-outline"
            title="Location Services"
            subtitle="Manage location permissions for reminders"
            onPress={openLocationSettings}
            showArrow
          />
          <SettingItem
            icon="settings-outline"
            title="App Settings"
            subtitle="Open system settings for this app"
            onPress={() => Linking.openSettings()}
            showArrow
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <SettingItem
            icon="trash-outline"
            title="Clear All Data"
            subtitle="Permanently delete all reminders"
            onPress={handleClearAllData}
            showArrow
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem
            icon="information-circle-outline"
            title="App Version"
            subtitle="1.0.0"
          />
          <SettingItem
            icon="document-text-outline"
            title="How to Use"
            subtitle="Learn how to create location-based reminders"
            onPress={() => {
              Alert.alert(
                'How to Use Location Reminders',
                '1. Tap the + button to create a new reminder\n2. Set a title and notification message\n3. Choose a location on the map\n4. Set the trigger radius\n5. Enable the reminder\n\nYou\'ll receive a notification when you enter the specified area!',
                [{ text: 'Got it!', style: 'default' }]
              );
            }}
            showArrow
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Location Reminders helps you remember tasks based on where you are.
          </Text>
          <Text style={styles.footerText}>
            Made with React Native & Expo
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
});