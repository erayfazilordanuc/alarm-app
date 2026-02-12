import { getThemeColors, ThemeColorName } from "@/lib/color-system";
import React, { useCallback, useEffect, useRef } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

// --- AYARLAR ---
const ITEM_HEIGHT = 48; // Satır yüksekliği
const VISIBLE_ITEMS = 5; // Görünür satır sayısı
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 240px
const HALF_HEIGHT = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2; // Padding hesabı

interface TimePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  themeColor: ThemeColorName;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

const PickerItem = React.memo(
  ({
    item,
    isSelected,
    activeColor,
  }: {
    item: string;
    isSelected: boolean;
    activeColor: string;
  }) => {
    return (
      <View style={styles.itemContainer}>
        <Text
          style={[
            styles.itemText,
            isSelected
              ? {
                  color: activeColor,
                  fontWeight: "600",
                  fontSize: 20,
                  opacity: 1,
                }
              : {
                  color: "#A1A1AA",
                  fontWeight: "400",
                  fontSize: 17,
                  opacity: 0.4,
                },
            { fontVariant: ["tabular-nums"] },
          ]}
        >
          {item}
        </Text>
      </View>
    );
  },
);

const TimePicker = React.memo(
  ({ date, onDateChange, themeColor }: TimePickerProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const colors = getThemeColors(themeColor, isDark);

    const hourListRef = useRef<FlatList>(null);
    const minuteListRef = useRef<FlatList>(null);

    const handleScroll = useCallback(
      (
        event: NativeSyntheticEvent<NativeScrollEvent>,
        data: string[],
        type: "hour" | "minute",
      ) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        let index = Math.round(offsetY / ITEM_HEIGHT);
        index = Math.max(0, Math.min(index, data.length - 1));

        const value = parseInt(data[index], 10);
        const currentDateVal =
          type === "hour" ? date.getHours() : date.getMinutes();

        if (currentDateVal === value) return;

        const newDate = new Date(date);
        if (type === "hour") newDate.setHours(value);
        else newDate.setMinutes(value);

        onDateChange(newDate);
      },
      [date, onDateChange],
    );

    const getItemLayout = useCallback(
      (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      }),
      [],
    );

    const onScrollToIndexFailed = useCallback(() => {
      // Fail safe: sessizce geç
    }, []);

    useEffect(() => {
      // Only scroll if we are not currently interacting (optional optimization, but for now simple sync)
      // Actually, since onDateChange only happens on momentum end, we are safe.

      // We use a small timeout to allow layout to settle if needed, or just immediate.
      // Given the issues, let's keep it safe.
      requestAnimationFrame(() => {
        if (!hourListRef.current || !minuteListRef.current) return;

        hourListRef.current.scrollToIndex({
          index: date.getHours(),
          animated: false,
        });
        minuteListRef.current.scrollToIndex({
          index: date.getMinutes(),
          animated: false,
        });
      });
    }, [date.getHours(), date.getMinutes()]); // Depend on values, not object ref if possible, but date object is new every time usually.

    const commonListProps = {
      snapToInterval: ITEM_HEIGHT,
      decelerationRate: "fast" as "fast",
      showsVerticalScrollIndicator: false,
      bounces: false,
      getItemLayout: getItemLayout,
      onScrollToIndexFailed: onScrollToIndexFailed,
      contentContainerStyle: { paddingVertical: HALF_HEIGHT },
      maxToRenderPerBatch: 10,
      initialNumToRender: 10,
      windowSize: 5,
    };

    return (
      <View
        style={[
          styles.container,
          {
            height: CONTAINER_HEIGHT,
            backgroundColor: isDark ? "rgba(24, 24, 27, 0.5)" : "#FAFAFA",
          },
        ]}
      >
        {/* --- SEÇİM GÖSTERGESİ (OVERLAY) --- */}
        <View
          style={[
            styles.selectionOverlay,
            {
              top: HALF_HEIGHT,
              height: ITEM_HEIGHT,
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
              backgroundColor: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.02)",
            },
          ]}
          pointerEvents="none"
        />

        <View style={styles.row}>
          {/* Saat */}
          <View style={styles.column}>
            <FlatList
              ref={hourListRef}
              data={HOURS}
              keyExtractor={(item) => `h-${item}`}
              renderItem={({ item }) => (
                <PickerItem
                  item={item}
                  isSelected={
                    item === date.getHours().toString().padStart(2, "0")
                  }
                  activeColor={colors.main}
                />
              )}
              onMomentumScrollEnd={(e) => handleScroll(e, HOURS, "hour")}
              {...commonListProps}
              initialScrollIndex={date.getHours()}
            />
          </View>

          {/* Ayıraç */}
          <View style={styles.separatorContainer}>
            <Text
              style={[
                styles.separatorText,
                { color: isDark ? "#FFF" : "#000" },
              ]}
            >
              :
            </Text>
          </View>

          {/* Dakika */}
          <View style={styles.column}>
            <FlatList
              ref={minuteListRef}
              data={MINUTES}
              keyExtractor={(item) => `m-${item}`}
              renderItem={({ item }) => (
                <PickerItem
                  item={item}
                  isSelected={
                    item === date.getMinutes().toString().padStart(2, "0")
                  }
                  activeColor={colors.main}
                />
              )}
              onMomentumScrollEnd={(e) => handleScroll(e, MINUTES, "minute")}
              {...commonListProps}
              initialScrollIndex={date.getMinutes()}
            />
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    // RESPONSIVE YAPI:
    // width: 'auto' diyerek içeriğe göre daralmasını sağlıyoruz.
    // Ancak çok küçülmemesi için minWidth veriyoruz.
    alignSelf: "center", // Ekranda ortala
    minWidth: 140, // En az bu kadar (çok dar telefonlar için güvenli alan)
    maxWidth: 200, // En fazla bu kadar (Tablette devasa olmasın)
    width: "45%", // Ekranın %45'ini kapla (Responsive kısım)

    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between", // Sütunları kenarlara değil ortaya yakın tutar
    paddingHorizontal: 4, // Kenarlardan çok hafif boşluk
  },
  column: {
    flex: 1, // Mevcut alanın yarısını al
    alignItems: "center",
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    width: 50, // Sabit ve dar genişlik (Sayılar için yeterli)
  },
  itemText: {
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  separatorContainer: {
    width: 10, // Çok dar ayıraç alanı
    height: CONTAINER_HEIGHT, // Tüm yüksekliği kaplasın
    justifyContent: "center",
    alignItems: "center",
    // Ayıracı tam ortaya (seçili alana) denk getirmek için padding
    paddingTop: 2,
  },
  separatorText: {
    fontSize: 20,
    fontWeight: "600",
    textAlignVertical: "center",
  },
  selectionOverlay: {
    position: "absolute",
    left: 10,
    right: 10, // Kenarlardan 10px boşluk bırak
    borderRadius: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 0,
  },
});

export default TimePicker;
