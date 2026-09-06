import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

type DeleteActivityModalProps = {
  visible: boolean;
  activityTitle: string;
  isDeleting: boolean;
  onCancel: () => void;
  onDelete: () => void;
};

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
        if (!isDeleting) {
          onCancel();
        }
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/75 px-6">
        <Pressable
          className="absolute inset-0"
          disabled={isDeleting}
          onPress={onCancel}
        />

        <View
          className="w-full max-w-[380px] overflow-hidden rounded-[28px] border border-[#6F294D] bg-[#080D19]"
          style={{
            shadowColor: "#E657A8",
            shadowOpacity: 0.24,
            shadowRadius: 30,
            shadowOffset: {
              width: 0,
              height: 12,
            },
            elevation: 20,
          }}
        >
          {/* BACKGROUND FIELD */}

          <View
            pointerEvents="none"
            className="absolute -right-20 -top-24 h-[220px] w-[220px] rounded-full"
            style={{
              backgroundColor: "#E657A8",
              opacity: 0.08,
            }}
          />

          <View
            pointerEvents="none"
            className="absolute -bottom-28 -left-24 h-[220px] w-[220px] rounded-full border"
            style={{
              borderColor: "rgba(230,87,168,0.10)",
            }}
          />

          <View className="items-center px-6 pb-6 pt-7">
            {/* DELETE CORE */}

            <View className="h-[76px] w-[76px] items-center justify-center rounded-full border border-[#E657A8]/25 bg-[#E657A8]/[0.06]">
              <View
                className="h-[48px] w-[48px] items-center justify-center rounded-full bg-[#351124]"
                style={{
                  shadowColor: "#E657A8",
                  shadowOpacity: 0.45,
                  shadowRadius: 18,
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                }}
              >
                <Ionicons name="trash-outline" size={23} color="#F06BB9" />
              </View>
            </View>

            <Text className="mt-5 text-center text-[21px] font-bold tracking-[-0.4px] text-white">
              Delete activity?
            </Text>

            <Text className="mt-2 text-center text-[14px] leading-[21px] text-[#8591AB]">
              This will permanently remove
            </Text>

            <Text
              numberOfLines={2}
              className="mt-1 max-w-[270px] text-center text-[15px] font-semibold leading-[21px] text-[#E4E8F2]"
            >
              “{activityTitle}”
            </Text>

            <Text className="mt-1 text-center text-[14px] leading-[21px] text-[#8591AB]">
              from your activity history.
            </Text>

            {/* WARNING */}

            <View className="mt-5 w-full flex-row items-center rounded-[15px] border border-[#71304F]/40 bg-[#351124]/40 px-4 py-3">
              <Ionicons name="alert-circle-outline" size={18} color="#E96AAA" />

              <Text className="ml-2.5 flex-1 text-[12px] leading-[18px] text-[#B9819F]">
                This action cannot be undone.
              </Text>
            </View>

            {/* ACTIONS */}

            <View className="mt-6 w-full flex-row">
              <Pressable
                disabled={isDeleting}
                onPress={onCancel}
                className="mr-2 h-[52px] flex-1 items-center justify-center rounded-[16px] border border-[#26344F] bg-[#101827]"
                style={({ pressed }) => ({
                  opacity: isDeleting ? 0.45 : pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Text className="text-[14px] font-semibold text-[#C4CCDE]">
                  Keep trace
                </Text>
              </Pressable>

              <Pressable
                disabled={isDeleting}
                onPress={onDelete}
                className="ml-2 h-[52px] flex-1 flex-row items-center justify-center rounded-[16px] border border-[#D74A91]/70 bg-[#8D285D]/40"
                style={({ pressed }) => ({
                  opacity: isDeleting ? 0.7 : pressed ? 0.75 : 1,

                  transform: [{ scale: pressed ? 0.98 : 1 }],

                  shadowColor: "#E657A8",
                  shadowOpacity: pressed ? 0.35 : 0.18,
                  shadowRadius: 12,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                })}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#F7B1D4" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={17} color="#F38AC0" />

                    <Text className="ml-2 text-[14px] font-semibold text-[#F38AC0]">
                      Delete
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
