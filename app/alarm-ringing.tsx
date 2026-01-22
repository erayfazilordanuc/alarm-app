import { getThemeColors } from "@/lib/color-system";
import { translations } from "@/lib/i18n";
import { SOUND_FILES } from "@/lib/sounds";
import { useSettingsStore } from "@/store/settings";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function AlarmRingingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const soundObject = useRef<Audio.Sound | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { language, theme, themeColor } = useSettingsStore();
  const colorScheme = useColorScheme();
  const isDark =
    theme === "dark" || (theme === "auto" && colorScheme === "dark");
  const colors = getThemeColors(themeColor, isDark);
  const t = translations[language];

  // Animation values
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Timer for clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Play sound
    playSound();

    // Start ripple animation
    rippleScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
    rippleOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 }),
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

  const handleStop = async () => {
    await stopSound();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
    // Also cancel notification if any pending
  };

  const handleSnooze = async () => {
    await stopSound();
    // Logic to reschedule alarm for +9 mins
    // For now, just close
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return (
    <View className="flex-1 bg-black justify-between pb-12">
      {/* Background Pulse */}
      <View className="absolute inset-0 items-center justify-center">
        <Animated.View
          style={[
            {
              width: width * 0.8,
              height: width * 0.8,
              borderRadius: width,
              backgroundColor: colors.main,
            },
            rippleStyle,
          ]}
        />
      </View>

      <SafeAreaView className="flex-1 justify-between items-center z-10">
        <View className="mt-20 items-center">
          <Text className="text-white text-xl font-medium mb-4 uppercase tracking-widest">
            {t.alarmTitle}
          </Text>
          <Text className="text-white text-8xl font-bold tracking-tighter">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </Text>
          <Text className="text-white/80 text-2xl mt-4 font-light">
            {(params.title as string) || "Alarm"}
          </Text>
        </View>

        <View className="w-full px-12 gap-6">
          <Pressable
            onPress={handleSnooze}
            className="w-full bg-white/20 backdrop-blur-lg py-5 rounded-full items-center border border-white/10 active:opacity-70"
          >
            <Text className="text-white font-semibold text-lg">
              {t.snooze || "Snooze"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleStop}
            className="w-full bg-white py-5 rounded-full items-center shadow-lg active:scale-95 transition-transform"
            style={{
              shadowColor: "#fff",
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          >
            <Text className="text-black font-bold text-xl uppercase tracking-widest">
              {t.stop}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
