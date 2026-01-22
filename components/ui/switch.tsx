import { getThemeColors, ThemeColorName } from "@/lib/color-system";
import React, { useEffect } from "react";
import { Pressable, useColorScheme } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  themeColor: ThemeColorName;
}

export default function Switch({
  value,
  onValueChange,
  themeColor,
}: SwitchProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getThemeColors(themeColor, isDark);

  const switchWidth = 56; // w-14
  const padding = 4; // px-1 (approx)
  const thumbSize = 24; // w-6 h-6
  const travelDistance = switchWidth - thumbSize - padding * 2;

  const translateX = useSharedValue(value ? travelDistance : 0);

  useEffect(() => {
    translateX.value = withSpring(value ? travelDistance : 0, {
      mass: 1,
      damping: 15,
      stiffness: 120,
      overshootClamping: false,
    });
  }, [value, travelDistance, translateX]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [0, travelDistance],
      [isDark ? "#3f3f46" : "#e5e7eb", colors.main], // zinc-700 / gray-200 -> Main Color
    );

    return {
      backgroundColor,
    };
  });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <Animated.View
        style={[
          {
            width: switchWidth,
            height: 32,
            borderRadius: 9999,
            padding: padding,
            justifyContent: "center",
          },
          animatedContainerStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: 9999,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,
              elevation: 2,
            },
            animatedThumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
