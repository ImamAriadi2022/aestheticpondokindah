import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { contentService } from '@/services/contentService';
import { colors, spacing, radius } from '@/theme/colors';
import { getStorageUrl } from '@/constants/api';
import type { Post } from '@/types/booking';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    contentService.getPost(String(id))
      .then((res) => setPost(res?.post ?? null))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.gold} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Artikel tidak ditemukan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {post.thumbnail_url && (
          <Image
            source={{ uri: getStorageUrl(post.thumbnail_url) ?? '' }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        <View style={styles.content}>
          {post.category && (
            <Text style={styles.category}>{post.category.toUpperCase()}</Text>
          )}
          <Text style={styles.title}>{post.title}</Text>
          {post.published_at && (
            <Text style={styles.date}>
              {new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          )}
          <View style={styles.divider} />
          <Text style={styles.body}>{post.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: spacing.xxl },
  thumbnail: { width: '100%', height: 240 },
  content: { padding: spacing.lg },
  category: { fontSize: 11, fontWeight: '700', color: colors.gold, letterSpacing: 1, marginBottom: spacing.xs },
  title: { fontSize: 22, fontWeight: '700', color: colors.charcoal, lineHeight: 30, marginBottom: spacing.xs },
  date: { fontSize: 12, color: colors.muted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  body: { fontSize: 15, color: colors.charcoal, lineHeight: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: colors.charcoalMedium },
});
