import { Alarm } from "@/store/alarms";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const NotificationManager = {
  init() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  },

  async requestPermissions() {
    // On Android, we need to create a channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }

    // Request permissions (works on Simulator for local notifications since iOS 14)
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return false;
    }
    return true;
  },

  async scheduleAlarm(alarm: Alarm) {
    // First cancel any existing notifications for this alarm to avoid duplicates
    // We can't easily track notification IDs 1:1 with alarm IDs unless we store them.
    // However, if we use a consistent naming identifier or store notification IDs...
    // For now, let's just schedule new ones.
    // Ideally, we should cancel old ones.
    // Best practice: Store notification IDs in the alarm object.

    // BUT, for now, let's implement a clean cancelAll function or simple schedule.
    // If the user toggles off/on, we should cancel/reschedule.
    // So we need to store notification IDs?
    // Or we can query notifications by some identifier?
    // Expo doesn't support easy querying by tag.

    // Let's assume we cancel ALL notifications for that alarm ID before scheduling?
    // How? We don't have the IDs.

    // STRATEGY:
    // When scheduling, we will generate a notification for each active day.
    // We won't persist notification IDs for simply MVP.
    // Wait, if we don't, we can't cancel them individually.
    // `cancelScheduledNotificationAsync(identifier)` requires ID.

    // Let's implement `cancelAlarmNotifications(alarmId)` assuming we check all pending notifications?
    // `getAllScheduledNotificationsAsync` returns list.
    // We can put alarmId in `content.data`.

    await this.cancelAlarmNotifications(alarm.id);

    if (!alarm.enabled) return;

    const [hours, minutes] = alarm.time.split(":").map(Number);

    for (const day of alarm.days) {
      // Calculate next occurrence of this day/time
      // Expo Notifications `weekday` trigger: 1 = Sunday, 7 = Saturday.
      // JS Date getDay(): 0 = Sunday, 6 = Saturday.
      // Mapping: JS 0 -> Expo 1, JS 1 -> Expo 2 ... JS 6 -> Expo 7.
      const expoWeekday = day + 1;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: alarm.title || "Alarm",
          body: "Alarm ringing", // Keep body simple
          sound: alarm.sound === "default" ? true : alarm.sound,
          vibrate: alarm.vibration ? [0, 500, 200, 500] : [],
          data: {
            alarmId: alarm.id,
            title: alarm.title,
            sound: alarm.sound,
          },
          categoryIdentifier: "ALARM",
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: expoWeekday,
          hour: hours,
          minute: minutes,
          channelId: "default",
        },
      });
    }
  },

  async cancelAlarmNotifications(alarmId: string) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.alarmId === alarmId) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  },

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
