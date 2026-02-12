import {
  checkBatteryOptimization,
  checkFullScreenPermission,
  requestBatteryOptimization,
  requestFullScreenPermission,
} from "@/lib/alarm-service";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PermissionRequestProps {
  visible: boolean;
  onClose: () => void;
}

export const PermissionRequest: React.FC<PermissionRequestProps> = ({
  visible,
  onClose,
}) => {
  const [step, setStep] = useState(0); // 0: Check, 1: Full Screen, 2: Battery
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (visible && Platform.OS === "android") {
      checkPermissions();
    }
  }, [visible]);

  const checkPermissions = async () => {
    const missing = [];

    // Check Full Screen Permission (Android 14+)
    const hasFullScreen = await checkFullScreenPermission();
    if (!hasFullScreen) missing.push("fullscreen");

    // Check Battery Optimization
    const hasBatteryOpt = await checkBatteryOptimization();
    if (!hasBatteryOpt) missing.push("battery");

    setMissingPermissions(missing);

    if (missing.length === 0) {
      onClose();
    }
  };

  const handleGrantFullScreen = async () => {
    const result = await requestFullScreenPermission();
    // Re-check after a short delay to allow return from settings
    setTimeout(checkPermissions, 1000);
  };

  const handleGrantBattery = async () => {
    const result = await requestBatteryOptimization();
    setTimeout(checkPermissions, 1000);
  };

  const currentPermission = missingPermissions[0];

  if (!visible || missingPermissions.length === 0) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.container}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <View style={styles.content}>
          <Text style={styles.title}>İzin Gerekli</Text>

          {currentPermission === "fullscreen" && (
            <>
              <Text style={styles.description}>
                Alarmın ekran kilitliyken çalabilmesi için "Tam Ekran Bildirim"
                iznini vermeniz gerekiyor.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={handleGrantFullScreen}
              >
                <Text style={styles.buttonText}>İzni Ver</Text>
              </TouchableOpacity>
            </>
          )}

          {currentPermission === "battery" && (
            <>
              <Text style={styles.description}>
                Alarmın zamanında çalabilmesi için "Pil Optimizasyonu"
                kısıtlamasını kaldırmanız gerekiyor.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={handleGrantBattery}
              >
                <Text style={styles.buttonText}>Kısıtlamayı Kaldır</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <Text style={styles.skipText}>Daha Sonra</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    width: "80%",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#CCC",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    color: "#888",
    fontSize: 14,
  },
});
