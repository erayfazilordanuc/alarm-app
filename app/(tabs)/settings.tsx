import Switch from "@/components/ui/switch";
import { removeAllAlarms } from "@/lib/alarm-service";
import { getAllThemeColorNames, THEME_COLORS } from "@/lib/color-system";
import { useSettingsStore } from "@/store/settings";
import { Check, Moon, Sun } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const {
    language,
    theme,
    themeColor,
    devMode,
    setLanguage,
    setTheme,
    setThemeColor,
    setDevMode,
  } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const [tapCount, setTapCount] = useState(0);
  const isDark =
    theme === "dark" || (theme === "auto" && systemColorScheme === "dark");

  const handleDevModeTrigger = () => {
    if (devMode) return;

    setTapCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 7) {
        setDevMode(true);
        Alert.alert(
          language === "tr" ? "Geliştirici Modu" : "Developer Mode",
          language === "tr"
            ? "Geliştirici modu etkinleştirildi!"
            : "Developer mode enabled!",
        );
        return 0;
      }
      return newCount;
    });
  };

  const handleClearAlarms = async () => {
    Alert.alert(
      language === "tr" ? "Alarmları Temizle" : "Clear Alarms",
      language === "tr"
        ? "Tüm alarmlar silinecek. Emin misiniz?"
        : "All alarms will be deleted. Are you sure?",
      [
        {
          text: language === "tr" ? "İptal" : "Cancel",
          style: "cancel",
        },
        {
          text: language === "tr" ? "Sil" : "Delete",
          style: "destructive",
          onPress: async () => {
            await removeAllAlarms();
            Alert.alert(
              language === "tr" ? "Başarılı" : "Success",
              language === "tr"
                ? "Tüm alarmlar temizlendi."
                : "All alarms cleared.",
            );
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      {/* Subtle Background Elements */}
      <View
        className="absolute top-0 left-0 right-0 h-full overflow-hidden"
        pointerEvents="none"
      >
        <View
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-40"
          style={{ transform: [{ scale: 1.2 }] }}
        />
        <View
          className="absolute bottom-40 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-30"
          style={{ transform: [{ scale: 1.5 }] }}
        />
      </View>

      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-sm text-gray-500 font-medium tracking-wide uppercase">
            {language === "tr" ? "Ayarlar" : "Settings"}
          </Text>
          <Text className="text-3xl font-bold text-black dark:text-white mt-1">
            {language === "tr" ? "Tercihler" : "Preferences"}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 128 }}
        >
          {/* Appearance Section */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {language === "tr" ? "Görünüm" : "Appearance"}
            </Text>

            {/* Theme Toggle */}
            <View className="bg-white dark:bg-zinc-900/50 border border-white/20 dark:border-white/5 rounded-3xl p-5 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/20 rounded-full items-center justify-center mr-4">
                    {isDark ? (
                      <Moon size={20} color="#3B82F6" />
                    ) : (
                      <Sun size={20} color="#3B82F6" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-black dark:text-white">
                      {language === "tr" ? "Karanlık Tema" : "Dark Theme"}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {theme === "auto"
                        ? language === "tr"
                          ? "Otomatik"
                          : "Auto"
                        : theme === "dark"
                          ? language === "tr"
                            ? "Açık"
                            : "On"
                          : language === "tr"
                            ? "Kapalı"
                            : "Off"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={theme === "dark"}
                  onValueChange={(value) => setTheme(value ? "dark" : "light")}
                  themeColor={themeColor}
                />
              </View>
            </View>

            {/* Auto Theme */}
            <Pressable
              onPress={() => setTheme("auto")}
              className="bg-white dark:bg-zinc-900/50 border border-white/20 dark:border-white/5 rounded-3xl p-5 active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-purple-500/10 dark:bg-purple-400/20 rounded-full items-center justify-center mr-4">
                    <Sun size={20} color="#A855F7" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-black dark:text-white">
                      {language === "tr"
                        ? "Sistem Temasını Kullan"
                        : "Use System Theme"}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {language === "tr"
                        ? "Cihazınızın ayarlarını takip eder"
                        : "Follows your device settings"}
                    </Text>
                  </View>
                </View>
                {theme === "auto" && (
                  <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </View>

          {/* Theme Color Section */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {language === "tr" ? "Ana Renk" : "Theme Color"}
            </Text>

            <View className="bg-white dark:bg-zinc-900/50 border border-white/20 dark:border-white/5 rounded-3xl p-5">
              <View className="flex-row flex-wrap gap-4">
                {getAllThemeColorNames().map((colorName) => {
                  const colorConfig = THEME_COLORS[colorName];
                  const isSelected = themeColor === colorName;

                  return (
                    <Pressable
                      key={colorName}
                      onPress={() => setThemeColor(colorName)}
                      className="items-center"
                      style={{ width: "20%" }}
                    >
                      <View
                        className="w-14 h-14 rounded-full items-center justify-center mb-2"
                        style={{
                          backgroundColor: isDark
                            ? colorConfig.mainDark
                            : colorConfig.main,
                          opacity: isSelected ? 1 : 0.6,
                          transform: [{ scale: isSelected ? 1.1 : 1 }],
                        }}
                      >
                        {isSelected && (
                          <Check size={22} color="white" strokeWidth={3} />
                        )}
                      </View>
                      <Text className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        {colorConfig.name[language]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Language Section */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {language === "tr" ? "Dil" : "Language"}
            </Text>

            {/* Turkish */}
            <Pressable
              onPress={() => setLanguage("tr")}
              className="bg-white dark:bg-zinc-900/50 border border-white/20 dark:border-white/5 rounded-3xl p-5 mb-3 active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-red-500/10 dark:bg-red-400/20 rounded-full items-center justify-center mr-4">
                    <Text className="text-xl">🇹🇷</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-black dark:text-white">
                      Türkçe
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      Turkish
                    </Text>
                  </View>
                </View>
                {language === "tr" && (
                  <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </View>
            </Pressable>

            {/* English */}
            <Pressable
              onPress={() => setLanguage("en")}
              className="bg-white dark:bg-zinc-900/50 border border-white/20 dark:border-white/5 rounded-3xl p-5 active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/20 rounded-full items-center justify-center mr-4">
                    <Text className="text-xl">🇬🇧</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-black dark:text-white">
                      English
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      İngilizce
                    </Text>
                  </View>
                </View>
                {language === "en" && (
                  <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </View>

          {/* About Section */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {language === "tr" ? "Hakkında" : "About"}
            </Text>

            <View className="bg-white dark:bg-zinc-900/50 border border-white/20 dark:border-white/5 rounded-3xl p-5">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {language === "tr" ? "Versiyon" : "Version"}
                </Text>
                <Text className="text-sm font-semibold text-black dark:text-white">
                  1.0.0
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {language === "tr" ? "Made with" : "Made with"}
                </Text>
                <Text className="text-sm font-semibold text-black dark:text-white">
                  Alarm AI
                </Text>
              </View>
            </View>
          </View>

          {/* Developer Mode Section */}
          {devMode && (
            <View className="mb-6">
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {language === "tr" ? "Geliştirici" : "Developer"}
              </Text>

              <View className="bg-white dark:bg-zinc-900/50 border border-white/20 dark:border-white/5 rounded-3xl p-5 mb-3 gap-4">
                <Pressable
                  onPress={handleClearAlarms}
                  className="flex-row items-center justify-between active:opacity-70"
                >
                  <Text className="text-base font-semibold text-red-500">
                    {language === "tr"
                      ? "Tüm Alarmları Temizle"
                      : "Clear All Alarms"}
                  </Text>
                </Pressable>

                <View className="h-px bg-gray-200 dark:bg-gray-700" />

                <Pressable
                  onPress={() => {
                    // Navigate to alarm ringing screen for testing
                    const router = require("expo-router").router;
                    router.push({
                      pathname: "/alarm-ringing",
                      params: {
                        title: "Test Alarm",
                        sound: "default",
                      },
                    });
                  }}
                  className="flex-row items-center justify-between active:opacity-70"
                >
                  <Text className="text-base font-semibold text-blue-500 dark:text-blue-400">
                    {language === "tr"
                      ? "Alarm Ekranını Test Et"
                      : "Test Alarm Screen"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Hidden Trigger Area */}
          <Pressable
            onPress={handleDevModeTrigger}
            className="h-20 w-full"
            delayLongPress={5000} // Prevent accidental long press issues if any
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
