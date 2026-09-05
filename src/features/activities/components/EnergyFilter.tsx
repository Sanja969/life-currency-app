import { Pressable, Text, View } from "react-native";

type EnergyFilterProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
};

export function EnergyFilter({
  label,
  selected,
  onPress,
  color,
}: EnergyFilterProps) {
  const activeColor = color ?? "#8B9BFF";

  return (
    <Pressable
      onPress={onPress}
      className={`h-[34px] flex-1 flex-row items-center justify-center rounded-[10px] ${
        selected ? "bg-[#11182D]" : "bg-transparent"
      }`}
      style={
        selected
          ? {
              shadowColor: activeColor,
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: {
                width: 0,
                height: 0,
              },
            }
          : undefined
      }
    >
      {color ? (
        <View
          className="mr-1.5 h-[5px] w-[5px] rounded-full"
          style={{
            backgroundColor: selected ? activeColor : "#455168",
            shadowColor: activeColor,
            shadowOpacity: selected ? 0.8 : 0,
            shadowRadius: 4,
            shadowOffset: {
              width: 0,
              height: 0,
            },
          }}
        />
      ) : null}

      <Text
        className="text-[11px] font-semibold"
        style={{
          color: selected ? (color ?? "#D3D9FF") : "#59657D",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
