import TabBar from "@/components/ui/tab-bar";
import { getThemeColors } from "@/lib/color-system";
import { translations } from "@/lib/i18n";
import { NotificationManager } from "@/lib/notification-manager";
import { useAlarmsStore } from "@/store/alarms";
import { useSettingsStore } from "@/store/settings";
import { Tabs } from "expo-router";
import { AlarmClock, Settings, Timer } from "lucide-react-native";
import React from "react";
import { useColorScheme, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { language, theme, themeColor } = useSettingsStore();
  const isDark =
    theme === "dark" || (theme === "auto" && colorScheme === "dark");
  const colors = getThemeColors(themeColor, isDark);
  const t = translations[language];

  React.useEffect(() => {
    const setupNotifications = async () => {
      NotificationManager.init();
      const hasPermission = await NotificationManager.requestPermissions();

      if (hasPermission) {
        // Sync alarms with system notifications
        const alarms = useAlarmsStore.getState().alarms;
        await NotificationManager.cancelAll();

        for (const alarm of alarms) {
          if (alarm.enabled) {
            await NotificationManager.scheduleAlarm(alarm);
          }
        }
      }
    };

    setupNotifications();
  }, []);

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color, focused }) => (
            <View
              className="w-20 h-20 items-center justify-center rounded-full"
              style={
                focused
                  ? {
                      backgroundColor: isDark
                        ? colors.gradients.gradient1 + "33"
                        : colors.light,
                    }
                  : {}
              }
            >
              <AlarmClock
                size={26}
                color={focused ? colors.main : isDark ? "#999" : "#666"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: t.timer,
          tabBarIcon: ({ color, focused }) => (
            <View
              className="w-20 h-20 items-center justify-center rounded-full"
              style={
                focused
                  ? {
                      backgroundColor: isDark
                        ? colors.gradients.gradient1 + "33"
                        : colors.light,
                    }
                  : {}
              }
            >
              <Timer
                size={26}
                color={focused ? colors.main : isDark ? "#999" : "#666"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
          tabBarIcon: ({ color, focused }) => (
            <View
              className="w-20 h-20 items-center justify-center rounded-full"
              style={
                focused
                  ? {
                      backgroundColor: isDark
                        ? colors.gradients.gradient1 + "33"
                        : colors.light,
                    }
                  : {}
              }
            >
              <Settings
                size={26}
                color={focused ? colors.main : isDark ? "#999" : "#666"}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
