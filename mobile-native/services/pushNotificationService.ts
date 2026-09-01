import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationService } from './notificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
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
