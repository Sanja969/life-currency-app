import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type AppButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  cosmic?: boolean;
};

export function AppButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  cosmic = false,
}: AppButtonProps) {
  if (!cosmic) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={[
          "min-h-[54px] items-center justify-center rounded-2xl bg-indigo-600",
          disabled ? "opacity-40" : "",
        ].join(" ")}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-base font-semibold text-white">{children}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        "overflow-hidden rounded-[22px]",
        disabled ? "opacity-40" : "",
      ].join(" ")}
    >
      <LinearGradient
        colors={["#1455B8", "#4233B3", "#6B2F92"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          minHeight: 60,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "#858BFF",
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10">
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </View>

            <Text className="text-lg font-semibold text-white">{children}</Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
              className="ml-3"
            />
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}
