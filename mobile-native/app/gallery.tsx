import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentService } from '@/services/contentService';
import { getStorageUrl } from '@/constants/api';
import { colors, radius, spacing } from '@/theme/colors';
import type { GalleryItem } from '@/types/booking';

export default function GalleryScreen() {
  const [items, setItems] = useState<GalleryItem[]>([]); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => { try { setItems((await contentService.getGallery()).gallery ?? []); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  return <SafeAreaView style={styles.safe}><Text style={styles.title}>Galeri Klinik</Text>{loading ? <ActivityIndicator color={colors.gold} /> : <FlatList data={items} numColumns={2} keyExtractor={(x) => String(x.id)} contentContainerStyle={styles.list} columnWrapperStyle={styles.row} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.gold} />} renderItem={({ item }) => <View style={styles.card}><Image source={{ uri: getStorageUrl(item.image_url) ?? '' }} style={styles.image} /><Text numberOfLines={1} style={styles.caption}>{item.title ?? item.category ?? 'Aesthetic Pondok Indah'}</Text></View>} ListEmptyComponent={<Text style={styles.empty}>Belum ada foto galeri.</Text>} />}</SafeAreaView>;
}
const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:colors.cream},title:{fontSize:22,fontWeight:'700',color:colors.charcoal,padding:spacing.lg},list:{paddingHorizontal:spacing.lg,paddingBottom:spacing.xxl},row:{gap:spacing.sm},card:{flex:1,marginBottom:spacing.sm,backgroundColor:colors.white,borderRadius:radius.lg,overflow:'hidden',borderWidth:1,borderColor:colors.border},image:{width:'100%',aspectRatio:1,backgroundColor:colors.creamDark},caption:{padding:spacing.sm,color:colors.charcoal,fontSize:12,fontWeight:'600'},empty:{textAlign:'center',color:colors.charcoalMedium,marginTop:spacing.xl} });
