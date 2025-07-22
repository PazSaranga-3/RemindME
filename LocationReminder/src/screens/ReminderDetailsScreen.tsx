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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { Reminder, RootStackParamList } from '../types';
import { databaseService } from '../services/DatabaseService';

type ReminderDetailsNavigationProp = StackNavigationProp<RootStackParamList>;
type ReminderDetailsRouteProp = RouteProp<RootStackParamList, 'ReminderDetails'>;

export default function ReminderDetailsScreen() {
  const navigation = useNavigation<ReminderDetailsNavigationProp>();
  const route = useRoute<ReminderDetailsRouteProp>();
  const { reminderId } = route.params;
  
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReminder();
  }, []);

  const loadReminder = async () => {
    try {
      setLoading(true);
      const reminderData = await databaseService.getReminder(reminderId);
      setReminder(reminderData);
    } catch (error) {
      console.error('Failed to load reminder:', error);
      Alert.alert('Error', 'Failed to load reminder details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (isActive: boolean) => {
    if (!reminder) return;
    
    try {
      await databaseService.updateReminder(reminder.id, { isActive });
      setReminder({ ...reminder, isActive });
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteReminder(reminderId);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete reminder:', error);
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || !reminder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{reminder.title}</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Active</Text>
              <Switch
                value={reminder.isActive}
                onValueChange={handleToggleActive}
                trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                thumbColor={reminder.isActive ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {reminder.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{reminder.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>
                {reminder.address || `${reminder.latitude.toFixed(6)}, ${reminder.longitude.toFixed(6)}`}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="radio-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Trigger Radius</Text>
              <Text style={styles.detailValue}>{reminder.radius} meters</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="map-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Coordinates</Text>
              <Text style={styles.detailValue}>
                {reminder.latitude.toFixed(6)}, {reminder.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <View style={styles.detailRow}>
            <Ionicons name="notifications-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Notification Title</Text>
              <Text style={styles.detailValue}>{reminder.notificationTitle}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Notification Message</Text>
              <Text style={styles.detailValue}>{reminder.notificationBody}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{formatDate(reminder.createdAt)}</Text>
            </View>
          </View>
          
          {reminder.triggeredAt && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Last Triggered</Text>
                <Text style={[styles.detailValue, styles.triggeredText]}>
                  {formatDate(reminder.triggeredAt)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Map</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{
                latitude: reminder.latitude,
                longitude: reminder.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: reminder.latitude,
                  longitude: reminder.longitude,
                }}
                title={reminder.title}
                description={reminder.address}
              />
              <Circle
                center={{
                  latitude: reminder.latitude,
                  longitude: reminder.longitude,
                }}
                radius={reminder.radius}
                fillColor="rgba(0, 122, 255, 0.2)"
                strokeColor="rgba(0, 122, 255, 0.8)"
                strokeWidth={2}
              />
            </MapView>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.navigate('EditReminder', { reminderId: reminder.id })}
        >
          <Ionicons name="pencil" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  triggeredText: {
    color: '#4CAF50',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});