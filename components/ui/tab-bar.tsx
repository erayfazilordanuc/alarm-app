import { getThemeColors } from "@/lib/color-system";
import { useSettingsStore } from "@/store/settings";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { useColorScheme, View } from "react-native";
import TabBarButton from "./tab-bar-button";

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { theme, themeColor } = useSettingsStore();
  const colorScheme = useColorScheme();
  const isDark =
    theme === "dark" || (theme === "auto" && colorScheme === "dark");
  const colors = getThemeColors(themeColor, isDark);

  const primaryColor = colors.main;
  const greyColor = isDark ? "#A1A1AA" : "#737373"; // zinc-400 : neutral-500

  return (
    <View
      className="absolute bottom-8 flex-row justify-between items-center bg-white dark:bg-zinc-900 mx-5 py-3 rounded-[30px] shadow-lg shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-zinc-800"
      style={{ borderCurve: "continuous" }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name
            : options.title !== undefined
              ? options.title
              : route.name;

        if (["_sitemap", "+not-found"].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // Dispatch a navigation action to switch tabs
            navigation.dispatch({
              type: "JUMP_TO",
              payload: { name: route.name },
              target: state.key,
            });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? primaryColor : greyColor}
            label={label}
          />
        );
      })}
    </View>
  );
};

export default TabBar;
