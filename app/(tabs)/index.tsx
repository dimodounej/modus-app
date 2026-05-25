/**
 * Intelligence Feed — the Modus home screen.
 * Mirrors the web IntelligenceFeed component behaviour:
 *  • Pulls from /api/modus/feed on mount + pull-to-refresh
 *  • Swipe right = save to pipeline, swipe left = dismiss
 *  • Tap = open LeadSheet bottom sheet
 */
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeed } from '../../src/hooks/useFeed';
import { saveLead } from '../../src/lib/api';
import { FeedCard } from '../../src/components/FeedCard';
import { LeadSheet } from '../../src/components/LeadSheet';
import { SkeletonFeedCard } from '../../src/components/Skeleton';
import type { FeedItem, Lead } from '../../src/types';
import { colors, spacing } from '../../src/theme';

const SKELETON_COUNT = 5;

export default function FeedScreen() {
  const { items, loading, refreshing, load, removeFeedItem } = useFeed();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => { load(); }, [load]);

  const handleSave = useCallback(async (item: FeedItem) => {
    removeFeedItem(item.id);
    if (item.leadId) {
      await saveLead(item.leadId, { status: 'pipeline' } as Partial<Lead>);
    }
  }, [removeFeedItem]);

  const handleDismiss = useCallback((item: FeedItem) => {
    removeFeedItem(item.id);
  }, [removeFeedItem]);

  const handleOpen = useCallback((item: FeedItem) => {
    if (!item.leadId) return;
    setSelectedLead({
      id: item.leadId,
      email: item.email ?? '',
      first_name: item.name?.split(' ')[0] ?? null,
      last_name: item.name?.split(' ').slice(1).join(' ') || null,
      company: item.company ?? null,
      status: 'cold',
      score: item.intent_score ?? null,
    });
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>INTELLIGENCE FEED</Text>
          <Text style={styles.title}>Today's signals</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => load(true)}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Swipe hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>← dismiss · tap to open · save →</Text>
      </View>

      {/* List */}
      <FlatList
        data={loading ? [] : items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View>
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <SkeletonFeedCard key={i} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>⚡</Text>
              <Text style={styles.emptyHeading}>No signals yet</Text>
              <Text style={styles.emptySub}>
                Install the Meridian pixel to start seeing visitor activity here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            onSave={handleSave}
            onDismiss={handleDismiss}
            onOpen={handleOpen}
          />
        )}
      />

      {/* Lead detail sheet */}
      <LeadSheet
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={(patch) => {
          if (selectedLead) setSelectedLead((l) => l ? { ...l, ...patch } : l);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  eyebrow: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.hi,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: { fontSize: 18, color: colors.muted },
  hint: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  hintText: { fontSize: 10, color: colors.muted, textAlign: 'center', letterSpacing: 0.3 },
  list: { padding: spacing.md },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
    gap: 10,
  },
  emptyEmoji: { fontSize: 40 },
  emptyHeading: { fontSize: 18, fontWeight: '700', color: colors.hi },
  emptySub: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
