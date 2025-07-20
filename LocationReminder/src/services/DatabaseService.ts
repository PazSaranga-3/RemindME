import * as SQLite from 'expo-sqlite';
import { Reminder } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('location_reminders.db');
      await this.createTables();
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        radius INTEGER NOT NULL,
        address TEXT,
        isActive INTEGER NOT NULL DEFAULT 1,
        notificationTitle TEXT NOT NULL,
        notificationBody TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        triggeredAt TEXT
      );
    `;

    await this.db.execAsync(createTableQuery);
  }

  async addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const createdAt = new Date().toISOString();

    const insertQuery = `
      INSERT INTO reminders (
        id, title, description, latitude, longitude, radius, address,
        isActive, notificationTitle, notificationBody, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    await this.db.runAsync(insertQuery, [
      id,
      reminder.title,
      reminder.description || null,
      reminder.latitude,
      reminder.longitude,
      reminder.radius,
      reminder.address || null,
      reminder.isActive ? 1 : 0,
      reminder.notificationTitle,
      reminder.notificationBody,
      createdAt
    ]);

    return id;
  }

  async getAllReminders(): Promise<Reminder[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync('SELECT * FROM reminders ORDER BY createdAt DESC');
    
    return result.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      latitude: row.latitude,
      longitude: row.longitude,
      radius: row.radius,
      address: row.address,
      isActive: Boolean(row.isActive),
      notificationTitle: row.notificationTitle,
      notificationBody: row.notificationBody,
      createdAt: row.createdAt,
      triggeredAt: row.triggeredAt
    }));
  }

  async getReminder(id: string): Promise<Reminder | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync('SELECT * FROM reminders WHERE id = ?', [id]);
    
    if (!result) return null;

    const row: any = result;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      latitude: row.latitude,
      longitude: row.longitude,
      radius: row.radius,
      address: row.address,
      isActive: Boolean(row.isActive),
      notificationTitle: row.notificationTitle,
      notificationBody: row.notificationBody,
      createdAt: row.createdAt,
      triggeredAt: row.triggeredAt
    };
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(key === 'isActive' ? (value ? 1 : 0) : value);
      }
    }

    if (fields.length === 0) return;

    const updateQuery = `UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await this.db.runAsync(updateQuery, values);
  }

  async deleteReminder(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
  }

  async markReminderAsTriggered(id: string): Promise<void> {
    const triggeredAt = new Date().toISOString();
    await this.updateReminder(id, { triggeredAt });
  }
}

export const databaseService = new DatabaseService();