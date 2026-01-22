import AddAlarmModal from "@/components/add-alarm-modal";
import DeleteConfirmModal from "@/components/delete-confirm-modal";
import SegmentedControl from "@/components/ui/segmented-control";
import Switch from "@/components/ui/switch";
import { getThemeColors } from "@/lib/color-system";
import { TranslationKey, translations } from "@/lib/i18n";
import { Alarm, useAlarmsStore } from "@/store/alarms";
import { useSettingsStore } from "@/store/settings";
import clsx from "clsx";
import { Check, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const DAY_NAMES_EN = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_NAMES_TR = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const DayTabItem = ({
  day,
  isSelected,
  onPress,
  colors,
  t,
  isDark,
}: {
  day: TranslationKey;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  t: any;
  isDark: boolean;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Inactive Background: White vs Zinc-900 (#18181B)
    const inactiveBg = isDark ? "#18181B" : "#FFFFFF";

    // Inactive Border: Gray-200 (#E5E7EB) vs Zinc-800 (#27272A)
    const inactiveBorder = isDark ? "#27272A" : "#E5E7EB";

    const backgroundColor = withTiming(isSelected ? colors.main : inactiveBg, {
      duration: 50,
    });
    const borderColor = withTiming(isSelected ? colors.main : inactiveBorder, {
      duration: 50,
    });
    const scale = withSpring(isSelected ? 1 : 1, {
      damping: 15,
      stiffness: 200,
    });

    return {
      backgroundColor,
      borderColor,
      transform: [{ scale }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    // Inactive Text: Gray-600 (#52525B) vs Gray-400 (#A1A1AA)
    const inactiveText = isDark ? "#A1A1AA" : "#52525B";
    const color = withTiming(isSelected ? "#FFFFFF" : inactiveText, {
      duration: 75,
    });
    return { color };
  });

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Animated.View
          className="w-[54px] h-[38px] items-center justify-center rounded-[14px] border"
          style={[
            animatedStyle,
            {
              transform: [{ scale: pressed ? 0.95 : isSelected ? 1.05 : 1 }],
            },
          ]}
        >
          <Animated.Text
            className="font-semibold uppercase text-sm"
            style={textStyle}
          >
            {t[day]}
          </Animated.Text>
        </Animated.View>
      )}
    </Pressable>
  );
};

export default function AlarmsScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | undefined>(
    undefined,
  );
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const { language, theme, themeColor } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const isDark =
    theme === "dark" || (theme === "auto" && systemColorScheme === "dark");
  const colors = getThemeColors(themeColor, isDark);
  const t = translations[language];
  const flatListRef = useRef<FlatList>(null);

  const {
    alarms,
    viewMode,
    selectedDay,
    editMode,
    selectedAlarms,
    setViewMode,
    setSelectedDay,
    deleteAlarm,
    deleteAlarms,
    toggleAlarm,
    toggleEditMode,
    toggleSelectAlarm,
    clearSelection,
  } = useAlarmsStore();

  // Optimized scroll effect for weekly mode transition
  useEffect(() => {
    if (viewMode === "weekly") {
      const targetIndex =
        language === "tr" ? (selectedDay + 6) % 7 : selectedDay;

      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: targetIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [viewMode, language, selectedDay]);

  // Filter alarms based on view mode
  const filteredAlarms = useMemo(() => {
    // Strict Mode Separation: First filter by mode
    const modeAlarms = alarms.filter((alarm) => alarm.mode === viewMode);

    if (viewMode === "daily") {
      const today = new Date().getDay();
      return modeAlarms.filter((alarm) => alarm.days.includes(today));
    } else {
      // Weekly mode - filter by selected day
      return modeAlarms.filter((alarm) => alarm.days.includes(selectedDay));
    }
  }, [alarms, viewMode, selectedDay]);

  const handleBulkDelete = () => {
    setDeleteModal({
      visible: true,
      title: t.deleteSelected,
      message:
        language === "tr"
          ? `${selectedAlarms.length} alarm silinecek. Emin misiniz?`
          : `Delete ${selectedAlarms.length} alarms. Are you sure?`,
      onConfirm: () => deleteAlarms(selectedAlarms),
    });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      {/* Soft Gradient Background */}
      <View
        className="absolute top-0 left-0 right-0 h-full overflow-hidden"
        pointerEvents="none"
      >
        {/* Top gradient */}
        <View
          className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px]"
          style={{
            transform: [{ scale: 2 }],
            backgroundColor: colors.gradients.gradient1,
            opacity: isDark ? 0.1 : 0.05,
            // @ts-ignore
            filter: "blur(100px)",
          }}
        />

        {/* Middle gradient */}
        <View
          className="absolute top-1/4 -right-1/3 w-[500px] h-[500px]"
          style={{
            transform: [{ scale: 2.5 }],
            backgroundColor: colors.gradients.gradient2,
            opacity: isDark ? 0.1 : 0.05,
            // @ts-ignore
            filter: "blur(120px)",
          }}
        />

        {/* Bottom left gradient */}
        <View
          className="absolute bottom-0 -left-1/4 w-[550px] h-[550px]"
          style={{
            transform: [{ scale: 2.2 }],
            backgroundColor: colors.gradients.gradient3,
            opacity: isDark ? 0.08 : 0.05,
            // @ts-ignore
            filter: "blur(110px)",
          }}
        />

        {/* Bottom right gradient */}
        <View
          className="absolute bottom-1/4 -right-1/4 w-[450px] h-[450px]"
          style={{
            transform: [{ scale: 2 }],
            backgroundColor: colors.gradients.gradient4,
            opacity: isDark ? 0.08 : 0.04,
            // @ts-ignore
            filter: "blur(100px)",
          }}
        />
      </View>

      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="px-6 p-6 flex-row justify-between items-center">
          <View>
            <View className="flex-row items-baseline gap-2 mb-1">
              <Text className="text-3xl font-light text-black dark:text-white">
                {new Date().getDate()}
              </Text>
              <Text className="text-3xl font-light text-black dark:text-white">
                {
                  t[
                    [
                      "january",
                      "february",
                      "march",
                      "april",
                      "may",
                      "june",
                      "july",
                      "august",
                      "september",
                      "october",
                      "november",
                      "december",
                    ][new Date().getMonth()] as TranslationKey
                  ]
                }
              </Text>
            </View>
            <Text className="text-base font-medium text-gray-500 dark:text-gray-400 -mt-1 uppercase tracking-widest">
              {
                t[
                  [
                    "sunday",
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                  ][new Date().getDay()] as TranslationKey
                  // NOTE: getDay() returns 0 for Sunday
                ]
              }
            </Text>
            {/* <Text className="text-3xl text-black dark:text-white mt-4">
              {t.home}
            </Text> */}
          </View>

          {editMode && (
            <Pressable
              onPress={clearSelection}
              className="bg-gray-500 px-4 py-2 rounded-full active:opacity-70"
            >
              <Text className="text-white font-semibold">{t.cancel}</Text>
            </Pressable>
          )}
        </View>

        {/* Mode Selector */}
        <View className="px-6 mb-4">
          <SegmentedControl
            options={["daily", "weekly"]}
            selectedOption={viewMode}
            onOptionPress={(option) =>
              setViewMode(option as "daily" | "weekly")
            }
            themeColor={themeColor}
            labels={{ daily: t.daily, weekly: t.weekly }}
          />
        </View>

        {/* Day Selector for Weekly Mode */}
        {viewMode === "weekly" && (
          <View className="mt-2 mb-2">
            <Text className="pl-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t.selectDays}
            </Text>
            <FlatList
              key={language}
              ref={flatListRef}
              data={language === "tr" ? DAY_NAMES_TR : DAY_NAMES_EN}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              ItemSeparatorComponent={() => <View className="w-2.5" />}
              getItemLayout={(data, index) => ({
                length: 60,
                offset: (60 + 10) * index,
                index,
              })}
              renderItem={({
                item: day,
                index: arrayIndex,
              }: {
                item: TranslationKey;
                index: number;
              }) => {
                // Map array index to actual day number (0=Sun, 1=Mon, etc.)
                const dayIndex =
                  language === "tr"
                    ? (arrayIndex + 1) % 7 // TR: 0->1 (Mon), 1->2 (Tue), ..., 6->0 (Sun)
                    : arrayIndex; // EN: 0->0 (Sun), 1->1 (Mon), ...
                const isSelected = selectedDay === dayIndex;

                return (
                  <DayTabItem
                    day={day}
                    isSelected={isSelected}
                    onPress={() => setSelectedDay(dayIndex)}
                    colors={colors}
                    t={t}
                    isDark={isDark}
                  />
                );
              }}
            />
          </View>
        )}

        {/* Alarm List */}
        <ScrollView
          className="flex-1 px-6 pt-2"
          contentContainerStyle={{ paddingBottom: 128 }}
        >
          {filteredAlarms.length > 0 ? (
            <View className="">
              {filteredAlarms.map((alarm) => {
                const isSelected = selectedAlarms.includes(alarm.id);
                return (
                  <Pressable
                    key={alarm.id}
                    onPress={() => {
                      if (editMode) {
                        toggleSelectAlarm(alarm.id);
                      } else {
                        // Open edit modal
                        setEditingAlarm(alarm);
                        setShowAddModal(true);
                      }
                    }}
                    onLongPress={() => {
                      if (!editMode) {
                        toggleEditMode();
                        toggleSelectAlarm(alarm.id);
                      }
                    }}
                    className={clsx(
                      "flex-row items-center p-5 my-2 rounded-3xl border backdrop-blur-md",
                      editMode && isSelected
                        ? ""
                        : "bg-white dark:bg-zinc-900/50 border-white/20 dark:border-white/5",
                    )}
                    style={
                      editMode && isSelected
                        ? {
                            backgroundColor: isDark
                              ? colors.gradients.gradient1 + "33" // 20% opacity
                              : colors.light + "80", // 50% opacity
                            borderColor: colors.main,
                          }
                        : {}
                    }
                  >
                    {editMode && (
                      <View className="mr-4">
                        <View
                          className={clsx(
                            "w-6 h-6 rounded-full border items-center justify-center",
                            isSelected
                              ? ""
                              : "border-gray-300 dark:border-gray-600 bg-transparent",
                          )}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: colors.main,
                                  borderColor: colors.main,
                                }
                              : {}
                          }
                        >
                          {isSelected && (
                            <Check size={14} color="white" strokeWidth={3} />
                          )}
                        </View>
                      </View>
                    )}

                    <View className="flex-1">
                      <Text className="text-4xl font-light text-black dark:text-white tracking-tight">
                        {alarm.time}
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 font-medium text-base mt-1">
                        {alarm.title}
                      </Text>
                    </View>

                    {!editMode && (
                      <View className="items-end justify-center">
                        <Switch
                          value={alarm.enabled}
                          onValueChange={() => toggleAlarm(alarm.id)}
                          themeColor={themeColor}
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View className="items-center justify-center py-20 opacity-50">
              <Text className="text-gray-400 text-lg font-medium">
                {t.noAlarms}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Floating Action Buttons */}
      {editMode && selectedAlarms.length > 0 ? (
        <Pressable
          className="absolute bottom-32 right-6 w-16 h-16 bg-red-600 rounded-full items-center justify-center shadow-2xl shadow-red-600/40 z-50 active:scale-95"
          onPress={handleBulkDelete}
        >
          <Trash2 color="white" size={28} strokeWidth={2.5} />
        </Pressable>
      ) : (
        <Pressable
          className="absolute bottom-32 right-6 w-16 h-16 rounded-full items-center justify-center shadow-2xl z-50 active:scale-95"
          style={{
            backgroundColor: colors.main,
            shadowColor: colors.main,
            shadowOpacity: 0.4,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 10 },
          }}
          onPress={() => setShowAddModal(true)}
        >
          <Plus color="white" size={32} strokeWidth={2.5} />
        </Pressable>
      )}

      {/* Add Alarm Modal */}
      <AddAlarmModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingAlarm(undefined);
        }}
        alarm={editingAlarm}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ ...deleteModal, visible: false })}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        message={deleteModal.message}
        confirmText={t.delete}
        cancelText={t.cancel}
      />
    </View>
  );
}
