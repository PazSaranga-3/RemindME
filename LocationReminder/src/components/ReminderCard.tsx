import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reminder } from '../types';

interface ReminderCardProps {
  reminder: Reminder;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (isActive: boolean) => void;
}

export default function ReminderCard({
  reminder,
  onPress,
  onEdit,
  onDelete,
  onToggle,
}: ReminderCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {reminder.title}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {reminder.address || `${reminder.latitude.toFixed(6)}, ${reminder.longitude.toFixed(6)}`}
          </Text>
        </View>
        
        <View style={styles.actions}>
          <Switch
            value={reminder.isActive}
            onValueChange={onToggle}
            trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
            thumbColor={reminder.isActive ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {reminder.description && (
        <Text style={styles.description} numberOfLines={2}>
          {reminder.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.info}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{reminder.radius}m radius</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              Created {formatDate(reminder.createdAt)}
            </Text>
          </View>

          {reminder.triggeredAt && (
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
              <Text style={[styles.infoText, styles.triggeredText]}>
                Last triggered {formatDate(reminder.triggeredAt)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={onEdit}
          >
            <Ionicons name="pencil" size={16} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={onDelete}
          >
            <Ionicons name="trash" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.statusIndicator, {
        backgroundColor: reminder.isActive ? '#4CAF50' : '#ccc'
      }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    alignItems: 'flex-end',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  info: {
    flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  triggeredText: {
    color: '#4CAF50',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  statusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
});