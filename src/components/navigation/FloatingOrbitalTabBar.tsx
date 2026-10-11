import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Tabs } from "expo-router";
import type { ComponentProps } from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from "react-native-svg";

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { LifeCurrencyTab, LifeCurrencyTabIcon } from "./LifeCurrencyTabIcon";

const COLORS = {
  background: "#080A10",
  dock: "#211A2C",
  gold: "#D6AD65",
  lightGold: "#F3D49B",
  muted: "#A59BAD",
};

const TAB_NAMES: Record<string, LifeCurrencyTab> = {
  index: "today",
  activities: "activities",
  progress: "progress",
  settings: "settings",
};

type FloatingTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

type OrbitalTabProps = {
  name: LifeCurrencyTab;
  label: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function CosmicDockBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 360 100"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <SvgGradient id="cinematicGradient" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#29251F" />
          <Stop offset="0.5" stopColor="#171715" />
          <Stop offset="1" stopColor="#090B10" />
        </SvgGradient>
      </Defs>

      {/* MAIN SHAPE */}
      <Path
        d="
            M 0 28
            L 22 14
            L 112 14
            L 130 23
            L 220 23
            L 238 14
            L 338 14
            L 360 28
            L 360 100
            L 0 100
            Z
          "
        fill="url(#cinematicGradient)"
        stroke="rgba(214,173,101,0.22)"
        strokeWidth="1"
      />

      {/* LEFT ACCENT */}
      <Path
        d="M 24 14 L 92 14"
        stroke="#D6AD65"
        strokeWidth="1.4"
        opacity="0.55"
      />

      {/* RIGHT ACCENT */}
      <Path
        d="M 270 14 L 336 14"
        stroke="#D6AD65"
        strokeWidth="1.4"
        opacity="0.55"
      />

      {/* CENTRAL DETAIL */}
      <Path
        d="M 153 23 L 207 23"
        stroke="#D6AD65"
        strokeWidth="1"
        opacity="0.25"
      />
    </Svg>
  );
}
function OrbitalTab({
  name,
  label,
  focused,
  onPress,
  onLongPress,
}: OrbitalTabProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, progress]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: -5 * progress.value,
      },
      {
        scale: 1 + 0.08 * progress.value,
      },
    ],
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: 0.8 + 0.2 * progress.value,
      },
    ],
  }));

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: 0.5 + 0.5 * progress.value,
      },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={styles.tab}
    >
      <View style={styles.iconArea}>
        {/* GOLD ORBIT */}
        <Animated.View
          pointerEvents="none"
          style={[styles.activeOrbit, animatedRingStyle]}
        />

        {/* ICON */}
        <Animated.View style={animatedIconStyle}>
          <LifeCurrencyTabIcon name={name} focused={focused} size={26} />
        </Animated.View>
      </View>

      {/* LABEL */}
      <Text
        style={[
          styles.label,
          {
            color: focused ? COLORS.lightGold : COLORS.muted,
          },
        ]}
      >
        {label}
      </Text>

      {/* ACTIVE DOT */}
      <Animated.View
        pointerEvents="none"
        style={[styles.activeDot, animatedDotStyle]}
      />
    </Pressable>
  );
}

export function FloatingOrbitalTabBar({
  state,
  descriptors,
  navigation,
}: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();

  const bottomOffset = 0;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: bottomOffset,
        },
      ]}
    >
      <View style={styles.dock}>
        <CosmicDockBackground />

        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            const options = descriptor.options;

            const focused = state.index === index;

            const name = TAB_NAMES[route.name];

            if (!name) {
              return null;
            }

            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : typeof options.title === "string"
                  ? options.title
                  : route.name;

            function onPress() {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }

            function onLongPress() {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            }

            return (
              <OrbitalTab
                key={route.key}
                name={name}
                label={label}
                focused={focused}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },

  dock: {
    height: 88,
    backgroundColor: "transparent",
    borderWidth: 0,
    overflow: "visible",
  },

  tabsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingBottom: 7,
  },

  tab: {
    flex: 1,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
  },

  topHighlight: {
    position: "absolute",
    top: 0,
    left: 35,
    right: 35,
    height: 1,

    backgroundColor: "rgba(243,212,155,0.32)",
  },
  iconArea: {
    height: 39,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginTop: 0,
  },

  activeDot: {
    position: "absolute",
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.lightGold,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  activeOrbit: {
    position: "absolute",
    width: 43,
    height: 43,
    borderRadius: 22,

    borderWidth: 1,
    borderColor: "rgba(243,212,155,0.58)",

    backgroundColor: "rgba(214,173,101,0.055)",

    shadowColor: COLORS.gold,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
});
