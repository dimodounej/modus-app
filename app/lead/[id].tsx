/**
 * /lead/[id] — deep-link target for lead detail.
 * Can be reached via: modus://lead/LEAD_ID
 * Renders the same LeadSheet content as a full-screen modal.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { LeadSheet } from '../../src/components/LeadSheet';
import type { Lead } from '../../src/types';
import { colors, spacing } from '../../src/theme';

export default function LeadModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lead, setLead]     = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setError('No lead ID provided.'); setLoading(false); return; }

    supabase
      .from('leads')
      .select('id, email, first_name, last_name, company, status, score, created_at, source')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err || !data) { setError('Lead not found.'); }
        else { setLead(data as Lead); }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <LeadSheet
        lead={lead}
        onClose={() => router.back()}
        onUpdate={(patch) => setLead((l) => l ? { ...l, ...patch } : l)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  errorText: { fontSize: 14, color: colors.muted },
});
