import { NativeModules } from "react-native";

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
  await AlarmService.set(alarm.toAndroid());
  console.log("scheduling alarm: ", JSON.stringify(alarm));
}

export async function enableAlarm(uid: string) {
  await AlarmService.enable(uid);
}

export async function disableAlarm(uid: string) {
  await AlarmService.disable(uid);
}

export async function stopAlarm() {
  await AlarmService.stop();
}

export async function snoozeAlarm() {
  await AlarmService.snooze();
}

export async function removeAlarm(uid: string) {
  await AlarmService.remove(uid);
}

export async function updateAlarm(alarm: any) {
  if (!(alarm instanceof Alarm)) {
    alarm = new Alarm(alarm);
  }
  await AlarmService.update(alarm.toAndroid());
}

export async function removeAllAlarms() {
  await AlarmService.removeAll();
}

export async function getAllAlarms() {
  const alarms = await AlarmService.getAll();
  return alarms.map((a: any) => Alarm.fromAndroid(a));
}

export async function getAlarm(uid: string) {
  const alarm = await AlarmService.get(uid);
  return Alarm.fromAndroid(alarm);
}

export async function getAlarmState() {
  return AlarmService.getState();
}

export async function checkExactAlarmPermission(): Promise<boolean> {
  return AlarmService.checkExactAlarmPermission();
}

export async function requestExactAlarmPermission(): Promise<boolean> {
  return AlarmService.requestExactAlarmPermission();
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
