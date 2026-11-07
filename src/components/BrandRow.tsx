import { Text, View } from "react-native";
import { Wrench } from "lucide-react-native";

export function BrandRow({ showTag = true }: { showTag?: boolean }) {
  return (
    <View className="flex-row items-center">
      <View className="h-[30px] w-[30px] items-center justify-center rounded-chip bg-signal">
        <Wrench size={16} color="#0E0E0C" strokeWidth={2.4} />
      </View>
      <Text className="ml-2 font-display text-[30px] leading-[34px] text-white">
        SEVA
      </Text>
      {showTag && (
        <View className="ml-3 rounded-chip bg-signal px-2 py-1">
          <Text className="font-mono text-xs uppercase tracking-wider text-ink">
            Service Center
          </Text>
        </View>
      )}
    </View>
  );
}
