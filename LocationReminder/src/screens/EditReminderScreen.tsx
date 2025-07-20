import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MapView, { Marker, Circle } from 'react-native-maps';

import { RootStackParamList } from '../types';
import { databaseService } from '../services/DatabaseService';
import { locationService } from '../services/LocationService';

type EditReminderNavigationProp = StackNavigationProp<RootStackParamList>;
type EditReminderRouteProp = RouteProp<RootStackParamList, 'EditReminder'>;

export default function EditReminderScreen() {
  const navigation = useNavigation<EditReminderNavigationProp>();
  const route = useRoute<EditReminderRouteProp>();
  const { reminderId } = route.params;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [radius, setRadius] = useState(100);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReminder();
  }, []);

  const loadReminder = async () => {
    try {
      const reminder = await databaseService.getReminder(reminderId);
      if (reminder) {
        setTitle(reminder.title);
        setDescription(reminder.description || '');
        setNotificationTitle(reminder.notificationTitle);
        setNotificationBody(reminder.notificationBody);
        setLatitude(reminder.latitude);
        setLongitude(reminder.longitude);
        setRadius(reminder.radius);
        setAddress(reminder.address || '');
      }
    } catch (error) {
      console.error('Failed to load reminder:', error);
      Alert.alert('Error', 'Failed to load reminder details');
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
    setLatitude(lat);
    setLongitude(lng);
    
    try {
      const addressText = await locationService.reverseGeocode(lat, lng);
      setAddress(addressText);
    } catch (error) {
      console.error('Failed to reverse geocode:', error);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your reminder');
      return false;
    }
    
    if (!notificationTitle.trim()) {
      Alert.alert('Error', 'Please enter a notification title');
      return false;
    }
    
    if (!notificationBody.trim()) {
      Alert.alert('Error', 'Please enter a notification message');
      return false;
    }
    
    if (radius < 10 || radius > 1000) {
      Alert.alert('Error', 'Radius must be between 10 and 1000 meters');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const updates = {
        title: title.trim(),
        description: description.trim() || undefined,
        latitude,
        longitude,
        radius,
        address,
        notificationTitle: notificationTitle.trim(),
        notificationBody: notificationBody.trim(),
      };
      
      await databaseService.updateReminder(reminderId, updates);
      
      Alert.alert(
        'Success',
        'Reminder updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Failed to update reminder:', error);
      Alert.alert('Error', 'Failed to update reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Grab keys when leaving home"
                maxLength={100}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description..."
                multiline
                numberOfLines={3}
                maxLength={300}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notification Title *</Text>
              <TextInput
                style={styles.input}
                value={notificationTitle}
                onChangeText={setNotificationTitle}
                placeholder="e.g., Don't forget!"
                maxLength={50}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notification Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notificationBody}
                onChangeText={setNotificationBody}
                placeholder="e.g., Remember to grab your keys before leaving!"
                multiline
                numberOfLines={2}
                maxLength={200}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Settings</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Radius (meters)</Text>
              <TextInput
                style={styles.input}
                value={radius.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setRadius(Math.max(10, Math.min(1000, num)));
                }}
                placeholder="100"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.addressText}>{address}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Location</Text>
            <Text style={styles.helperText}>
              Tap on the map to change the reminder location
            </Text>
            
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={{
                  latitude,
                  longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onPress={handleMapPress}
              >
                <Marker
                  coordinate={{ latitude, longitude }}
                  title="Reminder Location"
                  description={address}
                />
                <Circle
                  center={{ latitude, longitude }}
                  radius={radius}
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
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
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
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});