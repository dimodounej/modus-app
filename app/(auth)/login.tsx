import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing } from '../../src/theme';

type Mode = 'email' | 'sent';

export default function LoginScreen() {
  const [email, setEmail]   = useState('');
  const [mode, setMode]     = useState<Mode>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function sendMagicLink() {
    if (!email.trim()) { setError('Enter your email address.'); return; }
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setMode('sent');
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        {/* Wordmark */}
        <View style={styles.logo}>
          <Text style={styles.logoText}>MODUS</Text>
          <Text style={styles.logoSub}>by Blackline</Text>
        </View>

        {mode === 'email' ? (
          <>
            <Text style={styles.heading}>Sign in</Text>
            <Text style={styles.sub}>
              Enter your email and we'll send a magic link — no password needed.
            </Text>

            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="send"
              onSubmitEditing={sendMagicLink}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [styles.btn, pressed && { opacity: 0.82 }]}
              onPress={sendMagicLink}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.btnText}>Continue with email</Text>
              }
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.heading}>Check your inbox</Text>
            <Text style={styles.sub}>
              We sent a magic link to{'\n'}
              <Text style={{ color: colors.hi }}>{email}</Text>
              {'\n\n'}
              Tap the link in your email to sign in. You can close this screen.
            </Text>

            <Pressable
              style={({ pressed }) => [styles.btnOutline, pressed && { opacity: 0.7 }]}
              onPress={() => { setMode('email'); setEmail(''); }}
            >
              <Text style={styles.btnOutlineText}>Use a different email</Text>
            </Pressable>
          </>
        )}

        <Text style={styles.legal}>
          By continuing, you agree to Modus{' '}
          <Text style={{ color: colors.accent }}>Terms</Text>
          {' '}and{' '}
          <Text style={{ color: colors.accent }}>Privacy Policy</Text>.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.hi,
    letterSpacing: 6,
  },
  logoSub: {
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 2,
    marginTop: 4,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.hi,
  },
  sub: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 21,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: colors.hi,
    marginTop: 8,
  },
  inputError: {
    borderColor: colors.red + '70',
  },
  errorText: {
    fontSize: 12,
    color: colors.red,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.bg,
  },
  btnOutline: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnOutlineText: {
    fontSize: 14,
    color: colors.muted,
  },
  legal: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 17,
  },
});
