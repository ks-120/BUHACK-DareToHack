import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../types';
import { COLORS } from '../utils/constants';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('points', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      const list: UserProfile[] = [];
      snap.forEach((d) => list.push(d.data() as UserProfile));
      setLeaders(list);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const renderLeader = ({ item, index }: { item: UserProfile; index: number }) => {
    const isMe = item.uid === user?.uid;
    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <Text style={styles.rank}>{getRankEmoji(index)}</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.nickname.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.nickname}>
            {item.nickname} {isMe && '(You)'}
          </Text>
          <Text style={styles.interests}>{item.interests.slice(0, 2).join(' · ')}</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsEmoji}>⭐</Text>
          <Text style={styles.points}>{item.points}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.subtitle}>Top 10 most active HKBU Buddies</Text>
      </View>

      <View style={styles.pointsGuide}>
        <Text style={styles.guideTitle}>How to earn points</Text>
        <View style={styles.guideRow}>
          <Text style={styles.guideItem}>🤝 View matches: +10pts</Text>
          <Text style={styles.guideItem}>📝 Post: +5pts</Text>
          <Text style={styles.guideItem}>📅 RSVP event: +20pts</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} size="large" />
      ) : leaders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌟</Text>
          <Text style={styles.emptyTitle}>No rankings yet</Text>
          <Text style={styles.emptyText}>Start engaging to earn points!</Text>
        </View>
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={(item) => item.uid}
          renderItem={renderLeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: 20,
    paddingBottom: 14,
    backgroundColor: COLORS.primary,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  pointsGuide: {
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guideTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  guideRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  guideItem: { fontSize: 12, color: COLORS.subtext },
  loader: { marginTop: 40 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowMe: { borderColor: COLORS.primary, borderWidth: 2 },
  rank: { fontSize: 22, width: 36, textAlign: 'center' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1 },
  nickname: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  interests: { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 4,
  },
  pointsEmoji: { fontSize: 14 },
  points: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.subtext },
});
