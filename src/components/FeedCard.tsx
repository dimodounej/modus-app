'use client';
import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';
import type { FeedItem } from '../types';

const SWIPE_THRESHOLD = 80;
const ACCENT: Record<string, string> = {
  lead:    colors.oxblood,
  visitor: colors.oxblood,
  deal:    colors.green,
  alert:   colors.yellow,
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface Props {
  item: FeedItem;
  onSave:    (item: FeedItem) => void;
  onDismiss: (item: FeedItem) => void;
  onOpen:    (item: FeedItem) => void;
  style?: ViewStyle;
}

export function FeedCard({ item, onSave, onDismiss, onOpen, style }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;

  const bgColor = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    outputRange: [colors.red + '30', 'transparent', colors.green + '30'],
    extrapolate: 'clamp',
  });

  const flyOut = (direction: 'left' | 'right', cb: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction === 'right' ? 400 : -400,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => cb());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8,
      onPanResponderMove: (_, { dx }) => translateX.setValue(dx),
      onPanResponderRelease: (_, { dx, vx }) => {
        const isRight = dx > SWIPE_THRESHOLD || vx > 0.5;
        const isLeft  = dx < -SWIPE_THRESHOLD || vx < -0.5;
        if (isRight) {
          flyOut('right', () => onSave(item));
        } else if (isLeft) {
          flyOut('left', () => onDismiss(item));
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.wrapper, { transform: [{ translateX }], opacity }, style]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor, borderRadius: 8 }]} />
      <Pressable style={styles.card} onPress={() => onOpen(item)}>
        {/* Left accent bar */}
        <View style={[styles.accent, { backgroundColor: ACCENT[item.type] ?? colors.accent }]} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>

          {/* Type pill */}
          <View style={[styles.pill, { backgroundColor: (ACCENT[item.type] ?? colors.accent) + '20' }]}>
            <Text style={[styles.pillText, { color: ACCENT[item.type] ?? colors.accent }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Swipe hint dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  accent: {
    width: 3,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.hi,
  },
  time: {
    fontSize: 11,
    color: colors.muted,
    flexShrink: 0,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  dots: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    paddingRight: 10,
    paddingLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.muted,
    opacity: 0.4,
  },
});
