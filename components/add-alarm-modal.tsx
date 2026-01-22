import Switch from "@/components/ui/switch";
import {
  checkExactAlarmPermission,
  requestExactAlarmPermission,
} from "@/lib/alarm-service";
import { getThemeColors } from "@/lib/color-system";
import { translations } from "@/lib/i18n";
import { Alarm, useAlarmsStore } from "@/store/alarms";
import { useSettingsStore } from "@/store/settings";
import clsx from "clsx";
import { ChevronRight, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import PermissionModal from "./permission-modal";
import SoundPicker from "./ui/sound-picker";
import TimePicker from "./ui/time-picker";

interface AddAlarmModalProps {
  visible: boolean;
  onClose: () => void;
  alarm?: Alarm; // Optional alarm for edit mode
}

export default function AddAlarmModal({
  visible,
  onClose,
  alarm,
}: AddAlarmModalProps) {
  const { language, theme, themeColor } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const isDark =
    theme === "dark" || (theme === "auto" && systemColorScheme === "dark");
  const colors = getThemeColors(themeColor, isDark);
  const { viewMode, selectedDay, addAlarm, updateAlarm } = useAlarmsStore();
  const t = translations[language];

  const isEditMode = !!alarm;

  const [time, setTime] = useState(new Date());
  const [title, setTitle] = useState("");
  const [vibration, setVibration] = useState(true);
  const [sound, setSound] = useState("default");

  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Initialize form with alarm data in edit mode
  useEffect(() => {
    if (alarm) {
      const [hours, minutes] = alarm.time.split(":").map(Number);
      const newTime = new Date();
      newTime.setHours(hours, minutes, 0, 0);
      setTime(newTime);
      setTitle(alarm.title);
      setVibration(alarm.vibration ?? true);
      setSound(alarm.sound ?? "default");
    } else {
      setTime(new Date());
      setTitle("");
      setVibration(true);
      setSound("default");
    }
  }, [alarm, visible]);

  const handleSave = async () => {
    if (!title.trim()) return;

    if (Platform.OS === "android") {
      const hasPermission = await checkExactAlarmPermission();
      if (!hasPermission) {
        setShowPermissionModal(true);
        return;
      }
    }

    const timeString = time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (isEditMode && alarm) {
      // Weekly Mode Isolation Logic (Split on Edit)
      if (
        viewMode === "weekly" &&
        alarm.days.includes(selectedDay) &&
        alarm.days.length > 1
      ) {
        // 1. Remove current day from old alarm
        updateAlarm(alarm.id, {
          days: alarm.days.filter((d) => d !== selectedDay),
        });

        // 2. Add New Alarm for this day
        addAlarm({
          time: timeString,
          title: title.trim(),
          enabled: true,
          days: [selectedDay],
          vibration,
          sound,
        });
      } else {
        // Normal Update
        updateAlarm(alarm.id, {
          time: timeString,
          title: title.trim(),
          vibration,
          sound,
        });
      }
    } else {
      // Create new alarm
      if (viewMode === "daily") {
        const today = new Date().getDay();
        addAlarm({
          time: timeString,
          title: title.trim(),
          enabled: true,
          days: [today],
          vibration,
          sound,
        });
      } else {
        addAlarm({
          time: timeString,
          title: title.trim(),
          enabled: true,
          days: [selectedDay],
          vibration,
          sound,
        });
      }
    }
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <Pressable className="flex-1" onPress={onClose} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <Animated.View
              entering={SlideInDown.springify().damping(250).stiffness(500)}
              className="bg-white dark:bg-[#1C1C1E] rounded-t-[32px] overflow-hidden"
            >
              {/* Header / Drag Handle */}
              <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
              </View>

              <View className="px-6 pb-10">
                <View className="flex-row items-center justify-between mb-8">
                  <Text className="text-2xl font-bold text-black dark:text-white tracking-tight">
                    {isEditMode
                      ? language === "tr"
                        ? "Alarm Düzenle"
                        : "Edit Alarm"
                      : t.addAlarm}
                  </Text>
                  <Pressable
                    onPress={onClose}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 items-center justify-center opacity-80"
                  >
                    <X size={18} color={isDark ? "#fff" : "#000"} />
                  </Pressable>
                </View>

                {/* Time Picker Container */}
                <View className="mb-8 items-center">
                  <TimePicker
                    date={time}
                    onDateChange={setTime}
                    themeColor={themeColor}
                  />
                </View>

                {/* Form Fields Group */}
                <View className="bg-gray-50 dark:bg-[#2C2C2E] rounded-3xl p-4 gap-6">
                  {/* Title Input */}
                  <View>
                    <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                      {t.alarmTitle}
                    </Text>
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      placeholder={
                        language === "tr" ? "Örn: Uyanış" : "e.g. Wake up"
                      }
                      placeholderTextColor={isDark ? "#666" : "#999"}
                      className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl text-black dark:text-white text-base font-medium border border-gray-100 dark:border-zinc-800"
                    />
                  </View>

                  {/* Settings Row */}
                  <View className="flex-row gap-4">
                    {/* Vibration */}
                    <View className="flex-1 bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 items-center justify-between">
                      <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        {language === "tr" ? "Titreşim" : "Vibration"}
                      </Text>
                      <Switch
                        value={vibration}
                        onValueChange={setVibration}
                        themeColor={themeColor}
                      />
                    </View>

                    {/* Sound */}
                    <View className="flex-[2] bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 justify-between">
                      <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">
                        {language === "tr" ? "Zil Sesi" : "Sound"}
                      </Text>
                      <Pressable
                        onPress={() => setShowSoundPicker(true)}
                        className="flex-row items-center justify-between bg-gray-50 dark:bg-black/20 p-3 rounded-xl"
                      >
                        <Text
                          className="text-sm font-medium text-black dark:text-gray-200 capitalize"
                          numberOfLines={1}
                        >
                          {sound}
                        </Text>
                        <ChevronRight
                          size={16}
                          color={isDark ? "#999" : "#666"}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-4 mt-8">
                  <Pressable
                    onPress={onClose}
                    className="flex-1 py-4 rounded-[24px] active:opacity-70 border border-gray-200 dark:border-zinc-700"
                  >
                    <Text className="text-center text-black dark:text-white font-semibold text-lg">
                      {t.cancel}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSave}
                    disabled={!title.trim()}
                    className={clsx(
                      "flex-1 py-4 rounded-[24px] active:opacity-70 shadow-lg shadow-blue-500/30",
                      !title.trim() && "opacity-50 shadow-none",
                    )}
                    style={
                      title.trim()
                        ? { backgroundColor: colors.main }
                        : { backgroundColor: isDark ? "#333" : "#ddd" }
                    }
                  >
                    <Text
                      className={clsx(
                        "text-center font-bold text-lg",
                        title.trim() ? "text-white" : "text-gray-500",
                      )}
                    >
                      {t.save}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <SoundPicker
        visible={showSoundPicker}
        onClose={() => setShowSoundPicker(false)}
        selectedSound={sound}
        onSelect={setSound}
        themeColor={themeColor}
      />
      <PermissionModal
        visible={showPermissionModal}
        onConfirm={() => {
          setShowPermissionModal(false);
          requestExactAlarmPermission();
        }}
        onCancel={() => setShowPermissionModal(false)}
      />
    </>
  );
}
