import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLeads } from '../../src/hooks/useLeads';
import { LeadSheet } from '../../src/components/LeadSheet';
import { Skeleton } from '../../src/components/Skeleton';
import type { Lead } from '../../src/types';
import { colors, spacing } from '../../src/theme';

const STATUS_COLORS: Record<string, string> = {
  cold:         colors.muted,
  warm:         colors.yellow,
  hot:          colors.oxblood,
  converted:    colors.green,
  unsubscribed: colors.red,
};

function LeadRow({ lead, onPress }: { lead: Lead; onPress: () => void }) {
  const name    = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.email;
  const status  = lead.status ?? 'cold';
  const color   = STATUS_COLORS[status] ?? colors.muted;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.72}>
      {/* Status accent */}
      <View style={[styles.rowAccent, { backgroundColor: color }]} />

      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName} numberOfLines={1}>{name}</Text>
          {lead.score != null && (
            <Text style={[styles.rowScore, { color }]}>{lead.score}</Text>
          )}
        </View>
        <Text style={styles.rowSub} numberOfLines={1}>
          {lead.company ? `${lead.company}  ·  ` : ''}{lead.email}
        </Text>
      </View>

      <View style={[styles.statusDot, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

export default function LeadsScreen() {
  const { leads, loading, load, updateLead } = useLeads();
  const [query, setQuery]           = useState('');
  const [selected, setSelected]     = useState<Lead | null>(null);

  useEffect(() => { load(); }, [load]);

  const filtered = leads.filter((l) => {
    const q = query.toLowerCase();
    return (
      !q ||
      l.email.toLowerCase().includes(q) ||
      (l.first_name ?? '').toLowerCase().includes(q) ||
      (l.last_name ?? '').toLowerCase().includes(q) ||
      (l.company ?? '').toLowerCase().includes(q)
    );
  });

  const onRefresh = useCallback(() => load(), [load]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CRM</Text>
        <Text style={styles.title}>Leads</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search leads…"
          placeholderTextColor={colors.muted}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 10, padding: spacing.md }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={{ gap: 6 }}>
                  <Skeleton width="55%" height={14} />
                  <Skeleton width="80%" height={11} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {query ? 'No leads match your search.' : 'Your first visitor is out there.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <LeadRow lead={item} onPress={() => setSelected(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <LeadSheet
        lead={selected}
        onClose={() => setSelected(null)}
        onUpdate={(patch) => {
          if (selected) {
            updateLead(selected.id, patch);
            setSelected((l) => l ? { ...l, ...patch } : l);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  eyebrow: { fontSize: 9, color: colors.muted, letterSpacing: 1.5, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '700', color: colors.hi },
  searchWrap: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  search: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    fontSize: 14,
    color: colors.hi,
  },
  list: { paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
  },
  rowAccent: { width: 2, height: 36, borderRadius: 1, marginRight: 12, flexShrink: 0 },
  rowContent: { flex: 1, gap: 3 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowName: { fontSize: 14, fontWeight: '600', color: colors.hi, flex: 1 },
  rowScore: { fontSize: 12, fontWeight: '700', marginLeft: 8 },
  rowSub: { fontSize: 12, color: colors.muted },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginLeft: 10, flexShrink: 0 },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 14 },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});
