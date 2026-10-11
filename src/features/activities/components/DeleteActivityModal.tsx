import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Svg, { Path } from "react-native-svg";

type DeleteActivityModalProps = {
  visible: boolean;
  activityTitle: string;
  isDeleting: boolean;
  onCancel: () => void;
  onDelete: () => void;
};

const COLORS = {
  surface: "#151720",
  gold: "#D6AD65",
  text: "#F5F0E7",
  muted: "#9295A5",
  danger: "#E78A8A",
};

function AngularCard({ children }: { children: React.ReactNode }) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;

    setSize((previous) => {
      if (
        Math.abs(previous.width - width) < 0.5 &&
        Math.abs(previous.height - height) < 0.5
      ) {
        return previous;
      }

      return { width, height };
    });
  }

  const cut = 16;

  const path = `
    M ${cut} 0
    L ${size.width} 0
    L ${size.width} ${size.height - cut}
    L ${size.width - cut} ${size.height}
    L 0 ${size.height}
    L 0 ${cut}
    Z
  `;

  return (
    <View onLayout={handleLayout} style={styles.card}>
      {size.width > 0 && size.height > 0 && (
        <Svg
          pointerEvents="none"
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={path}
            fill={COLORS.surface}
            stroke="rgba(214,173,101,0.3)"
            strokeWidth={1}
          />
        </Svg>
      )}

      {children}
    </View>
  );
}

export function DeleteActivityModal({
  visible,
  activityTitle,
  isDeleting,
  onCancel,
  onDelete,
}: DeleteActivityModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!isDeleting) onCancel();
      }}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          disabled={isDeleting}
          onPress={onCancel}
          accessibilityLabel="Close delete confirmation"
        />

        <AngularCard>
          <View style={styles.content}>
            <Text style={styles.eyebrow}>LIFE CURRENCY</Text>

            <View style={styles.iconContainer}>
              <Ionicons name="trash-outline" size={25} color={COLORS.danger} />
            </View>

            <Text style={styles.title}>Delete this trace?</Text>

            <Text style={styles.description}>
              You're about to permanently remove
            </Text>

            <Text numberOfLines={2} style={styles.activityTitle}>
              “{activityTitle}”
            </Text>

            <Text style={styles.description}>from your activity history.</Text>

            <View style={styles.warning}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={COLORS.danger}
              />

              <Text style={styles.warningText}>
                This action cannot be undone.
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                disabled={isDeleting}
                onPress={onCancel}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.cancelButton,
                  { opacity: isDeleting ? 0.5 : pressed ? 0.75 : 1 },
                ]}
              >
                <Text style={styles.cancelText}>Keep trace</Text>
              </Pressable>

              <Pressable
                disabled={isDeleting}
                onPress={onDelete}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.deleteButton,
                  { opacity: isDeleting ? 0.7 : pressed ? 0.75 : 1 },
                ]}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={COLORS.danger} />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color={COLORS.danger}
                    />
                    <Text style={styles.deleteText}>Delete</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </AngularCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.82)",
  },
  card: {
    width: "100%",
    maxWidth: 380,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(231,138,138,0.1)",
    borderWidth: 1,
    borderColor: "rgba(231,138,138,0.3)",
    marginBottom: 18,
  },
  title: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "600",
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
  },
  activityTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 4,
  },
  warning: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    backgroundColor: "rgba(231,138,138,0.08)",
    borderWidth: 1,
    borderColor: "rgba(231,138,138,0.22)",
    marginTop: 22,
  },
  warningText: {
    color: "#D9A9AC",
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#11141D",
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.22)",
  },
  cancelText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(231,138,138,0.12)",
    borderWidth: 1,
    borderColor: "rgba(231,138,138,0.45)",
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "700",
  },
});
