import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Clock,
  LayoutGrid,
  LogOut,
  Store,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { logout } from "../../service/AuthService";

type ItemKey = "board" | "profile" | "hours" | "services";

const ITEMS: { key: ItemKey; label: string; Icon: LucideIcon }[] = [
  { key: "board", label: "Today's board", Icon: LayoutGrid },
  { key: "profile", label: "Store profile", Icon: Store },
  { key: "hours", label: "Hours and capacity", Icon: Clock },
  { key: "services", label: "Services", Icon: Wrench },
];

const DURATION_MS = 220;

function initialsOf(name?: string) {
  const letters = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]);
  return letters.length ? letters.join("").toUpperCase() : "S";
}

type Props = {
  visible: boolean;
  onClose: () => void;
  active: ItemKey;
  storeName?: string;
  area?: string;
};

export function SideDrawer({ visible, onClose, active, storeName, area }: Props) {
  const insets = useSafeAreaInsets();
  const width = Math.min(Dimensions.get("window").width * 0.78, 360);
  const x = useRef(new Animated.Value(-width)).current;
  const [mounted, setMounted] = useState(visible);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(x, {
        toValue: 0,
        duration: DURATION_MS,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(x, {
        toValue: -width,
        duration: DURATION_MS,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [visible, width, x]);

  const onLogout = async () => {
    setSigningOut(true);
    await logout();
    onClose();
    router.replace("/login");
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        <Animated.View
          style={{ width, transform: [{ translateX: x }] }}
          className="border-r-2 border-ink bg-paper"
        >
          {/* Header */}
          <View
            className="bg-ink px-5 pb-5"
            style={{ paddingTop: insets.top + 16 }}
          >
            <View className="flex-row items-start justify-between">
              <View className="h-[72px] w-[72px] items-center justify-center rounded-card bg-signal">
                <Text className="font-display text-[34px] leading-[38px] text-ink">
                  {initialsOf(storeName)}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                className="h-11 w-11 items-center justify-center rounded-ctl border-2 border-hold"
              >
                <X size={22} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            </View>
            <Text className="mt-5 font-display uppercase text-[34px] leading-[36px] text-white">
              {storeName ?? "Your store"}
            </Text>
            {!!area && (
              <Text className="mt-2 font-mono text-xs uppercase tracking-wider text-[#D8D5C4]">
                {area}
              </Text>
            )}
          </View>

          {/* Menu */}
          <View className="flex-1 px-3 pt-5">
            <Text className="mb-3 px-2 font-mono text-xs uppercase tracking-wider text-gray">
              Your store
            </Text>
            {ITEMS.map(({ key, label, Icon }) => {
              const on = key === active;
              return (
                <Pressable
                  key={key}
                  // Only the store profile screen exists so far; the other items just close the menu.
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  className={`mb-1.5 h-14 flex-row items-center rounded-ctl border-2 px-4 ${
                    on ? "border-ink bg-signal" : "border-transparent"
                  }`}
                >
                  <Icon size={24} color="#0E0E0C" strokeWidth={2.4} />
                  <Text className="ml-4 font-body-black text-[19px] text-ink">
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Footer */}
          <View
            className="border-t-2 border-ink px-4 pt-4"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Pressable
              onPress={onLogout}
              disabled={signingOut}
              accessibilityRole="button"
              className="h-[58px] flex-row items-center justify-center rounded-ctl border-2 border-ink"
            >
              <LogOut size={22} color="#0E0E0C" strokeWidth={2.4} />
              <Text className="ml-3 font-body-black text-lg text-ink">
                {signingOut ? "Logging out..." : "Log out"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Scrim: tapping outside the drawer closes it */}
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          className="flex-1 bg-black/60"
        />
      </View>
    </Modal>
  );
}
