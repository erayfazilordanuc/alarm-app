import { getThemeColors, ThemeColorName } from "@/lib/color-system";
import { TranslationKey, translations } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { Check, X } from "lucide-react-native";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";

interface SoundPickerProps {
  visible: boolean;
  onClose: () => void;
  selectedSound: string;
  onSelect: (sound: string) => void;
  themeColor: ThemeColorName;
}

const SOUNDS = [
  "default",
  "radar",
  "beacon",
  "chimes",
  "circuit",
  "reflection",
  "waves",
  "sunrise",
  "pulse",
  "orbit",
];

export default function SoundPicker({
  visible,
  onClose,
  selectedSound,
  onSelect,
  themeColor,
}: SoundPickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getThemeColors(themeColor, isDark);
  const { language } = useSettingsStore();
  const t = translations[language];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(90)}
          exiting={SlideOutDown}
          className="bg-white dark:bg-[#1C1C1E] rounded-t-[32px] overflow-hidden max-h-[70%]"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
            <Text className="text-xl font-bold text-black dark:text-white">
              {t.selectSound}
            </Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 items-center justify-center"
            >
              <X size={18} color={isDark ? "#fff" : "#000"} />
            </Pressable>
          </View>

          {/* List */}
          <ScrollView className="p-4">
            {SOUNDS.map((soundId) => {
              const isSelected = selectedSound === soundId;
              const soundKey =
                `sound${soundId.charAt(0).toUpperCase() + soundId.slice(1)}` as TranslationKey;
              const label = t[soundKey] || soundId;

              return (
                <Pressable
                  key={soundId}
                  onPress={() => {
                    onSelect(soundId);
                    onClose();
                  }}
                  className={`flex-row items-center justify-between p-4 mb-2 rounded-2xl ${
                    isSelected ? "bg-gray-100 dark:bg-zinc-800" : ""
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      isSelected
                        ? "text-black dark:text-white"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                    style={isSelected ? { color: colors.main } : {}}
                  >
                    {label}
                  </Text>
                  {isSelected && (
                    <Check size={20} color={colors.main} strokeWidth={2.5} />
                  )}
                </Pressable>
              );
            })}
            <View className="h-8" />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
