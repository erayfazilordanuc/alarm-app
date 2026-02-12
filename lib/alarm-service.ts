import { NotificationManager } from "@/lib/notification-manager";
import { NativeModules, Platform } from "react-native";

// App identifier to distinguish our alarms from system/other app alarms
export const APP_IDENTIFIER = "com.alarmai.mobile.alarm";

// Use a simple random ID generator instead of uuid to avoid dependencies
const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const AlarmService = NativeModules.AlarmModule;

export async function scheduleAlarm(alarm: any) {
  if (!(alarm instanceof Alarm)) {
    alarm = new Alarm(alarm);
  }

  if (Platform.OS === "android") {
    await AlarmService.set(alarm.toAndroid());
  } else {
    await NotificationManager.scheduleAlarm(alarm);
  }
  console.log("scheduling alarm: ", JSON.stringify(alarm));
}

export async function enableAlarm(uid: string) {
  if (Platform.OS === "android") {
    await AlarmService.enable(uid);
  } else {
    // iOS: Re-schedule if needed, or handled by store logic re-scheduling
  }
}

export async function disableAlarm(uid: string) {
  if (Platform.OS === "android") {
    await AlarmService.disable(uid);
  } else {
    await NotificationManager.cancelAlarmNotifications(uid);
  }
}

export async function stopAlarm() {
  if (Platform.OS === "android") {
    await AlarmService.stop();
  } else {
    // On iOS, stopping typically means cancelling the notification sound?
    // Or user taps notification.
    // There is no programmatic "stop sound" for local notifications once firing unless we open app.
  }
}

export async function removeAlarm(uid: string) {
  if (Platform.OS === "android") {
    await AlarmService.remove(uid);
  } else {
    await NotificationManager.cancelAlarmNotifications(uid);
  }
}

export async function updateAlarm(alarm: any) {
  if (!(alarm instanceof Alarm)) {
    alarm = new Alarm(alarm);
  }
  if (Platform.OS === "android") {
    await AlarmService.update(alarm.toAndroid());
  } else {
    // iOS: Cancel and Schedule
    await removeAlarm(alarm.uid);
    await scheduleAlarm(alarm);
  }
}

export async function removeAllAlarms() {
  if (Platform.OS === "android") {
    // Only remove alarms created by this app
    await AlarmService.removeAll(APP_IDENTIFIER);
  } else {
    await NotificationManager.cancelAll();
  }
}

export async function getAllAlarms() {
  if (Platform.OS === "android") {
    const alarms = await AlarmService.getAll();
    // Filter to only return alarms created by this app
    return alarms
      .map((a: any) => Alarm.fromAndroid(a))
      .filter((alarm: Alarm) => alarm.appIdentifier === APP_IDENTIFIER);
  } else {
    return []; // iOS doesn't persist alarms in native layer, relies on Store/JS
  }
}

export async function getAlarm(uid: string) {
  if (Platform.OS === "android") {
    const alarm = await AlarmService.get(uid);
    return Alarm.fromAndroid(alarm);
  } else {
    return null;
  }
}

export async function getAlarmState() {
  if (Platform.OS === "android") {
    return AlarmService.getState();
  } else {
    return "unknown";
  }
}

export async function checkExactAlarmPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    return AlarmService.checkExactAlarmPermission();
  }
  return true;
}

export async function requestExactAlarmPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    return AlarmService.requestExactAlarmPermission();
  }
  return true;
}

export async function checkFullScreenPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    return AlarmService.checkFullScreenPermission();
  }
  return true;
}

export async function requestFullScreenPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    return AlarmService.requestFullScreenPermission();
  }
  return true;
}

export async function checkBatteryOptimization(): Promise<boolean> {
  if (Platform.OS === "android") {
    return AlarmService.checkBatteryOptimization();
  }
  return true;
}

export async function requestBatteryOptimization(): Promise<boolean> {
  if (Platform.OS === "android") {
    return AlarmService.requestBatteryOptimization();
  }
  return true;
}

export async function getTriggeredAlarm(): Promise<string | null> {
  if (Platform.OS === "android") {
    return AlarmService.getTriggeredAlarm();
  }
  return null;
}

export async function snoozeAlarm(alarmId?: string) {
  // 1. Stop the current alarm sound/service
  await stopAlarm();

  // 2. Schedule a new alarm for 9 minutes later
  const snoozeTime = new Date();
  snoozeTime.setMinutes(snoozeTime.getMinutes() + 9);

  const snoozeAlarm: Alarm = new Alarm({
    title: "Snoozed Alarm",
    hour: snoozeTime.getHours(),
    minutes: snoozeTime.getMinutes(),
    enabled: true,
    active: true,
    vibration: true,
    sound: "default",
    days: [snoozeTime.getDay()], // Daily alarm for today's day (handled as one-off logic essentially)
  });

  await scheduleAlarm(snoozeAlarm);
}

export default class Alarm {
  uid: string;
  enabled: boolean;
  title: string;
  description: string;
  hour: number;
  minutes: number;
  snoozeInterval: number;
  repeating: boolean;
  active: boolean;
  days: number[];
  sound: string;
  vibration: boolean;
  appIdentifier: string;
  // id alias for compatibility with Store interface if needed, but Store uses 'id' and passes it as 'uid' in helper
  get id() {
    return this.uid;
  }
  get time() {
    return `${this.hour < 10 ? "0" : ""}${this.hour}:${this.minutes < 10 ? "0" : ""}${this.minutes}`;
  }

  constructor(params: any = null) {
    this.uid = getParam(params, "uid", uuidv4());
    this.enabled = getParam(params, "enabled", true);
    this.title = getParam(params, "title", "Alarm");
    this.description = getParam(params, "description", "Wake up");
    this.hour = getParam(params, "hour", new Date().getHours());
    this.minutes = getParam(params, "minutes", new Date().getMinutes() + 1);
    this.snoozeInterval = getParam(params, "snoozeInterval", 1);
    this.repeating = getParam(params, "repeating", false);
    this.active = getParam(params, "active", true);
    this.days = getParam(params, "days", [new Date().getDay()]);
    this.sound = getParam(params, "sound", "default");
    this.vibration = getParam(params, "vibration", true);
    this.appIdentifier = getParam(params, "appIdentifier", APP_IDENTIFIER);
  }

  static getEmpty() {
    return new Alarm({
      title: "",
      description: "",
      hour: 0,
      minutes: 0,
      repeating: false,
      days: [],
      sound: "default",
      vibration: true,
    });
  }

  toAndroid() {
    return {
      ...this,
      days: toAndroidDays(this.days),
    };
  }

  static fromAndroid(alarm: any) {
    alarm.days = fromAndroidDays(alarm.days);
    return new Alarm(alarm);
  }

  getTimeString() {
    const hour = this.hour < 10 ? "0" + this.hour : this.hour;
    const minutes = this.minutes < 10 ? "0" + this.minutes : this.minutes;
    return { hour, minutes };
  }

  getTime() {
    const timeDate = new Date();
    timeDate.setMinutes(this.minutes);
    timeDate.setHours(this.hour);
    return timeDate;
  }
}

function getParam(param: any, key: string, defaultValue: any) {
  try {
    if (param && (param[key] !== null || param[key] !== undefined)) {
      return param[key];
    } else {
      return defaultValue;
    }
  } catch (e) {
    return defaultValue;
  }
}

export function toAndroidDays(daysArray: number[]) {
  return daysArray.map((day) => (day + 1) % 7);
}

export function fromAndroidDays(daysArray: number[]) {
  return daysArray.map((d) => (d === 0 ? 6 : d - 1));
}
