import { getThemeColors, ThemeColorName } from "@/lib/color-system";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface SegmentedControlProps {
  options: string[];
  selectedOption: string;
  onOptionPress: (option: string) => void;
  themeColor: ThemeColorName;
  labels?: Record<string, string>;
}

export default function SegmentedControl({
  options,
  selectedOption,
  onOptionPress,
  themeColor,
  labels,
}: SegmentedControlProps) {
  const [segmentWidth, setSegmentWidth] = useState(0);
  const translateX = useSharedValue(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getThemeColors(themeColor, isDark);

  // Determine active index
  const activeIndex = options.indexOf(selectedOption);

  useEffect(() => {
    if (segmentWidth > 0 && activeIndex >= 0) {
      translateX.value = withSpring(activeIndex * segmentWidth, {
        damping: 30, // Increased damping to reduce oscillation/wobble significantly
        stiffness: 250, // Increased stiffness for faster response
        mass: 1, // Default mass
      });
    }
  }, [activeIndex, segmentWidth, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setSegmentWidth(width / options.length);
  };

  return (
    <View className="bg-white dark:bg-zinc-900 rounded-full p-1 border border-gray-100 dark:border-zinc-800">
      <View className="flex-row relative" onLayout={handleLayout}>
        {/* Animated Background */}
        <Animated.View
          style={[
            animatedStyle,
            {
              position: "absolute",
              width: `${100 / options.length}%`,
              height: "100%",
              backgroundColor: colors.main,
              borderRadius: 24, // High enough to look pill-shaped
            },
          ]}
        />

        {/* Options */}
        {options.map((option) => {
          const isSelected = selectedOption === option;
          return (
            <Pressable
              key={option}
              onPress={() => onOptionPress(option)}
              className="flex-1 py-3 items-center justify-center rounded-3xl z-10"
            >
              <Text
                className={clsx(
                  "font-semibold text-sm",
                  isSelected
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-400",
                )}
              >
                {labels ? labels[option] : option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
