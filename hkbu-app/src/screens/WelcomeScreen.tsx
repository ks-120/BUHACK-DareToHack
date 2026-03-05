import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../utils/constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎓</Text>
          <Text style={styles.appName}>HKBU Buddy</Text>
          <Text style={styles.tagline}>
            A verified HKBU student app that matches you with buddies,{'\n'}
            plugs you into school events, and lets you post{'\n'}
            "need groupmates" requests – 100% school-focused.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem emoji="🤝" text="Find buddies with shared interests" />
          <FeatureItem emoji="📅" text="Join school events & RSVP" />
          <FeatureItem emoji="💬" text="Community feed & groupmate finder" />
          <FeatureItem emoji="🔒" text="Only nicknames shown – stay private" />
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  logoEmoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    color: COLORS.white,
    fontSize: 15,
    flex: 1,
  },
  buttons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
});
