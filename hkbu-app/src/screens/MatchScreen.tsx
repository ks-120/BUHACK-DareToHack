import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { UserProfile, Match, RootStackParamList } from '../types';
import { COLORS, MATCH_THRESHOLD } from '../utils/constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Match'>;
};

function computeOverlap(a: string[], b: string[]): { shared: string[]; percent: number } {
  const shared = a.filter((i) => b.includes(i));
  const maxLen = Math.max(a.length, b.length);
  const percent = maxLen === 0 ? 0 : shared.length / maxLen;
  return { shared, percent };
}

export default function MatchScreen({ navigation }: Props) {
  const { user, profile, refreshProfile } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const results: Match[] = [];
      snap.forEach((d) => {
        const other = d.data() as UserProfile;
        if (other.uid === user.uid) return;
        const { shared, percent } = computeOverlap(profile.interests, other.interests);
        if (percent >= MATCH_THRESHOLD) {
          results.push({
            uid: other.uid,
            nickname: other.nickname,
            sharedInterests: shared,
            overlapPercent: Math.round(percent * 100),
          });
        }
      });
      results.sort((a, b) => b.overlapPercent - a.overlapPercent);
      setMatches(results);

      // Gamification: +10 points for viewing matches
      await updateDoc(doc(db, 'users', user.uid), { points: increment(10) });
      refreshProfile();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMatch = (match: Match) => {
    const matchId = [user!.uid, match.uid].sort().join('_');
    navigation.navigate('Chat', { matchId, partnerNickname: match.nickname });
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.nickname.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.nickname}>{item.nickname}</Text>
          <View style={styles.overlapBadge}>
            <Text style={styles.overlapText}>{item.overlapPercent}% match</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sharedLabel}>Shared interests:</Text>
      <View style={styles.tagsRow}>
        {item.sharedInterests.map((i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{i}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={() => handleRequestMatch(item)}>
        <Text style={styles.buttonText}>💬 Chat with {item.nickname}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤝 Buddy Matches</Text>
        <Text style={styles.subtitle}>Students with ≥70% shared interests</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} size="large" />
      ) : matches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyText}>
            We'll find you matches as more HKBU students join. Try updating your interests!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.uid}
          renderItem={renderMatch}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingBottom: 12, backgroundColor: COLORS.primary },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  loader: { marginTop: 60 },
  list: { padding: 16, gap: 14 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  nickname: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  overlapBadge: {
    marginTop: 4,
    backgroundColor: COLORS.success + '20',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  overlapText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  sharedLabel: { fontSize: 12, color: COLORS.subtext, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tag: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: { fontSize: 11, color: COLORS.primary, fontWeight: '500' },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.subtext, textAlign: 'center', lineHeight: 22 },
});
