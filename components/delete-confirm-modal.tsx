import { AlertTriangle } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

export default function DeleteConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}: DeleteConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm">
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-red-500/10 dark:bg-red-400/20 rounded-full items-center justify-center">
              <AlertTriangle size={32} color="#EF4444" strokeWidth={2} />
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-center text-black dark:text-white mb-2">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-base text-center text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 bg-gray-200 dark:bg-zinc-800 p-4 rounded-2xl active:opacity-70"
            >
              <Text className="text-center text-gray-700 dark:text-gray-300 font-semibold">
                {cancelText}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              className="flex-1 bg-red-600 p-4 rounded-2xl active:opacity-70"
            >
              <Text className="text-center text-white font-semibold">
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
