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
  Modal,
  TextInput,
} from 'react-native';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  increment,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { Event } from '../types';
import { COLORS } from '../utils/constants';

export default function EventsScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      const list: Event[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Event));
      setEvents(list);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (event: Event) => {
    if (!user) return;
    if (event.rsvpList?.includes(user.uid)) {
      Alert.alert('Already RSVPd', 'You have already RSVPd to this event.');
      return;
    }
    try {
      await updateDoc(doc(db, 'events', event.id), {
        rsvpCount: increment(1),
        rsvpList: [...(event.rsvpList ?? []), user.uid],
      });
      await updateDoc(doc(db, 'users', user.uid), { points: increment(20) });
      refreshProfile();
      loadEvents();
      Alert.alert('🎉 RSVP Confirmed', `You're going to "${event.title}"!`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleCreateEvent = async () => {
    if (!newTitle.trim() || !newDesc.trim() || !newLocation.trim() || !newDate.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    setCreating(true);
    try {
      const parsedDate = new Date(newDate).getTime();
      if (isNaN(parsedDate)) {
        Alert.alert('Invalid Date', 'Please enter a valid date (e.g. 2025-12-25).');
        return;
      }
      await addDoc(collection(db, 'events'), {
        title: newTitle.trim(),
        description: newDesc.trim(),
        date: parsedDate,
        location: newLocation.trim(),
        organizer: profile?.nickname ?? 'Unknown',
        rsvpCount: 0,
        rsvpList: [],
        isOfficial: false,
      });
      setNewTitle('');
      setNewDesc('');
      setNewLocation('');
      setNewDate('');
      setShowCreate(false);
      loadEvents();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setCreating(false);
    }
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const isRsvped = item.rsvpList?.includes(user?.uid ?? '') ?? false;
    const dateStr = new Date(item.date).toLocaleDateString('en-HK', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{dateStr}</Text>
          </View>
          {item.isOfficial && (
            <View style={styles.officialBadge}>
              <Text style={styles.officialText}>🏫 Official</Text>
            </View>
          )}
        </View>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.eventMeta}>
          <Text style={styles.metaItem}>📍 {item.location}</Text>
          <Text style={styles.metaItem}>👥 {item.rsvpCount} going</Text>
        </View>
        <TouchableOpacity
          style={[styles.rsvpBtn, isRsvped && styles.rsvpBtnDone]}
          onPress={() => handleRSVP(item)}
          disabled={isRsvped}
        >
          <Text style={[styles.rsvpText, isRsvped && styles.rsvpTextDone]}>
            {isRsvped ? '✅ RSVPd' : 'RSVP +20pts'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 School Events</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.addBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} size="large" />
      ) : events.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>No events yet</Text>
          <Text style={styles.emptyText}>Be the first to create a student event!</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create Event</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Event title"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description"
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Location"
              value={newLocation}
              onChangeText={setNewLocation}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Date (YYYY-MM-DD)"
              value={newDate}
              onChangeText={setNewDate}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowCreate(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, creating && styles.disabled]}
                onPress={handleCreateEvent}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>Create</Text>
                )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 14,
    backgroundColor: COLORS.primary,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  addBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  addBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  loader: { marginTop: 60 },
  list: { padding: 16, gap: 14 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dateBadge: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  dateBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  officialBadge: {
    backgroundColor: COLORS.secondary + '30',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  officialText: { fontSize: 12, color: '#8B6914', fontWeight: '600' },
  eventTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text, marginBottom: 6 },
  eventDesc: { fontSize: 13, color: COLORS.subtext, lineHeight: 19, marginBottom: 10 },
  eventMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { fontSize: 12, color: COLORS.subtext },
  rsvpBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rsvpBtnDone: { backgroundColor: COLORS.success + '20' },
  rsvpText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  rsvpTextDone: { color: COLORS.success },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.subtext, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    color: COLORS.text,
  },
  modalTextArea: { height: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: { color: COLORS.subtext, fontSize: 14 },
  modalConfirm: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  disabled: { opacity: 0.5 },
});
