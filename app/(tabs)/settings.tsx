import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing } from '../../src/theme';

function SettingRow({
  label,
  description,
  action,
}: {
  label: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
      </View>
      {action ? <View style={styles.rowAction}>{action}</View> : null}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          await supabase.auth.signOut();
          setSigningOut(false);
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ACCOUNT</Text>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Plan */}
        <SectionHeader title="Plan" />
        <View style={styles.card}>
          <SettingRow
            label="Modus"
            description="All features included — always free"
            action={
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>Free</Text>
              </View>
            }
          />
        </View>

        {/* App */}
        <SectionHeader title="App" />
        <View style={styles.card}>
          <SettingRow
            label="Version"
            description="1.0.0"
          />
          <View style={styles.divider} />
          <SettingRow
            label="Platform"
            description="iOS &amp; Android"
          />
        </View>

        {/* Data */}
        <SectionHeader title="Data &amp; Privacy" />
        <View style={styles.card}>
          <SettingRow
            label="Privacy Policy"
            action={
              <Text style={styles.link}>View →</Text>
            }
          />
          <View style={styles.divider} />
          <SettingRow
            label="Terms of Service"
            action={
              <Text style={styles.link}>View →</Text>
            }
          />
        </View>

        {/* Sign out */}
        <SectionHeader title="Account" />
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.75}
        >
          {signingOut
            ? <ActivityIndicator size="small" color={colors.red} />
            : <Text style={styles.signOutText}>Sign out</Text>
          }
        </TouchableOpacity>

        <Text style={styles.footer}>Modus by Blackline · blacklinemeridian.com</Text>
      </ScrollView>
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
  content: { padding: spacing.lg, gap: 4, paddingBottom: 48 },
  sectionHeader: {
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.8,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 12,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, color: colors.hi, fontWeight: '500' },
  rowDesc: { fontSize: 12, color: colors.muted, marginTop: 2 },
  rowAction: { flexShrink: 0 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  freeBadge: {
    backgroundColor: colors.green + '20',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  freeBadgeText: { fontSize: 11, fontWeight: '700', color: colors.green },
  link: { fontSize: 13, color: colors.accent },
  signOutBtn: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.red + '40',
    padding: spacing.md,
    alignItems: 'center',
  },
  signOutText: { fontSize: 14, color: colors.red, fontWeight: '600' },
  footer: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 32,
    opacity: 0.5,
  },
});
