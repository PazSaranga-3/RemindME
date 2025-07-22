import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MapView, { Marker, Circle, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { Reminder, RootStackParamList } from '../types';
import { databaseService } from '../services/DatabaseService';
import { locationService } from '../services/LocationService';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function MapScreen() {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load reminders
      const allReminders = await databaseService.getAllReminders();
      setReminders(allReminders.filter(r => r.isActive));
      
      // Get current location
      try {
        const location = await locationService.getCurrentLocation();
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (locationError) {
        console.warn('Could not get current location:', locationError);
      }
    } catch (error) {
      console.error('Failed to load map data:', error);
      Alert.alert('Error', 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getInitialRegion = () => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    
    if (reminders.length > 0) {
      return {
        latitude: reminders[0].latitude,
        longitude: reminders[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    
    // Default to San Francisco
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  const renderReminderMarker = (reminder: Reminder) => (
    <View key={reminder.id}>
      <Marker
        coordinate={{
          latitude: reminder.latitude,
          longitude: reminder.longitude,
        }}
        title={reminder.title}
        description={reminder.address}
        pinColor={reminder.isActive ? '#007AFF' : '#ccc'}
      >
        <Callout
          tooltip
          onPress={() => navigation.navigate('ReminderDetails', { reminderId: reminder.id })}
        >
          <View style={styles.calloutContainer}>
            <Text style={styles.calloutTitle}>{reminder.title}</Text>
            <Text style={styles.calloutDescription}>
              {reminder.description || reminder.address}
            </Text>
            <Text style={styles.calloutRadius}>
              {reminder.radius}m radius
            </Text>
            <View style={styles.calloutButton}>
              <Text style={styles.calloutButtonText}>View Details</Text>
            </View>
          </View>
        </Callout>
      </Marker>
      
      <Circle
        center={{
          latitude: reminder.latitude,
          longitude: reminder.longitude,
        }}
        radius={reminder.radius}
        fillColor="rgba(0, 122, 255, 0.15)"
        strokeColor="rgba(0, 122, 255, 0.8)"
        strokeWidth={2}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminder Locations</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={loadData}
          >
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('AddReminder')}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <MapView
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation={false}
      >
        {reminders.map(renderReminderMarker)}
      </MapView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Active Reminders ({reminders.filter(r => r.isActive).length})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle]} />
          <Text style={styles.legendText}>Geofence Area</Text>
        </View>
      </View>

      {reminders.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <Ionicons name="map-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Active Reminders</Text>
            <Text style={styles.emptySubtitle}>
              Create a location-based reminder to see it on the map
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddReminder')}
            >
              <Text style={styles.emptyButtonText}>Add Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    minWidth: 200,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  calloutRadius: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  calloutButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  calloutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});