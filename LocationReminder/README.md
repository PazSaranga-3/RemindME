# 📱 Location Reminders App

A smart React Native mobile application that helps you remember tasks based on your location. Get contextual reminders exactly when and where they're most relevant!

## ✨ Features

### Core Functionality
- **Location-Based Reminders**: Create reminders that trigger when you enter specific locations
- **Geofencing**: Advanced geofencing technology to detect when you enter reminder areas
- **Interactive Maps**: Visual map interface to set and view reminder locations
- **Push Notifications**: Receive instant notifications when reminders are triggered
- **Background Processing**: Works even when the app is closed

### User Interface
- **Modern Design**: Clean, intuitive interface with smooth animations
- **Cross-Platform**: Works on both iOS and Android
- **Touch-Friendly**: Large buttons and easy-to-use controls
- **Dark/Light Support**: Adapts to your system theme

### Smart Features
- **Customizable Radius**: Set trigger areas from 10m to 1000m
- **Address Lookup**: Automatically converts coordinates to readable addresses
- **Reminder Management**: Edit, delete, and toggle reminders on/off
- **Activity Tracking**: See when reminders were created and last triggered

## 🛠 Tech Stack

- **Frontend**: React Native with TypeScript
- **Framework**: Expo (SDK 53)
- **Navigation**: React Navigation 6
- **Database**: SQLite with Expo SQLite
- **Maps**: React Native Maps
- **Location Services**: Expo Location
- **Notifications**: Expo Notifications
- **Background Tasks**: Expo Task Manager

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go app** on your mobile device (for testing)

For development:
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd LocationReminder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npx expo start
```

### 4. Run on Device/Simulator

#### Option A: Using Expo Go (Recommended for testing)
1. Download **Expo Go** from App Store/Google Play
2. Scan the QR code from your terminal
3. The app will load on your device

#### Option B: Using iOS Simulator (macOS only)
```bash
npx expo run:ios
```

#### Option C: Using Android Emulator
```bash
npx expo run:android
```

## 📖 How to Use

### Creating Your First Reminder

1. **Open the app** and tap the **+** button
2. **Set reminder details**:
   - Enter a title (e.g., "Grab keys when leaving home")
   - Add an optional description
3. **Configure notifications**:
   - Set notification title (e.g., "Don't forget!")
   - Write your reminder message
4. **Choose location**:
   - Tap on the map to set the reminder location
   - Adjust the trigger radius (10-1000 meters)
5. **Save** your reminder

### Managing Reminders

- **View all reminders** on the Home tab
- **See locations on map** in the Map tab
- **Toggle reminders** on/off with the switch
- **Edit reminders** by tapping the edit button
- **Delete reminders** with the trash button

### Understanding the Interface

#### Home Screen
- List of all your reminders
- Quick toggle switches for activation
- Visual status indicators
- Pull to refresh functionality

#### Map Screen
- Visual representation of all reminder locations
- Geofence circles showing trigger areas
- Current location indicator
- Tap markers for details

#### Settings Screen
- App statistics and usage info
- Notification preferences
- Permission management
- Data management options

## 🔧 Configuration

### Permissions Required

The app requires several permissions to function properly:

#### iOS
- **Location When In Use**: To get your current location
- **Location Always**: For background location monitoring
- **Notifications**: To send reminder alerts

#### Android
- **ACCESS_FINE_LOCATION**: Precise location access
- **ACCESS_COARSE_LOCATION**: Approximate location access  
- **ACCESS_BACKGROUND_LOCATION**: Background location access
- **RECEIVE_BOOT_COMPLETED**: To restart geofencing after reboot

### Customization

You can customize various aspects of the app:

#### Notification Settings
```typescript
// In NotificationService.ts
Notifications.setNotificationChannelAsync('location-reminders', {
  name: 'Location Reminders',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250], // Customize vibration
  lightColor: '#FF231F7C', // Customize LED color
});
```

#### Geofence Parameters
```typescript
// In LocationService.ts
const GEOFENCING_RADIUS_MIN = 10;  // Minimum radius in meters
const GEOFENCING_RADIUS_MAX = 1000; // Maximum radius in meters
```

## 🏗 Project Structure

```
LocationReminder/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ReminderCard.tsx
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── AddReminderScreen.tsx
│   │   ├── EditReminderScreen.tsx
│   │   ├── ReminderDetailsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # Business logic and APIs
│   │   ├── DatabaseService.ts
│   │   ├── LocationService.ts
│   │   └── NotificationService.ts
│   └── types/              # TypeScript type definitions
│       └── index.ts
├── app.json               # Expo configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔍 Key Components

### DatabaseService
Manages local SQLite database for storing reminders:
- CRUD operations for reminders
- Data persistence and retrieval
- Database schema management

### LocationService
Handles all location-related functionality:
- GPS location access
- Geofencing setup and monitoring
- Background location tracking
- Coordinate to address conversion

### NotificationService
Manages push notifications:
- Permission handling
- Notification scheduling
- Custom notification channels
- Background notification triggers

## 🚨 Troubleshooting

### Common Issues

#### Location Not Working
1. Check device location services are enabled
2. Verify app has location permissions
3. Ensure location accuracy is set to "High"
4. Try restarting the app

#### Notifications Not Appearing
1. Check notification permissions in device settings
2. Verify notifications are enabled in app settings
3. Check Do Not Disturb mode
4. Try force-closing and reopening the app

#### Geofencing Not Triggering
1. Ensure location permission includes "Always" access
2. Check that the reminder is active (green switch)
3. Verify you're entering the geofence area completely
4. Wait a few seconds after entering the area

#### App Crashing on Startup
1. Clear app data/cache
2. Reinstall the app
3. Check device storage space
4. Update to latest version

### Debug Mode

To enable debug logging:
```typescript
// Add to App.tsx
console.log('Debug mode enabled');
```

## 🔒 Privacy & Security

### Data Handling
- **Local Storage**: All data is stored locally on your device
- **No Cloud Sync**: Your reminders never leave your device
- **Minimal Permissions**: Only requests necessary permissions
- **Location Privacy**: Location data is only used for geofencing

### Security Features
- **Encrypted Database**: SQLite database with encryption
- **Permission Validation**: Strict permission checking
- **Background Limits**: Minimal background processing

## 🎯 Example Use Cases

### Personal Reminders
- "Grab keys when leaving home"
- "Buy groceries when near supermarket"
- "Call mom when leaving work"
- "Take medicine when arriving home"

### Work & Business
- "Clock in when arriving at office"
- "Submit timesheet when leaving work"
- "Check inventory when at warehouse"
- "Update client when near their location"

### Travel & Navigation
- "Take photos at landmark"
- "Check in at hotel"
- "Buy souvenirs at airport"
- "Charge phone at specific locations"

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow React Native best practices
- Add comments for complex logic
- Use meaningful variable names

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** for the amazing development platform
- **React Native Community** for the maps and navigation libraries
- **Contributors** who helped make this app better

## 📞 Support

Need help or have questions?

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this README for detailed information
- **Community**: Join discussions in the issues section

---

**Made with ❤️ using React Native & Expo**

*Happy location-based reminding! 🎯*