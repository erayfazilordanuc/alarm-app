import SegmentedControl from "@/components/ui/segmented-control";
import TimePicker from "@/components/ui/time-picker";
import { getThemeColors, ThemeColorName } from "@/lib/color-system";
import { TranslationKey, translations } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { Flag, Pause, Play, RotateCcw } from "lucide-react-native";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Stopwatch Component ---
interface StopwatchViewProps {
  time: number;
  isRunning: boolean;
  laps: number[];
  onToggle: () => void;
  onReset: () => void;
  onLap: () => void;
  themeColor: ThemeColorName;
  isDark: boolean;
  t: Record<string, string>;
}

const StopwatchView = memo(
  ({
    time,
    isRunning,
    laps,
    onToggle,
    onReset,
    onLap,
    themeColor,
    isDark,
  }: StopwatchViewProps) => {
    const colors = getThemeColors(themeColor, isDark);

    const formatStopwatch = (ms: number) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const centiseconds = Math.floor((ms % 1000) / 10);
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
    };

    return (
      <View className="w-full items-center">
        {/* LED Display Look */}
        <View
          className="w-72 h-72 rounded-full border-4 items-center justify-center mb-10"
          style={{
            borderColor: isRunning ? colors.main : isDark ? "#333" : "#ddd",
          }}
        >
          <Text className="text-5xl font-mono font-bold text-black dark:text-white">
            {formatStopwatch(time)}
          </Text>
        </View>

        {/* Laps List (Limited height) */}
        {laps.length > 0 ? (
          <View className="h-40 w-full mb-6">
            <FlatList
              data={laps}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item, index }) => (
                <View className="flex-row justify-between border-b border-gray-100 dark:border-zinc-800 py-2">
                  <Text className="text-gray-500">
                    Lap {laps.length - index}
                  </Text>
                  <Text className="font-mono text-black dark:text-white">
                    {formatStopwatch(item)}
                  </Text>
                </View>
              )}
            />
          </View>
        ) : (
          <View className="h-40 w-full mb-6" /> // Placeholder to keep layout stable but empty? Or remove?
          // If the user wants it CENTERED, removing it is better.
          // Let's remove the View entirely if no laps.
        )}

        {/* Controls */}
        <View className="flex-row gap-8">
          <Pressable
            onPress={isRunning ? onLap : onReset}
            className="w-16 h-16 rounded-full items-center justify-center bg-gray-200 dark:bg-zinc-800"
          >
            {isRunning ? (
              <Flag size={24} color={isDark ? "white" : "black"} />
            ) : (
              <RotateCcw size={24} color={isDark ? "white" : "black"} />
            )}
          </Pressable>

          <Pressable
            onPress={onToggle}
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{
              backgroundColor: isRunning ? "#EF4444" : colors.main,
            }}
          >
            {isRunning ? (
              <Pause size={32} color="white" fill="white" />
            ) : (
              <Play size={32} color="white" fill="white" />
            )}
          </Pressable>
        </View>
      </View>
    );
  },
);

// --- Timer Component ---
interface TimerViewProps {
  remaining: number;
  duration: Date;
  isRunning: boolean;
  isPaused: boolean;
  onDurationChange: (date: Date) => void;
  onReset: () => void;
  onToggle: () => void;
  onStart: () => void;
  onPause: () => void;
  themeColor: ThemeColorName;
  isDark: boolean;
  t: Record<TranslationKey, string>;
}

const TimerView = memo(
  ({
    remaining,
    duration,
    isRunning,
    isPaused,
    onDurationChange,
    onReset,
    onStart,
    onPause,
    themeColor,
    isDark,
    t,
  }: TimerViewProps) => {
    const colors = getThemeColors(themeColor, isDark);

    const formatTimer = (ms: number) => {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
      <View className="w-full items-center">
        {/* Timer Display / Picker */}
        {isRunning || isPaused ? (
          <View
            className="w-72 h-72 rounded-full border-4 items-center justify-center mb-20"
            style={{
              borderColor: isPaused ? "#F59E0B" : colors.main,
            }}
          >
            <Text className="text-6xl font-mono font-bold text-black dark:text-white">
              {formatTimer(remaining)}
            </Text>
            <Text className="text-gray-400 mt-2">
              {isPaused ? t.pause : "Running"}
            </Text>
          </View>
        ) : (
          <View className="mb-20 w-full items-center">
            <Text className="text-gray-500 mb-4 font-medium uppercase tracking-widest">
              {t.setTime}
            </Text>
            <TimePicker
              date={duration}
              onDateChange={onDurationChange}
              themeColor={themeColor}
            />
            <Text className="text-xs text-gray-400 mt-4 text-center">
              Hours : Minutes
            </Text>
          </View>
        )}

        {/* Controls */}
        <View className="flex-row gap-8">
          <Pressable
            onPress={onReset}
            disabled={!isPaused && !isRunning}
            className="w-16 h-16 rounded-full items-center justify-center bg-gray-200 dark:bg-zinc-800"
            style={{
              opacity: !isPaused && !isRunning ? 0.3 : 1,
            }}
          >
            <RotateCcw size={24} color={isDark ? "white" : "black"} />
          </Pressable>

          <Pressable
            onPress={isRunning ? onPause : onStart}
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{
              backgroundColor: isRunning ? "#F59E0B" : colors.main,
            }}
          >
            {isRunning ? (
              <Pause size={32} color="white" fill="white" />
            ) : (
              <Play size={32} color="white" fill="white" />
            )}
          </Pressable>
        </View>
      </View>
    );
  },
);

export default function TimerScreen() {
  const { language, theme, themeColor } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const isDark =
    theme === "dark" || (theme === "auto" && systemColorScheme === "dark");
  const t = translations[language];

  // Mode: "stopwatch" | "timer"
  const [mode, setMode] = useState<"stopwatch" | "timer">("stopwatch");

  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const stopwatchInterval = useRef<any | null>(null);

  // Timer State
  const [timerDuration, setTimerDuration] = useState(
    new Date(0, 0, 0, 0, 5, 0),
  ); // Default 5 min
  const [timerRemaining, setTimerRemaining] = useState(300000); // 5 min in ms
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false); // New state to track if started but paused
  const timerInterval = useRef<any | null>(null);

  // --- Stopwatch Logic ---
  useEffect(() => {
    if (isStopwatchRunning) {
      const startTime = Date.now() - stopwatchTime;
      stopwatchInterval.current = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 30) as any; // ~30fps update
    } else {
      if (stopwatchInterval.current) clearInterval(stopwatchInterval.current);
    }
    return () => {
      if (stopwatchInterval.current) clearInterval(stopwatchInterval.current);
    };
  }, [isStopwatchRunning]);

  const toggleStopwatch = useCallback(() => {
    setIsStopwatchRunning((prev) => !prev);
  }, []);

  const resetStopwatch = useCallback(() => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  }, []);

  const lapStopwatch = useCallback(() => {
    setLaps((prev) => [stopwatchTime, ...prev]);
  }, [stopwatchTime]);

  // --- Timer Logic ---
  useEffect(() => {
    if (isTimerRunning && timerRemaining > 0) {
      const startTime = Date.now();
      const initialRemaining = timerRemaining;

      timerInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newRemaining = initialRemaining - elapsed;
        if (newRemaining <= 0) {
          setTimerRemaining(0);
          setIsTimerRunning(false);
          setIsTimerPaused(false);
          // TODO: Trigger alarm/notification here
          if (timerInterval.current) clearInterval(timerInterval.current);
        } else {
          setTimerRemaining(newRemaining);
        }
      }, 100) as any;
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [isTimerRunning]);

  const startTimer = useCallback(() => {
    if (timerRemaining === 0 || (!isTimerRunning && !isTimerPaused)) {
      // Reset from picker
      const totalMs =
        timerDuration.getHours() * 3600000 + timerDuration.getMinutes() * 60000;
      // Note: We are ignoring seconds because TimePicker doesn't have them yet.

      if (totalMs === 0) return;
      setTimerRemaining(totalMs);
    }
    setIsTimerRunning(true);
    setIsTimerPaused(false);
  }, [timerRemaining, isTimerRunning, isTimerPaused, timerDuration]);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
    setIsTimerPaused(true);
  }, []);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setIsTimerPaused(false);
    // Reset to picker value
    const totalMs =
      timerDuration.getHours() * 3600000 + timerDuration.getMinutes() * 60000;
    setTimerRemaining(totalMs);
  }, [timerDuration]);

  // no-op toggle for internal consistency if needed,
  // but TimerView uses start/pause explicitly.
  const toggleTimer = useCallback(() => {
    // Legacy holder if needed
  }, []);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header (Mode Selector) */}
        <View className="px-6 mt-16">
          <SegmentedControl
            options={["stopwatch", "timer"]}
            selectedOption={mode}
            onOptionPress={(opt) => setMode(opt as "stopwatch" | "timer")}
            themeColor={themeColor}
            labels={{ stopwatch: t.stopwatch, timer: t.timer }}
          />
        </View>

        <View className="flex-1 justify-center items-center px-6 mb-6">
          {mode === "stopwatch" ? (
            <StopwatchView
              time={stopwatchTime}
              isRunning={isStopwatchRunning}
              laps={laps}
              onToggle={toggleStopwatch}
              onReset={resetStopwatch}
              onLap={lapStopwatch}
              themeColor={themeColor}
              isDark={isDark}
              t={t}
            />
          ) : (
            <TimerView
              remaining={timerRemaining}
              duration={timerDuration}
              isRunning={isTimerRunning}
              isPaused={isTimerPaused}
              onDurationChange={setTimerDuration}
              onReset={resetTimer}
              onToggle={toggleTimer} // Not strictly used by new View but kept for interface match
              onStart={startTimer}
              onPause={pauseTimer}
              themeColor={themeColor}
              isDark={isDark}
              t={t}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
