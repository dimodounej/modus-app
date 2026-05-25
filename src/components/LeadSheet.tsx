import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { fetchLeadVisits, runConversionAgent, saveLead } from '../lib/api';
import type { Lead, Visit } from '../types';
import { colors, spacing } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');

const STATUS_COLORS: Record<string, string> = {
  cold:         colors.muted,
  warm:         colors.yellow,
  hot:          colors.oxblood,
  converted:    colors.green,
  unsubscribed: colors.red,
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(lead: Lead) {
  const f = lead.first_name?.[0] ?? '';
  const l = lead.last_name?.[0] ?? '';
  return (f + l).toUpperCase() || lead.email[0].toUpperCase();
}

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (patch: Partial<Lead>) => void;
}

export function LeadSheet({ lead, onClose, onUpdate }: Props) {
  const translateY = React.useRef(new Animated.Value(SCREEN_H)).current;
  const [visits, setVisits]       = useState<Visit[]>([]);
  const [visitsLoading, setVL]    = useState(false);
  const [saving, setSaving]       = useState(false);
  const [agentRunning, setAgent]  = useState(false);
  const [toast, setToast]         = useState<string | null>(null);
  const [name, setName]           = useState('');
  const [company, setCompany]     = useState('');
  const [status, setStatus]       = useState('cold');

  const statuses = ['cold', 'warm', 'hot', 'converted'];

  // Sync form fields when lead changes
  useEffect(() => {
    if (!lead) return;
    setName([lead.first_name, lead.last_name].filter(Boolean).join(' '));
    setCompany(lead.company ?? '');
    setStatus(lead.status ?? 'cold');
    // Slide up
    Animated.spring(translateY, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
    // Load visits
    setVL(true);
    fetchLeadVisits(lead.id).then((v) => { setVisits(v); setVL(false); });
  }, [lead?.id]);

  const close = useCallback(() => {
    Animated.timing(translateY, { toValue: SCREEN_H, duration: 280, useNativeDriver: true }).start(onClose);
  }, [onClose, translateY]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    const ok = await saveLead(lead.id, { company, status });
    setSaving(false);
    if (ok) {
      onUpdate({ company, status });
      showToast('Saved');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      showToast('Save failed — try again');
    }
  };

  const handleRunAgent = async () => {
    if (!lead) return;
    setAgent(true);
    const ok = await runConversionAgent(lead.id);
    setAgent(false);
    if (ok) {
      showToast('Draft added to Outbox');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      showToast('Agent run failed');
    }
  };

  if (!lead) return null;

  const statusColor = STATUS_COLORS[lead.status ?? 'cold'] ?? colors.muted;
  const displayName = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.email;

  return (
    <Modal visible={!!lead} transparent animationType="none" onRequestClose={close}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={close} />

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Drag handle */}
        <View style={styles.handle} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(lead)}</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.displayName} numberOfLines={1}>{displayName}</Text>
                {lead.company ? <Text style={styles.company} numberOfLines={1}>{lead.company}</Text> : null}
                <Text style={styles.email} numberOfLines={1}>{lead.email}</Text>
              </View>
            </View>

            {/* Status + intent score */}
            <View style={styles.statusRow}>
              <View style={[styles.badge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
                <Text style={[styles.badgeText, { color: statusColor }]}>{lead.status?.toUpperCase()}</Text>
              </View>
              {lead.score != null && (
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreNum}>{lead.score}</Text>
                  <View style={styles.scoreTrack}>
                    <View style={[styles.scoreFill, { width: `${Math.min(100, lead.score)}%` }]} />
                  </View>
                  <Text style={styles.scoreLabel}>INTENT</Text>
                </View>
              )}
            </View>

            {/* Toast */}
            {toast ? (
              <View style={styles.toast}>
                <Text style={styles.toastText}>{toast}</Text>
              </View>
            ) : null}

            {/* Visit history */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
              {visitsLoading && <ActivityIndicator size="small" color={colors.muted} style={{ marginTop: 8 }} />}
              {!visitsLoading && visits.length === 0 && (
                <Text style={styles.emptyText}>No page visits recorded yet.</Text>
              )}
              {!visitsLoading && visits.slice(0, 8).map((v, i) => (
                <View key={i} style={styles.visitRow}>
                  <View style={styles.visitDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.visitUrl} numberOfLines={1}>
                      {v.page_url.replace(/^https?:\/\/[^/]+/, '')}
                    </Text>
                    <Text style={styles.visitTime}>{timeAgo(v.created_at)}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Edit */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DETAILS</Text>
              <Text style={styles.inputLabel}>Company</Text>
              <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="Company name"
                placeholderTextColor={colors.muted}
              />
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Status</Text>
              <View style={styles.statusPicker}>
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatus(s)}
                    style={[
                      styles.statusOption,
                      status === s && {
                        backgroundColor: (STATUS_COLORS[s] ?? colors.accent) + '20',
                        borderColor: STATUS_COLORS[s] ?? colors.accent,
                      },
                    ]}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      status === s && { color: STATUS_COLORS[s] ?? colors.accent },
                    ]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Agent action */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>AGENT ACTIONS</Text>
              <TouchableOpacity
                style={styles.agentBtn}
                onPress={handleRunAgent}
                disabled={agentRunning}
                activeOpacity={0.75}
              >
                {agentRunning
                  ? <ActivityIndicator size="small" color={colors.muted} />
                  : <Text style={styles.agentBtnText}>Run Conversion AI on this lead →</Text>
                }
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Sticky footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.saveBtnText}>Save</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={close} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,9,7,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_H * 0.88,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.oxblood + '30',
    borderWidth: 1,
    borderColor: colors.oxblood + '50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '600', color: colors.oxblood },
  headerText: { flex: 1 },
  displayName: { fontSize: 18, fontWeight: '600', color: colors.hi, marginBottom: 2 },
  company: { fontSize: 12, color: colors.muted },
  email: { fontSize: 11, color: colors.muted, fontFamily: 'SpaceMono' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreNum: { fontSize: 14, fontWeight: '600', color: colors.hi },
  scoreTrack: {
    width: 60, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden',
  },
  scoreFill: { height: '100%', backgroundColor: colors.oxblood, borderRadius: 2 },
  scoreLabel: { fontSize: 9, color: colors.muted, letterSpacing: 0.6 },
  toast: {
    margin: 16,
    padding: 10,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.green + '40',
  },
  toastText: { fontSize: 12, color: colors.green, textAlign: 'center' },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.2,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: { fontSize: 12, color: colors.muted },
  visitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  visitDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: colors.muted,
    marginTop: 4, flexShrink: 0,
  },
  visitUrl: { fontSize: 12, color: colors.hi },
  visitTime: { fontSize: 10, color: colors.muted, marginTop: 2 },
  inputLabel: { fontSize: 10, color: colors.muted, letterSpacing: 0.8, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    color: colors.hi,
  },
  statusPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusOptionText: { fontSize: 12, color: colors.muted, textTransform: 'capitalize' },
  agentBtn: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  agentBtnText: { fontSize: 12, color: colors.muted, letterSpacing: 0.4 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.oxblood,
    borderRadius: 8,
    padding: 13,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  closeBtn: {
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 13, color: colors.muted },
});
