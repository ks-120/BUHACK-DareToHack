import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../types';
import { COLORS } from '../utils/constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

export default function MainScreen({ navigation }: Props) {
  const { profile } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {profile?.nickname ?? 'Buddy'} 👋</Text>
            <Text style={styles.subGreeting}>What would you like to do today?</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsEmoji}>⭐</Text>
            <Text style={styles.pointsText}>{profile?.points ?? 0} pts</Text>
          </View>
        </View>

        {/* Three Big Cards */}
        <View style={styles.cards}>
          <ActionCard
            emoji="🤝"
            title="Match a Buddy"
            description="Find students with 70%+ shared interests and connect"
            color="#003366"
            onPress={() => navigation.navigate('Match')}
          />
          <ActionCard
            emoji="📅"
            title="School Events"
            description="Browse & RSVP to official and student-created events"
            color="#1A5276"
            onPress={() => navigation.navigate('Events')}
          />
          <ActionCard
            emoji="💬"
            title="Community Feed"
            description="Post groupmate requests, lost & found, and more"
            color="#154360"
            onPress={() => navigation.navigate('Feed')}
          />
        </View>

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <View style={styles.quickLinks}>
          <QuickLink emoji="🗺️" label="Campus Map" />
          <QuickLink emoji="🎯" label="Clubs" />
          <QuickLink emoji="📚" label="Resources" />
          <QuickLink emoji="🏆" label="Leaderboard" onPress={() => navigation.navigate('Leaderboard')} />
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({
  emoji,
  title,
  description,
  color,
  onPress,
}: {
  emoji: string;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

function QuickLink({ emoji, label, onPress }: { emoji: string; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.quickLinkItem} onPress={onPress}>
      <Text style={styles.quickLinkEmoji}>{emoji}</Text>
      <Text style={styles.quickLinkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    marginTop: 8,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  subGreeting: { fontSize: 13, color: COLORS.subtext, marginTop: 2 },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  pointsEmoji: { fontSize: 14 },
  pointsText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 13 },
  cards: { gap: 14, marginBottom: 28 },
  card: {
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cardEmoji: { fontSize: 36 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 18 },
  cardArrow: { color: COLORS.white, fontSize: 28, opacity: 0.6 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  quickLinks: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  quickLinkItem: {
    flex: 1,
    minWidth: 80,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickLinkEmoji: { fontSize: 24, marginBottom: 6 },
  quickLinkLabel: { fontSize: 12, color: COLORS.text, fontWeight: '500', textAlign: 'center' },
  signOutBtn: { alignItems: 'center', paddingVertical: 8 },
  signOutText: { color: COLORS.subtext, fontSize: 14 },
});
