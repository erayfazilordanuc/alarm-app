import { getThemeColors } from "@/lib/color-system";
import { useSettingsStore } from "@/store/settings";
import { Bell } from "lucide-react-native";
import { Modal, Pressable, Text, useColorScheme, View } from "react-native";

interface PermissionModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PermissionModal({
  visible,
  onConfirm,
  onCancel,
}: PermissionModalProps) {
  const { theme, themeColor } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const isDark =
    theme === "dark" || (theme === "auto" && systemColorScheme === "dark");
  const colors = getThemeColors(themeColor, isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // Prevent closing by tapping outside/back button to force choice?
      // Or allow dismiss? Usually for critical permissions we might want to be persistent but cancelable.
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 w-full max-w-sm overflow-hidden">
          {/* Decorative Background Blur/Gradient can go here if needed */}

          {/* Icon */}
          <View className="items-center mb-6 mt-2">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              <View
                className="w-16 h-16 rounded-full items-center justify-center p-4"
                style={{ backgroundColor: colors.main }}
              >
                <Bell size={32} color="white" fill="white" />
              </View>
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-center text-black dark:text-white mb-3 tracking-tight">
            İzin Gerekli
          </Text>

          {/* Message */}
          <Text className="text-base text-center text-gray-500 dark:text-gray-400 mb-8 leading-6">
            Alarmların tam zamanında çalabilmesi için{" "}
            <Text className="font-bold text-black dark:text-white">
              Tam Zamanlı Alarm
            </Text>{" "}
            iznine ihtiyacımız var.
          </Text>

          {/* Buttons */}
          <View className="flex-col gap-3">
            <Pressable
              onPress={onConfirm}
              className="w-full py-4 rounded-[20px] active:opacity-80 active:scale-[0.98] transition-all"
              style={{ backgroundColor: colors.main }}
            >
              <Text className="text-center text-white font-bold text-lg">
                Ayarlara Git
              </Text>
            </Pressable>

            <Pressable
              onPress={onCancel}
              className="w-full py-4 rounded-[20px] active:opacity-70 bg-gray-100 dark:bg-zinc-800"
            >
              <Text className="text-center text-gray-600 dark:text-gray-300 font-semibold text-lg">
                Daha Sonra
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
