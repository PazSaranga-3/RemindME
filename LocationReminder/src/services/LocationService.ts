import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { GeofenceRegion, Reminder } from '../types';
import { NotificationService } from './NotificationService';
import { databaseService } from './DatabaseService';

const LOCATION_TASK_NAME = 'background-location-task';
const GEOFENCING_TASK_NAME = 'geofencing-task';

class LocationService {
  private watchPositionSubscription: Location.LocationSubscription | null = null;
  private isLocationServicesEnabled = false;

  async initialize(): Promise<void> {
    await this.requestPermissions();
    await this.setupBackgroundLocation();
  }

  private async requestPermissions(): Promise<void> {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.warn('Background location permission not granted');
    }

    this.isLocationServicesEnabled = true;
  }

  async getCurrentLocation(): Promise<Location.LocationObject> {
    if (!this.isLocationServicesEnabled) {
      throw new Error('Location services not enabled');
    }

    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const address = result[0];
        return `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
      }
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  async startGeofencing(reminders: Reminder[]): Promise<void> {
    if (!this.isLocationServicesEnabled) {
      console.warn('Location services not enabled for geofencing');
      return;
    }

    const regions: GeofenceRegion[] = reminders
      .filter(reminder => reminder.isActive)
      .map(reminder => ({
        identifier: reminder.id,
        latitude: reminder.latitude,
        longitude: reminder.longitude,
        radius: reminder.radius,
      }));

    try {
      await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
      console.log('Geofencing started with', regions.length, 'regions');
    } catch (error) {
      console.error('Failed to start geofencing:', error);
    }
  }

  async stopGeofencing(): Promise<void> {
    try {
      await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
      console.log('Geofencing stopped');
    } catch (error) {
      console.error('Failed to stop geofencing:', error);
    }
  }

  private async setupBackgroundLocation(): Promise<void> {
    TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data, error }) => {
      if (error) {
        console.error('Geofencing task error:', error);
        return;
      }

      const { eventType, region } = data as any;
      
      if (eventType === Location.GeofencingEventType.Enter) {
        console.log('Entered region:', region.identifier);
        await this.handleGeofenceEnter(region.identifier);
      }
    });

    TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
      if (error) {
        console.error('Background location task error:', error);
        return;
      }

      const { locations } = data as any;
      console.log('Background location update:', locations);
    });
  }

  private async handleGeofenceEnter(reminderId: string): Promise<void> {
    try {
      const reminder = await databaseService.getReminder(reminderId);
      
      if (reminder && reminder.isActive) {
        await NotificationService.scheduleLocationNotification(reminder);
        await databaseService.markReminderAsTriggered(reminderId);
        console.log('Location reminder triggered:', reminder.title);
      }
    } catch (error) {
      console.error('Error handling geofence enter:', error);
    }
  }

  async calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): Promise<number> {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  async watchPosition(callback: (location: Location.LocationObject) => void): Promise<void> {
    if (this.watchPositionSubscription) {
      this.watchPositionSubscription.remove();
    }

    this.watchPositionSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      callback
    );
  }

  stopWatchingPosition(): void {
    if (this.watchPositionSubscription) {
      this.watchPositionSubscription.remove();
      this.watchPositionSubscription = null;
    }
  }
}

export const locationService = new LocationService();