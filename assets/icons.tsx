import { AlarmClock, Settings, Timer } from "lucide-react-native";

export const icons: Record<
  string,
  (props: { color: string }) => React.ReactNode
> = {
  index: (props) => <AlarmClock size={24} {...props} />,
  timer: (props) => <Timer size={24} {...props} />,
  explore: (props) => <Timer size={24} {...props} />, // Fallback if old route exists cache
  settings: (props) => <Settings size={24} {...props} />,
};
