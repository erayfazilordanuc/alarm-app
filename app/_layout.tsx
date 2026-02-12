import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import "react-native-reanimated";
import "../global.css";

import { PermissionRequest } from "@/components/PermissionRequest";
import { useSettingsStore } from "@/store/settings";

export const unstable_settings = {
  anchor: "(tabs)",
};

import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const systemColorScheme = useSystemColorScheme();
  const { theme, setDevMode } = useSettingsStore();
  const { setColorScheme } = useColorScheme();
  const [permissionModalVisible, setPermissionModalVisible] = useState(true);

  // Determine effective theme
  const effectiveTheme = theme === "auto" ? systemColorScheme : theme;

  const isDark = effectiveTheme === "dark";

  // Reset developer mode on app start
  useEffect(() => {
    setDevMode(false);
  }, []);

  // Set NativeWind color scheme
  useEffect(() => {
    setColorScheme(isDark ? "dark" : "light");
  }, [isDark, setColorScheme]);

  // Handle Notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        // If app is in foreground and we receive an alarm
        const data = notification.request.content.data;
        if (data?.alarmId) {
          // Navigate to ringing screen
          router.push({
            pathname: "/alarm-ringing",
            params: {
              alarmId: String(data.alarmId),
              title: data.title ? String(data.title) : "Alarm",
              sound: data.sound ? String(data.sound) : "default",
            },
          });
        }
      },
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.alarmId) {
          router.push({
            pathname: "/alarm-ringing",
            params: {
              alarmId: String(data.alarmId),
              title: data.title ? String(data.title) : "Alarm",
              sound: data.sound ? String(data.sound) : "default",
            },
          });
        }
      });

    // Check for Android Full Screen Intent Trigger
    import("@/lib/alarm-service").then(({ getTriggeredAlarm }) => {
      getTriggeredAlarm().then((alarmId) => {
        if (alarmId) {
          router.push({
            pathname: "/alarm-ringing",
            params: { alarmId },
          });
        }
      });
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // Check Android Exact Alarm Permission
  // Removed in favor of contextual check in AddAlarmModal

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style={isDark ? "light" : "dark"} />
        <PermissionRequest
          visible={permissionModalVisible}
          onClose={() => setPermissionModalVisible(false)}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
