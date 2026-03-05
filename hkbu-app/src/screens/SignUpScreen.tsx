import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, db } from '../config/firebase';
import { RootStackParamList } from '../types';
import { COLORS, INTERESTS, HKBU_EMAIL_REGEX } from '../utils/constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: Props) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSignUp = async () => {
    if (!nickname.trim()) {
      Alert.alert('Missing Info', 'Please enter a nickname.');
      return;
    }
    if (!HKBU_EMAIL_REGEX.test(email)) {
      Alert.alert('Invalid Email', 'Please use your HKBU email address (@student.hkbu.edu.hk, @life.hkbu.edu.hk or @hkbu.edu.hk).');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (selectedInterests.length === 0) {
      Alert.alert('No Interests', 'Please select at least one interest.');
      return;
    }
    setShowPrivacyModal(true);
  };

  const handleConfirmSignUp = async () => {
    if (!privacyConsent) {
      Alert.alert('Privacy Consent', 'Please agree to the Privacy Policy and T&C.');
      return;
    }
    setShowPrivacyModal(false);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        nickname: nickname.trim(),
        email: email.toLowerCase(),
        interests: selectedInterests,
        privacyConsent: true,
        points: 0,
        createdAt: Date.now(),
      });
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the HKBU Buddy community 🎓</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Nickname (shown publicly)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. StargazerAlex"
            value={nickname}
            onChangeText={setNickname}
            maxLength={24}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>HKBU Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@student.hkbu.edu.hk"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Interests (select all that apply)</Text>
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  selectedInterests.includes(interest) && styles.interestChipSelected,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.interestText,
                    selectedInterests.includes(interest) && styles.interestTextSelected,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Privacy Modal */}
      <Modal visible={showPrivacyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🔒 Privacy Notice</Text>
            <Text style={styles.modalText}>
              We only display your <Text style={styles.bold}>nickname</Text> to other users.
              Your real name, email, and personal data stay private and are never shared.{'\n\n'}
              By continuing, you agree to our{' '}
              <Text style={styles.bold}>Privacy Policy</Text> and{' '}
              <Text style={styles.bold}>Terms & Conditions</Text>.
            </Text>

            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => setPrivacyConsent(!privacyConsent)}
            >
              <View style={[styles.checkbox, privacyConsent && styles.checkboxChecked]}>
                {privacyConsent && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.consentText}>
                I agree to the Privacy Policy and T&C
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={styles.modalCancelText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, !privacyConsent && styles.buttonDisabled]}
                onPress={handleConfirmSignUp}
              >
                <Text style={styles.modalConfirmText}>Join Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.subtext, marginBottom: 24 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
  },
  interestChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  interestText: { fontSize: 13, color: COLORS.text },
  interestTextSelected: { color: COLORS.white, fontWeight: '600' },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: COLORS.primary, fontSize: 17, fontWeight: 'bold' },
  linkText: { textAlign: 'center', color: COLORS.primary, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },
  modalText: { fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 20 },
  bold: { fontWeight: 'bold' },
  consentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.primary },
  checkmark: { color: COLORS.white, fontSize: 14, fontWeight: 'bold' },
  consentText: { fontSize: 14, color: COLORS.text, flex: 1 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, color: COLORS.subtext },
  modalConfirm: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmText: { fontSize: 15, color: COLORS.white, fontWeight: 'bold' },
});
