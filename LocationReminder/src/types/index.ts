export interface Reminder {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  address?: string;
  isActive: boolean;
  notificationTitle: string;
  notificationBody: string;
  createdAt: string;
  triggeredAt?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface GeofenceRegion {
  identifier: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface NotificationData {
  reminderId: string;
  title: string;
  body: string;
}

export type RootStackParamList = {
  Main: undefined;
  AddReminder: undefined;
  EditReminder: { reminderId: string };
  ReminderDetails: { reminderId: string };
};

export type TabParamList = {
  Home: undefined;
  Map: undefined;
  Settings: undefined;
};