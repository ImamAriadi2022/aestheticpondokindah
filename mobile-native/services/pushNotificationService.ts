import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';

const SETTINGS_KEY = 'apident_notification_preferences';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = raw ? JSON.parse(raw) : { enabled: true, reservations: true, consultations: true, promotions: true };
      if (!settings.enabled) return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: false, shouldShowList: false };

      const type = String(notification.request.content.data?.type || '').toLowerCase();
      const categoryEnabled = type.includes('reservation') || type.includes('booking')
        ? settings.reservations
        : type.includes('consultation') || type.includes('message')
        ? settings.consultations
        : type.includes('promo') || type.includes('membership')
        ? settings.promotions
        : true;
      return { shouldShowAlert: categoryEnabled, shouldPlaySound: categoryEnabled, shouldSetBadge: categoryEnabled, shouldShowBanner: categoryEnabled, shouldShowList: categoryEnabled };
    } catch {
      return { shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true, shouldShowBanner: true, shouldShowList: true };
    }
  },
});

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C9A24A',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    let token: string | null = null;
    try {
      const expoToken = await Notifications.getExpoPushTokenAsync();
      token = expoToken.data;
    } catch {
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      token = typeof deviceToken.data === 'string' ? deviceToken.data : JSON.stringify(deviceToken.data);
    }

    if (token) {
      await notificationService.storeDeviceToken(
        token,
        Platform.OS === 'ios' ? 'ios' : 'android'
      );
    }

    return token;
  } catch (err) {
    return null;
  }
}
