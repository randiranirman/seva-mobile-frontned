import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import { BrandRow } from "../../components/BrandRow";
import { SideDrawer } from "../../components/SideDrawer";
import { Menu } from "lucide-react-native";
import { useAuthStatus } from "../../hooks/useAuthStatus";
import { formatLocalPhone } from "../../utils/phone";
import { getOwnerStore, type Store } from "../../../service/StoreService";
import { getClaims, getUserId } from "../../../service/tokenClaims";

export default function StoreDetails() {
  const status = useAuthStatus();
  const [store, setStore] = useState<Store | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const claims = await getClaims();
      if (!claims?.isOwner) {
        // No store yet: send them to setup.
        router.replace("/welcome");
        return;
      }
      const ownerId = getUserId(claims);
      if (!ownerId) throw new Error("Your login has no user id. Please log in again.");
      setStore(await getOwnerStore(ownerId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "signedIn") load();
  }, [status, load]);

  if (status === "checking") return <View className="flex-1 bg-ink" />;
  if (status === "signedOut") return <Redirect href="/login" />;

  const rows = store
    ? [
        { label: "Address", value: store.address },
        { label: "Area", value: store.area },
        { label: "Owner name", value: store.ownerName },
        { label: "Owner contact", value: formatLocalPhone(store.ownerContactNumber) },
      ]
    : [];

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <ScrollView contentContainerClassName="flex-grow px-5 pt-5 pb-5">
        <View className="flex-row items-center justify-between">
          <BrandRow showTag={false} />
          <Pressable
            onPress={() => setMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            className="h-11 w-11 items-center justify-center rounded-ctl border-2 border-hold"
          >
            <Menu size={22} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        </View>

        <Text className="mt-10 font-mono-bold text-sm uppercase tracking-wider text-signal">
          Your store
        </Text>
        <Text className="mt-3 font-display uppercase text-[52px] leading-[52px] text-white">
          Store details
        </Text>

        {loading && (
          <View className="mt-10 items-center" accessibilityLabel="Loading store">
            <ActivityIndicator size="large" color="#FFC20E" />
          </View>
        )}

        {error && (
          <View className="mt-8">
            <Text
              accessibilityLiveRegion="polite"
              className="font-mono text-xs uppercase tracking-wider text-signal"
            >
              {error}
            </Text>
            <Pressable
              onPress={load}
              accessibilityRole="button"
              className="mt-4 h-[54px] items-center justify-center rounded-ctl border-2 border-hold"
            >
              <Text className="font-body-black text-lg text-white">Try again</Text>
            </Pressable>
          </View>
        )}

        {store && (
          <View className="mt-8 border-t-2 border-signal">
            {rows.map((r) => (
              <View key={r.label} className="border-b-[1.5px] border-ink-soft py-4">
                <Text className="font-mono text-xs uppercase tracking-wider text-[#D8D5C4]">
                  {r.label}
                </Text>
                <Text className="mt-1 font-body-black text-[20px] text-white">
                  {r.value}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <SideDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        active="profile"
        storeName={store?.storeName}
        area={store?.area}
      />
    </SafeAreaView>
  );
}
