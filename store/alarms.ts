import {
  disableAlarm,
  enableAlarm,
  removeAlarm,
  removeAllAlarms,
  scheduleAlarm,
  updateAlarm as updateAlarmService,
} from "@/lib/alarm-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Alarm {
  id: string;
  time: string;
  title: string;
  enabled: boolean;
  days: number[]; // 0 = Sunday, 1 = Monday, etc.
  vibration: boolean;
  sound: string;
  mode: "daily" | "weekly"; // NEW: Strict separation
}

type ViewMode = "daily" | "weekly";

interface AlarmsState {
  alarms: Alarm[];
  viewMode: ViewMode;
  selectedDay: number; // Single day instead of array
  editMode: boolean;
  selectedAlarms: string[];

  setViewMode: (mode: ViewMode) => void;
  setSelectedDay: (day: number) => void; // Set single day
  addAlarm: (alarm: Omit<Alarm, "id" | "mode">) => void; // Mode is auto-set
  deleteAlarm: (id: string) => void;
  deleteAlarms: (ids: string[]) => void;
  toggleAlarm: (id: string) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  toggleEditMode: () => void;
  toggleSelectAlarm: (id: string) => void;
  clearSelection: () => void;
}

const INITIAL_ALARMS: Alarm[] = [
  {
    id: "1",
    time: "07:00",
    title: "Uyanış",
    enabled: true,
    days: [1, 2, 3, 4, 5],
    vibration: true,
    sound: "default",
    mode: "daily",
  },
  {
    id: "2",
    time: "08:30",
    title: "İşe Gidiş",
    enabled: true,
    days: [1, 2, 3, 4, 5],
    vibration: true,
    sound: "default",
    mode: "daily",
  },
  {
    id: "3",
    time: "10:00",
    title: "Toplantı",
    enabled: false,
    days: [3],
    vibration: false,
    sound: "default",
    mode: "weekly",
  },
  {
    id: "4",
    time: "09:00",
    title: "Spor",
    enabled: true,
    days: [0, 6],
    vibration: true,
    sound: "default",
    mode: "weekly",
  },
];

export const useAlarmsStore = create<AlarmsState>()(
  persist(
    (set, get) => ({
      alarms: INITIAL_ALARMS,
      viewMode: "daily",
      selectedDay: 1, // Default to Monday
      editMode: false,
      selectedAlarms: [],

      setViewMode: async (mode) => {
        // 1. Remove ALL native alarms when switching modes (clean slate)
        await removeAllAlarms();

        const state = get();
        // 2. Reschedule ONLY alarms for the NEW mode
        const relevantAlarms = state.alarms.filter(
          (a) => a.mode === mode && a.enabled,
        );

        for (const alarm of relevantAlarms) {
          const [hour, minute] = alarm.time.split(":").map(Number);
          await scheduleAlarm({
            uid: alarm.id,
            hour,
            minutes: minute,
            title: alarm.title,
            description: alarm.title,
            days: alarm.days,
            active: true,
            repeating: true,
            sound: alarm.sound,
            vibration: alarm.vibration,
          });
        }

        set((state) => {
          if (mode === "weekly") {
            const today = new Date().getDay();
            return { viewMode: mode, selectedDay: today };
          }
          return { viewMode: mode };
        });
      },

      setSelectedDay: (day) => set({ selectedDay: day }),

      addAlarm: async (alarmData) => {
        // await NotificationManager.requestPermissions(); // Handled by native module? or should we keep check?
        // Native module usually handles perm requests on schedule if needed, or we might need a separate check.
        // For now, let's assume native handles it or we rely on previous checks.

        const state = get();
        const id = Date.now().toString();
        const newAlarm: Alarm = {
          ...alarmData,
          id,
          mode: state.viewMode, // Auto-assign mode
        };

        const [hour, minute] = newAlarm.time.split(":").map(Number);

        await scheduleAlarm({
          uid: newAlarm.id,
          hour,
          minutes: minute,
          title: newAlarm.title,
          description: newAlarm.title,
          days: newAlarm.days,
          active: newAlarm.enabled,
          repeating: true,
          sound: newAlarm.sound,
          vibration: newAlarm.vibration,
        });

        set((state) => ({
          alarms: [...state.alarms, newAlarm],
        }));
      },

      deleteAlarm: (id) => {
        removeAlarm(id);
        set((state) => ({
          alarms: state.alarms.filter((a) => a.id !== id),
        }));
      },

      deleteAlarms: (ids) => {
        ids.forEach((id) => removeAlarm(id));
        set((state) => ({
          alarms: state.alarms.filter((a) => !ids.includes(a.id)),
          selectedAlarms: [],
          editMode: false,
        }));
      },

      toggleAlarm: async (id) => {
        const state = get();
        const alarm = state.alarms.find((a) => a.id === id);

        if (alarm) {
          // Weekly Mode Isolation Logic
          if (state.viewMode === "weekly" && alarm.mode === "weekly") {
            const currentDay = state.selectedDay;
            // If alarm includes this day and has multiple days, we might need to split
            if (alarm.days.includes(currentDay) && alarm.days.length > 1) {
              // 1. Update old alarm: Remove current day
              const updatedOldAlarm = {
                ...alarm,
                days: alarm.days.filter((d) => d !== currentDay),
              };

              const [hOld, mOld] = updatedOldAlarm.time.split(":").map(Number);
              await updateAlarmService({
                uid: updatedOldAlarm.id,
                hour: hOld,
                minutes: mOld,
                title: updatedOldAlarm.title,
                description: updatedOldAlarm.title,
                days: updatedOldAlarm.days,
                active: updatedOldAlarm.enabled,
                repeating: true,
                sound: updatedOldAlarm.sound,
                vibration: updatedOldAlarm.vibration,
              });

              // 2. Create new alarm: Just for this day, with toggled state
              const newAlarmReq: Alarm = {
                ...alarm,
                enabled: !alarm.enabled, // Toggled state
                mode: "weekly",
              };

              const [hNew, mNew] = newAlarmReq.time.split(":").map(Number);
              await scheduleAlarm({
                uid: newAlarmReq.id,
                hour: hNew,
                minutes: mNew,
                title: newAlarmReq.title,
                description: newAlarmReq.title,
                days: newAlarmReq.days,
                active: newAlarmReq.enabled,
                repeating: true,
                sound: newAlarmReq.sound,
                vibration: newAlarmReq.vibration,
              });

              set((state) => ({
                alarms: [
                  ...state.alarms.map((a) =>
                    a.id === id ? updatedOldAlarm : a,
                  ),
                  newAlarmReq,
                ],
              }));
              return;
            }
          }

          const updatedAlarm = { ...alarm, enabled: !alarm.enabled };

          if (updatedAlarm.enabled) {
            await enableAlarm(id);
          } else {
            await disableAlarm(id);
          }

          set((state) => ({
            alarms: state.alarms.map((a) => (a.id === id ? updatedAlarm : a)),
          }));
        }
      },

      updateAlarm: async (id, updates) => {
        const state = get();
        const alarm = state.alarms.find((a) => a.id === id);
        if (alarm) {
          const updatedAlarm = { ...alarm, ...updates };

          const [hUp, mUp] = updatedAlarm.time.split(":").map(Number);
          await updateAlarmService({
            uid: updatedAlarm.id,
            hour: hUp,
            minutes: mUp,
            title: updatedAlarm.title,
            description: updatedAlarm.title,
            days: updatedAlarm.days,
            active: updatedAlarm.enabled,
            repeating: true,
            sound: updatedAlarm.sound,
            vibration: updatedAlarm.vibration,
          });

          set((state) => ({
            alarms: state.alarms.map((a) => (a.id === id ? updatedAlarm : a)),
          }));
        }
      },

      toggleEditMode: () =>
        set((state) => ({
          editMode: !state.editMode,
          selectedAlarms: state.editMode ? [] : state.selectedAlarms,
        })),

      toggleSelectAlarm: (id) =>
        set((state) => {
          const selected = state.selectedAlarms.includes(id)
            ? state.selectedAlarms.filter((aid) => aid !== id)
            : [...state.selectedAlarms, id];
          return { selectedAlarms: selected };
        }),

      clearSelection: () => set({ selectedAlarms: [], editMode: false }),
    }),
    {
      name: "alarms-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
