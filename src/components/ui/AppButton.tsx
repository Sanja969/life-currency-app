import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

type AppButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  cosmic?: boolean;
  variant?: "default" | "cosmic" | "goldGlass" | "onboarding";
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  cosmic = false,
  variant,
  icon = "arrow-forward",
  style,
}: AppButtonProps) {
  const selectedVariant = variant ?? (cosmic ? "cosmic" : "default");
  const isDisabled = disabled || loading;

  // DEFAULT — existing form button
  if (selectedVariant === "default") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        style={style}
        className={[
          "min-h-[54px] items-center justify-center rounded-2xl bg-indigo-600",
          isDisabled ? "opacity-40" : "",
        ].join(" ")}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-base font-semibold text-white">
            {children}
          </Text>
        )}
      </Pressable>
    );
  }

  // COSMIC — existing gradient button
  if (selectedVariant === "cosmic") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        style={style}
        className={[
          "overflow-hidden rounded-[22px]",
          isDisabled ? "opacity-40" : "",
        ].join(" ")}
      >
        <LinearGradient
          colors={["#1455B8", "#4233B3", "#6B2F92"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cosmicGradient}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </View>

              <Text className="text-lg font-semibold text-white">
                {children}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#FFFFFF"
                style={{ marginLeft: 12 }}
              />
            </>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  // ONBOARDING — circular champagne-gold button
  if (selectedVariant === "onboarding") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={
          icon === "checkmark" ? "Finish onboarding" : "Next step"
        }
        accessibilityState={{
          disabled: isDisabled,
          busy: loading,
        }}
        style={({ pressed }) => [
          styles.onboardingButton,
          style,
          {
            opacity: isDisabled ? 0.45 : pressed ? 0.8 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={["#FFF0C9", "#E8C58A", "#C99B58"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.onboardingGradient}
        >
          {loading ? (
            <ActivityIndicator color="#080A10" />
          ) : (
            <Ionicons name={icon} size={24} color="#17120B" />
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  // GOLD GLASS — premium Life Currency action button
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.goldGlassButton,
        style,
        {
          opacity: isDisabled ? 0.4 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <LinearGradient
        colors={[
          "rgba(214,173,101,0.20)",
          "rgba(214,173,101,0.08)",
          "rgba(214,173,101,0.02)",
        ]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.goldGlassGradient}
      >
        {loading ? (
          <ActivityIndicator color="#F3D49B" />
        ) : (
          <>
            <Text style={styles.goldGlassText}>{children}</Text>
            <Ionicons name={icon} size={19} color="#F3D49B" />
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cosmicGradient: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#858BFF",
  },

  // ONBOARDING
  onboardingButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,230,180,0.65)",

    shadowColor: "#D6AD65",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  onboardingGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // GOLD GLASS
  goldGlassButton: {
    minHeight: 58,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(214,173,101,0.48)",
    overflow: "hidden",
  },

  goldGlassGradient: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    gap: 12,
  },

  goldGlassText: {
    color: "#F3D49B",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});