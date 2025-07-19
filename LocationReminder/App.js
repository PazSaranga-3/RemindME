import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  TextInput,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// הגדרת התראות
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [newReminderText, setNewReminderText] = useState('');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  useEffect(() => {
    (async () => {
      // בקשת הרשאות למיקום
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('נדרשת הרשאה לגישה למיקום');
        return;
      }

      // בקשת הרשאות להתראות
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        Alert.alert('שגיאה', 'נדרשת הרשאה להתראות');
      }

      // קבלת המיקום הנוכחי
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // טעינת תזכורות שמורות
      loadReminders();
    })();
  }, []);

  const loadReminders = async () => {
    try {
      const savedReminders = await AsyncStorage.getItem('reminders');
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }
    } catch (error) {
      console.log('שגיאה בטעינת תזכורות:', error);
    }
  };

  const saveReminders = async (newReminders) => {
    try {
      await AsyncStorage.setItem('reminders', JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (error) {
      console.log('שגיאה בשמירת תזכורות:', error);
    }
  };

  const addReminder = async () => {
    if (!newReminderText.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס טקסט לתזכורת');
      return;
    }

    if (!location) {
      Alert.alert('שגיאה', 'לא נמצא מיקום נוכחי');
      return;
    }

    const newReminder = {
      id: Date.now().toString(),
      text: newReminderText,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      created: new Date().toLocaleString('he-IL'),
    };

    const updatedReminders = [...reminders, newReminder];
    await saveReminders(updatedReminders);
    setNewReminderText('');
    setIsAddingReminder(false);
    
    Alert.alert('הצלחה', 'התזכורת נוספה בהצלחה!');
  };

  const deleteReminder = async (id) => {
    Alert.alert(
      'מחיקת תזכורת',
      'האם אתה בטוח שברצונך למחוק את התזכורת?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            const updatedReminders = reminders.filter(reminder => reminder.id !== id);
            await saveReminders(updatedReminders);
          }
        }
      ]
    );
  };

  let text = 'ממתין למיקום...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `קו רוחב: ${location.coords.latitude.toFixed(4)}, קו אורך: ${location.coords.longitude.toFixed(4)}`;
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>תזכורות מבוססות מיקום</Text>
        <Text style={styles.subtitle}>המיקום שלך:</Text>
        <Text style={styles.locationText}>{text}</Text>
      </View>

      <View style={styles.addReminderSection}>
        {!isAddingReminder ? (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsAddingReminder(true)}
          >
            <Text style={styles.addButtonText}>הוסף תזכורת חדשה</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addReminderForm}>
            <TextInput
              style={styles.textInput}
              placeholder="הכנס טקסט תזכורת (לדוגמה: לקנות חלב)"
              value={newReminderText}
              onChangeText={setNewReminderText}
              multiline
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addReminder}
              >
                <Text style={styles.buttonText}>שמור</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIsAddingReminder(false);
                  setNewReminderText('');
                }}
              >
                <Text style={styles.buttonText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.remindersSection}>
        <Text style={styles.sectionTitle}>התזכורות שלי ({reminders.length})</Text>
        
        {reminders.length === 0 ? (
          <Text style={styles.emptyText}>אין תזכורות עדיין</Text>
        ) : (
          reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <Text style={styles.reminderText}>{reminder.text}</Text>
              <Text style={styles.reminderDate}>נוצר: {reminder.created}</Text>
              <Text style={styles.reminderLocation}>
                מיקום: {reminder.latitude.toFixed(4)}, {reminder.longitude.toFixed(4)}
              </Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteReminder(reminder.id)}
              >
                <Text style={styles.deleteButtonText}>מחק</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  addReminderSection: {
    margin: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addReminderForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 60,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  remindersSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  reminderCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  reminderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'right',
  },
  reminderDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textAlign: 'right',
  },
  reminderLocation: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    textAlign: 'right',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
