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
  doc,
  updateDoc,
  increment,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { Post } from '../types';
import { COLORS, POST_TAGS } from '../utils/constants';

export default function FeedScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: Post[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Post));
      setPosts(list);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePost = async () => {
    if (!newContent.trim()) {
      Alert.alert('Empty Post', 'Please write something before posting.');
      return;
    }
    setCreating(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user!.uid,
        authorNickname: profile?.nickname ?? 'Anonymous',
        content: newContent.trim(),
        tags: selectedTags,
        createdAt: Date.now(),
        likes: 0,
      });
      // Gamification: +5 pts for posting
      await updateDoc(doc(db, 'users', user!.uid), { points: increment(5) });
      refreshProfile();
      setNewContent('');
      setSelectedTags([]);
      setShowCreate(false);
      loadPosts();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (post: Post) => {
    try {
      await updateDoc(doc(db, 'posts', post.id), { likes: increment(1) });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, likes: p.likes + 1 } : p))
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.authorNickname.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.authorName}>{item.authorNickname}</Text>
          <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      {item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(item)}>
        <Text style={styles.likeBtnText}>❤️ {item.likes}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Community Feed</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.addBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} size="large" />
      ) : posts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyText}>
            Be the first to post! Looking for groupmates? Need a +1 for an event?
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Post</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder={"Looking for groupmates for COMP2010...\nAnyone going to the Wellness Fair?\nExchange student seeking hiking buddies..."}
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.tagsLabel}>Tags</Text>
            <View style={styles.tagsGrid}>
              {POST_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    selectedTags.includes(tag) && styles.tagChipSelected,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      selectedTags.includes(tag) && styles.tagChipTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setShowCreate(false);
                  setNewContent('');
                  setSelectedTags([]);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, creating && styles.disabled]}
                onPress={handlePost}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>Post +5pts</Text>
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
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  authorName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  timestamp: { fontSize: 11, color: COLORS.subtext },
  content: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  tagText: { fontSize: 11, color: COLORS.primary },
  likeBtn: { flexDirection: 'row', alignItems: 'center' },
  likeBtnText: { fontSize: 13, color: COLORS.subtext },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.subtext, textAlign: 'center', lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 14 },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
    color: COLORS.text,
  },
  modalTextArea: { height: 100, textAlignVertical: 'top' },
  tagsLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  tagChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tagChipText: { fontSize: 12, color: COLORS.text },
  tagChipTextSelected: { color: COLORS.white, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: 10 },
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
