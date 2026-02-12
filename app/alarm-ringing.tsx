import { snoozeAlarm, stopAlarm } from "@/lib/alarm-service";
import { getThemeColors } from "@/lib/color-system";
import { translations } from "@/lib/i18n";
import { SOUND_FILES } from "@/lib/sounds";
import { useAlarmsStore } from "@/store/alarms";
import { useSettingsStore } from "@/store/settings";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronUp, Clock } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function AlarmRingingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const soundObject = useRef<Audio.Sound | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { language, theme, themeColor } = useSettingsStore();
  const { alarms, setViewMode, setSelectedDay } = useAlarmsStore();
  const colorScheme = useColorScheme();
  const isDark =
    theme === "dark" || (theme === "auto" && colorScheme === "dark");
  const colors = getThemeColors(themeColor, isDark);
  const t = translations[language];

  // Animation values
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0.5);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Timer for clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Play sound
    playSound();

    // Start ripple animation
    rippleScale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
    rippleOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 }),
      ),
      -1,
      true,
    );

    // Pulse animation for clock icon
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );

    return () => {
      clearInterval(timer);
      stopSound();
    };
  }, []);

  const playSound = async () => {
    try {
      // Configure audio session
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Try to load the sound file
      try {
        const soundName = (params.sound as string) || "default";
        // Ensure we fallback to 'default' if the specific sound key doesn't exist
        const soundSource = SOUND_FILES[soundName] || SOUND_FILES["default"];

        const { sound } = await Audio.Sound.createAsync(soundSource);
        soundObject.current = sound;
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
      } catch (e) {
        console.warn(
          "Sound file not found or could not be loaded. Alarm will be silent.",
          e,
        );
      }
    } catch (error) {
      console.log("Error configuring audio session:", error);
    }
  };

  const stopSound = async () => {
    try {
      if (soundObject.current) {
        await soundObject.current.stopAsync();
        await soundObject.current.unloadAsync();
      }
    } catch (error) {
      console.log("Error stopping sound:", error);
    }
  };

  const navigateToAlarms = () => {
    // Get alarm ID from params
    const alarmId = params.alarmId as string | undefined;

    if (alarmId) {
      // Find the alarm in the store
      const alarm = alarms.find((a) => a.id === alarmId);

      if (alarm) {
        if (alarm.mode === "daily") {
          // Navigate to daily tab (timer screen)
          setViewMode("daily");
          router.replace("/(tabs)/timer");
        } else if (alarm.mode === "weekly") {
          // Navigate to weekly mode with the specific day
          // Get the first day from alarm.days (or current day if exists in alarm.days)
          const today = new Date().getDay();
          const targetDay = alarm.days.includes(today) ? today : alarm.days[0];

          setViewMode("weekly");
          setSelectedDay(targetDay);
          router.replace("/(tabs)");
        }
        return;
      }
    }

    // Fallback: navigate to main alarms screen
    router.replace("/(tabs)");
  };

  const handleStop = async () => {
    await stopAlarm();
    await stopSound();
    navigateToAlarms();
  };

  const handleSnooze = async () => {
    await snoozeAlarm();
    await stopSound();
    navigateToAlarms();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY < 0) {
        translateY.value = e.translationY;
        opacity.value = 1 + e.translationY / 300;
      }
    })
    .onEnd((e) => {
      if (e.translationY < -150) {
        runOnJS(handleStop)();
      } else {
        translateY.value = withSpring(0);
        opacity.value = withTiming(1);
      }
    });

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Get gradient colors based on theme color
  const getGradientColors = () => {
    const alpha = 0.95;
    return [
      `${colors.main}${Math.round(alpha * 255).toString(16)}`,
      "#000000",
      "#000000",
    ] as const;
  };

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        <StatusBar barStyle="light-content" hidden={true} />

        {/* Gradient Background */}
        <LinearGradient
          colors={getGradientColors()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: height,
          }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        {/* Radial Pulse Effect */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Animated.View
            style={[
              {
                width: width * 1.2,
                height: width * 1.2,
                borderRadius: width,
                backgroundColor: colors.main,
              },
              rippleStyle,
            ]}
          />
        </View>

        {/* Content */}
        <View
          style={{
            flex: 1,
            paddingBottom: 60,
            paddingTop: 80,
          }}
        >
          <Animated.View
            style={[
              {
                flex: 1,
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 10,
              },
              contentStyle,
            ]}
          >
            {/* Top Section - Clock and Time */}
            <View style={{ alignItems: "center" }}>
              {/* Animated Clock Icon */}
              <Animated.View style={[{ marginBottom: 24 }, pulseStyle]}>
                <Clock size={48} color="white" strokeWidth={2} />
              </Animated.View>

              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.75)",
                  fontSize: 28,
                  marginTop: 20,
                  fontWeight: "300",
                }}
              >
                {(params.title as string) || "Alarm"}
              </Text>

              {/* Time Display */}
              <Text
                style={{
                  color: "white",
                  fontSize: 96,
                  fontWeight: "700",
                  letterSpacing: -4,
                  marginTop: 8,
                }}
              >
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </Text>
            </View>

            {/* Center Section - Snooze Button */}
            <View
              style={{
                width: "100%",
                paddingHorizontal: 48,
              }}
            >
              <Pressable
                onPress={handleSnooze}
                style={({ pressed }) => [
                  {
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    paddingVertical: 20,
                    borderRadius: 100,
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    opacity: pressed ? 0.6 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 18,
                    letterSpacing: 1,
                  }}
                >
                  {t.snooze || "Snooze"}
                </Text>
              </Pressable>
            </View>

            {/* Bottom Section - Empty for spacing */}
            <View style={{ height: 1 }} />
          </Animated.View>

          {/* Action Buttons */}
          <View
            style={{
              width: "100%",
              paddingHorizontal: 48,
              gap: 24,
              alignItems: "center",
              zIndex: 10,
            }}
          >
            {/* Swipe Up Indicator */}
            <View style={{ alignItems: "center", gap: 12 }}>
              <Animated.View style={pulseStyle}>
                <ChevronUp size={40} color="white" strokeWidth={3} />
              </Animated.View>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: 14,
                  fontWeight: "600",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {language === "tr"
                  ? "Kapatmak İçin Yukarı Kaydır"
                  : "Swipe Up to Stop"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
}
