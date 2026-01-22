import { getThemeColors, ThemeColorName } from "@/lib/color-system";
import React, { useCallback, useRef, useEffect } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface TimePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  themeColor: ThemeColorName;
}

// AYARLAR
const ITEM_HEIGHT = 50;
const CONTAINER_HEIGHT = 192; 

// (192 - 50) / 2 = 71px
// Bu boşluk listenin en başına ve en sonuna eklenecek.
const SPACER_HEIGHT = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);

const TimePicker = React.memo(
  ({ date, onDateChange, themeColor }: TimePickerProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const colors = getThemeColors(themeColor, isDark);

    // Listelerin referanslarını tutalım (Gerekirse manuel kaydırmak için)
    const hourListRef = useRef<FlatList>(null);
    const minuteListRef = useRef<FlatList>(null);

    const renderItem = useCallback(
      ({ item, selectedValue }: { item: string; selectedValue: string }) => {
        const isSelected = item === selectedValue;

        return (
          <View
            style={{
              height: ITEM_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              className={`text-3xl font-light ${
                isSelected
                  ? "text-black dark:text-white font-semibold"
                  : "text-gray-300 dark:text-zinc-700"
              }`}
              style={[
                isSelected ? { color: colors.main } : {},
                { fontVariant: ["tabular-nums"], includeFontPadding: false },
              ]}
            >
              {item}
            </Text>
          </View>
        );
      },
      [colors.main]
    );

    const handleScroll = useCallback(
      (
        event: NativeSyntheticEvent<NativeScrollEvent>,
        data: string[],
        type: "hour" | "minute"
      ) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        
        // Header kullandığımız için offset 0 iken ilk eleman tam ortadadır.
        let index = Math.round(offsetY / ITEM_HEIGHT);

        // Sınırları koru
        index = Math.max(0, Math.min(index, data.length - 1));

        const value = parseInt(data[index], 10);
        const newDate = new Date(date);

        if (type === "hour") {
          newDate.setHours(value);
        } else {
          newDate.setMinutes(value);
        }
        onDateChange(newDate);
      },
      [date, onDateChange]
    );

    // Başlangıç pozisyonuna gitmek için useEffect kullanıyoruz.
    // getItemLayout olmadığı için initialScrollIndex bazen sapıtabilir, 
    // bu yüzden manuel tetikleme en garantisidir.
    useEffect(() => {
        // Ufak bir gecikme listenin render olmasını bekler
        setTimeout(() => {
            hourListRef.current?.scrollToIndex({ index: date.getHours(), animated: false });
            minuteListRef.current?.scrollToIndex({ index: date.getMinutes(), animated: false });
        }, 100);
    }, []); // Sadece mount olduğunda çalışır

    // Boşluk Bileşeni
    const renderSpacer = () => <View style={{ height: SPACER_HEIGHT }} />;

    return (
      <View 
        className="flex-row justify-center bg-gray-50 dark:bg-zinc-900/50 rounded-3xl overflow-hidden relative"
        style={{ height: CONTAINER_HEIGHT }}
      >
        {/* Seçim Çubuğu (Overlay) */}
        <View
          className="absolute w-full bg-gray-200/50 dark:bg-zinc-800/50"
          pointerEvents="none"
          style={{
            height: ITEM_HEIGHT,
            top: SPACER_HEIGHT,
          }}
        />

        {/* SAAT LİSTESİ */}
        <View className="w-20 items-center">
          <FlatList
            ref={hourListRef}
            data={HOURS}
            keyExtractor={(item) => `h-${item}`}
            renderItem={({ item }) =>
              renderItem({
                item,
                selectedValue: date.getHours().toString().padStart(2, "0"),
              })
            }
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={(e) => handleScroll(e, HOURS, "hour")}
            ListHeaderComponent={renderSpacer}
            ListFooterComponent={renderSpacer}
            // getItemLayout KALDIRILDI!
          />
        </View>

        {/* İKİ NOKTA (:) */}
        <View
          className="items-center justify-start"
          style={{ paddingTop: SPACER_HEIGHT }}
        >
           <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
            <Text
                className="text-3xl font-semibold text-black dark:text-white"
                style={{ includeFontPadding: false, lineHeight: ITEM_HEIGHT }}
            >
                :
            </Text>
          </View>
        </View>

        {/* DAKİKA LİSTESİ */}
        <View className="w-20 items-center">
          <FlatList
            ref={minuteListRef}
            data={MINUTES}
            keyExtractor={(item) => `m-${item}`}
            renderItem={({ item }) =>
              renderItem({
                item,
                selectedValue: date.getMinutes().toString().padStart(2, "0"),
              })
            }
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={(e) => handleScroll(e, MINUTES, "minute")}
            ListHeaderComponent={renderSpacer}
            ListFooterComponent={renderSpacer}
            // getItemLayout KALDIRILDI!
          />
        </View>
      </View>
    );
  }
);

export default TimePicker;