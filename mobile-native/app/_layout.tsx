import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="article/[id]" options={{ headerShown: true, title: 'Artikel', headerStyle: { backgroundColor: '#FAF8F5' }, headerTintColor: '#2C2416' }} />
        <Stack.Screen name="gallery" options={{ headerShown: true, title: 'Galeri Klinik', headerStyle: { backgroundColor: '#FAF8F5' }, headerTintColor: '#2C2416' }} />
        <Stack.Screen name="booking/new" options={{ headerShown: true, title: 'Buat Janji', headerStyle: { backgroundColor: '#FAF8F5' }, headerTintColor: '#2C2416' }} />
        <Stack.Screen name="membership/upgrade" options={{ headerShown: true, title: 'Upgrade Membership', headerStyle: { backgroundColor: '#FAF8F5' }, headerTintColor: '#2C2416' }} />
      </Stack>
    </AuthProvider>
  );
}
