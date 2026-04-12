import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Colors from '@/constants/colors';

const createShadow = (opacity: number = 0.08, radius: number = 4, offsetY: number = 1) => Platform.select({
  web: { boxShadow: `0px ${offsetY}px ${radius}px rgba(0,0,0,${opacity})` },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.ceil(radius / 2),
  },
}) as any;

const MODES = [
  { key: 'focus', label: 'Focus', minutes: 25, color: '#D4637A' },
  { key: 'short', label: 'Short Break', minutes: 5, color: '#4CAF82' },
  { key: 'long', label: 'Long Break', minutes: 15, color: '#5B9BD5' },
] as const;

export default function PomodoroScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState(0);
  const [seconds, setSeconds] = useState(MODES[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useSharedValue(0);
  const modeRef = useRef(0);
  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  const isLargeScreen = width > 768;
  const contentWidth = isLargeScreen ? 600 : width;
  const horizontalPadding = isLargeScreen ? (width - contentWidth) / 2 : 0;

  // Keep mode ref up to date for interval callback
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const currentMode = MODES[mode];
  const totalSeconds = currentMode.minutes * 60;

  useEffect(() => {
    progress.value = withTiming(1 - seconds / totalSeconds, { duration: 300 });
  }, [seconds, totalSeconds]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Timer effect with proper cleanup
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsRunning(false);
            if (modeRef.current === 0) {
              setSessions(s => s + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or when isRunning changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Reset timer when mode changes
  useEffect(() => {
    if (!isRunning) {
      setSeconds(MODES[mode].minutes * 60);
      progress.value = 0;
    }
  }, [mode]);

  function switchMode(index: number) {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setMode(index);
    setSeconds(MODES[index].minutes * 60);
    progress.value = 0;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function toggleTimer() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  }

  function resetTimer() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSeconds(currentMode.minutes * 60);
    progress.value = 0;
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad, backgroundColor: currentMode.color + '08', paddingHorizontal: horizontalPadding }]}>
      <View style={isLargeScreen ? { alignSelf: 'center', width: contentWidth } : { width: '100%' }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Focus Timer</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.modeRow}>
          {MODES.map((m, i) => (
            <Pressable
              key={m.key}
              onPress={() => switchMode(i)}
              style={[
                styles.modeBtn,
                mode === i && { backgroundColor: m.color + '20', borderColor: m.color },
              ]}
            >
              <Text style={[styles.modeText, mode === i && { color: m.color }]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, { borderColor: currentMode.color + '30' }]}>
            <Text style={[styles.timerText, { color: currentMode.color }]}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </Text>
            <Text style={styles.timerLabel}>{currentMode.label}</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { backgroundColor: currentMode.color }, progressStyle]} />
        </View>

        <View style={styles.controls}>
          <Pressable onPress={resetTimer} style={styles.controlBtn}>
            <Ionicons name="refresh" size={28} color={Colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={toggleTimer}
            style={[styles.playBtn, { backgroundColor: currentMode.color }]}
          >
            <Ionicons
              name={isRunning ? "pause" : "play"}
              size={32}
              color="#fff"
            />
          </Pressable>
          <Pressable
            onPress={() => switchMode((mode + 1) % MODES.length)}
            style={styles.controlBtn}
          >
            <Ionicons name="arrow-forward" size={28} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: currentMode.color }]}>{sessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: currentMode.color }]}>{sessions * 25}</Text>
            <Text style={styles.statLabel}>Minutes focused</Text>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Ionicons name="bulb" size={18} color={Colors.accent} />
          <Text style={styles.tipsText}>
            Work for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer break.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
  },
  modeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 32,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textMuted,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontFamily: 'Nunito_800ExtraBold',
  },
  timerLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textMuted,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.inputBg,
    marginHorizontal: 40,
    marginBottom: 32,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    ...createShadow(0.15, 8, 4),
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statNum: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textMuted,
    marginTop: 2,
  },
  tipsCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.accent + '10',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

