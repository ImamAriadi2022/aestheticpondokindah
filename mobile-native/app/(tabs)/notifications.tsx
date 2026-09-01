import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { notificationService } from '@/services/notificationService';
import { colors, spacing, radius } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import type { Notification } from '@/types/booking';

type FilterType = 'all' | 'unread';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res?.notifications ?? []);
    } catch {
      // handled globally
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  const isRead = (item: Notification) => Boolean(item.read_at || (item as any).is_read);

  const handleMarkRead = async (item: Notification) => {
    if (isRead(item)) {
      handleNavigateNotification(item);
      return;
    }

    try {
      await notificationService.markAsRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => n.id === item.id ? { ...n, read_at: new Date().toISOString(), is_read: true } : n)
      );
      handleNavigateNotification(item);
    } catch {}
  };

  const handleNavigateNotification = (item: Notification) => {
    if ((item as any).deep_link) {
      router.push((item as any).deep_link as any);
      return;
    }

    const type = item.type?.toLowerCase() || '';
    if (type.includes('booking') || type.includes('reservation')) {
      router.push('/(tabs)/appointments' as any);
    } else if (type.includes('membership') || type.includes('tier') || type.includes('point')) {
      router.push('/(tabs)/membership' as any);
    } else if (type.includes('consultation') || type.includes('chat')) {
      router.push('/consultation' as any);
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString(), is_read: true })));
    } catch {
      Alert.alert('Gagal', 'Tidak dapat menandai semua notifikasi dibaca.');
    }
  };

  const handleDeleteItem = (id: number) => {
    Alert.alert(
      'Hapus Notifikasi',
      'Apakah Anda yakin ingin menghapus notifikasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(id);
              setNotifications((prev) => prev.filter((n) => n.id !== id));
            } catch {
              Alert.alert('Gagal', 'Gagal menghapus notifikasi.');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      'Bersihkan Semua Notifikasi',
      'Apakah Anda yakin ingin menghapus seluruh riwayat notifikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Bersihkan',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearAll();
              setNotifications([]);
            } catch {
              Alert.alert('Gagal', 'Gagal membersihkan riwayat notifikasi.');
            }
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter((n) => !isRead(n)).length;
  const filteredList = filter === 'unread' ? notifications.filter((n) => !isRead(n)) : notifications;

  const getTypeIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('booking') || t.includes('reservation')) return { name: 'calendar', bg: '#FAF5EA', color: colors.goldDark };
    if (t.includes('membership') || t.includes('tier')) return { name: 'ribbon', bg: '#FDF4E8', color: '#B8943F' };
    if (t.includes('point')) return { name: 'sparkles', bg: '#FEF3C7', color: '#D97706' };
    if (t.includes('promo')) return { name: 'pricetag', bg: '#ECFDF5', color: '#059669' };
    if (t.includes('consultation')) return { name: 'chatbubbles', bg: '#EFF6FF', color: '#2563EB' };
    return { name: 'notifications', bg: '#FAF5EA', color: colors.goldDark };
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const itemRead = isRead(item);
    const iconMeta = getTypeIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.card, !itemRead ? styles.cardUnread : null]}
        onPress={() => handleMarkRead(item)}
        activeOpacity={0.85}
      >
        <View style={[styles.typeIconWrap, { backgroundColor: iconMeta.bg }]}>
          <Ionicons name={iconMeta.name as any} size={18} color={iconMeta.color} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.cardHeader}>
            <Text style={[styles.notifTitle, !itemRead ? styles.notifTitleUnread : null]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.timeWrap}>
              <Text style={styles.notifTime}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : '-'}
              </Text>
              {!itemRead && <View style={styles.unreadDot} />}
            </View>
          </View>
          <Text style={styles.notifBody} numberOfLines={3}>{item.body}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteIconBtn}
          onPress={() => handleDeleteItem(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header with Back Button & Actions */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.charcoal} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Pusat Notifikasi</Text>
            <Text style={styles.unreadText}>
              {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : 'Semua pesan sudah dibaca'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.headerActionBtn} onPress={handleMarkAll} activeOpacity={0.8}>
              <Ionicons name="checkmark-done" size={14} color={colors.goldDark} style={{ marginRight: 3 }} />
              <Text style={styles.headerActionText}>Tandai Baca</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs (Semua / Belum Dibaca) */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' ? styles.filterTabActive : null]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' ? styles.filterTabTextActive : null]}>
            Semua ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' ? styles.filterTabActive : null]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterTabText, filter === 'unread' ? styles.filterTabTextActive : null]}>
            Belum Dibaca ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="notifications-off-outline" size={40} color={colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === 'unread' ? 'Tidak Ada Pesan Baru' : 'Belum Ada Notifikasi'}
              </Text>
              <Text style={styles.emptyText}>
                {filter === 'unread'
                  ? 'Seluruh notifikasi Anda telah ditandai sebagai dibaca.'
                  : 'Pengingat janji temu dokter, konfirmasi reservasi, dan update membership akan muncul di sini.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.charcoal },
  unreadText: { fontSize: 11, color: colors.charcoalMedium, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  headerActionText: { fontSize: 11, color: colors.goldDark, fontWeight: '700' },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.cream,
  },
  filterTabActive: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
  },
  filterTabText: { fontSize: 11, fontWeight: '600', color: colors.charcoalMedium },
  filterTabTextActive: { color: colors.goldDark, fontWeight: '700' },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: {
    backgroundColor: '#FCFAF6',
    borderColor: '#E8DFC8',
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
  },
  typeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  notifTitle: { fontSize: 13, fontWeight: '600', color: colors.charcoal, flex: 1, marginRight: 6 },
  notifTitleUnread: { fontWeight: '700', color: '#1C1814' },
  timeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notifTime: { fontSize: 10, color: colors.charcoalMedium },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold },
  notifBody: { fontSize: 12, color: colors.charcoalMedium, lineHeight: 18 },
  deleteIconBtn: {
    padding: 4,
    marginLeft: 4,
    alignSelf: 'center',
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#F0E6D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.xs },
  emptyText: { fontSize: 12, color: colors.charcoalMedium, textAlign: 'center', lineHeight: 18, maxWidth: 280 },
});
