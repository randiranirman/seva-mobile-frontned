import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import { LogOut } from "lucide-react-native";
import { logout } from "../../../service/AuthService";
import { BrandRow } from "../../components/BrandRow";
import { useAuthStatus } from "../../hooks/useAuthStatus";

const NEXT_STEPS = [
  { title: "Store details", sub: "Name, area, address and phone" },
  { title: "Hours and capacity", sub: "Opening hours and vehicles per slot" },
  { title: "Services", sub: "What your center offers" },
] as const;

export default function Welcome() {
  const status = useAuthStatus();
  const [name, setName] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const trimmed = name.trim();
  const firstName = trimmed.split(/\s+/)[0] ?? "";
  const canContinue = trimmed.length > 0;

  const onSignOut = async () => {
    setSigningOut(true);
    await logout();
    router.replace("/login");
  };

  const onSetup = () => {
    if (!canContinue) return;
    // TODO: the create-store wizard is not built yet; navigate there once it exists.
  };

  if (status === "checking") return <View className="flex-1 bg-ink" />;
  if (status === "signedOut") return <Redirect href="/login" />;

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          contentContainerClassName="flex-grow px-5 pt-5 pb-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center justify-between">
            <BrandRow showTag={false} />
            <Pressable
              onPress={onSignOut}
              disabled={signingOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              className="h-11 flex-row items-center rounded-chip border-2 border-hold px-3"
            >
              <LogOut size={18} color="#FFFFFF" strokeWidth={2.4} />
              <Text className="ml-2 font-mono-bold text-xs uppercase tracking-wider text-white">
                {signingOut ? "Signing out" : "Sign out"}
              </Text>
            </Pressable>
          </View>

          <Text className="mt-10 font-mono-bold text-sm uppercase tracking-wider text-signal">
            Logged in · First time
          </Text>
          <Text className="mt-3 font-display uppercase text-[64px] leading-[60px] text-white">
            {firstName ? `Welcome, ${firstName}` : "Welcome"}
          </Text>
          <Text className="mt-5 font-body text-[18px] leading-[26px] text-[#D8D5C4]">
            Set up your store in three short steps. Customers can find you by
            name the moment you publish.
          </Text>

          <Text className="mt-8 font-mono text-xs uppercase tracking-wider text-[#D8D5C4]">
            Your name
          </Text>
          <TextInput
            className="mt-3 h-[58px] rounded-ctl border-2 border-hold bg-[#171715] px-4 font-body-bold text-[20px] text-white"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor="#8A8777"
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="done"
            onSubmitEditing={onSetup}
            accessibilityLabel="Your name"
          />

          <Text className="mt-8 font-mono text-xs uppercase tracking-wider text-[#D8D5C4]">
            What happens next
          </Text>
          <View className="mt-3 border-t-2 border-signal">
            {NEXT_STEPS.map((s, i) => (
              <View
                key={s.title}
                className="flex-row items-center border-b-[1.5px] border-ink-soft py-4"
              >
                <View className="h-11 w-11 items-center justify-center rounded-chip border-2 border-hold">
                  <Text className="font-mono-bold text-lg text-signal">
                    {i + 1}
                  </Text>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="font-body-black text-[20px] text-white">
                    {s.title}
                  </Text>
                  <Text className="mt-0.5 font-body text-base text-[#D8D5C4]">
                    {s.sub}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="min-h-6 flex-1" />

          <Pressable
            disabled={!canContinue}
            onPress={onSetup}
            accessibilityRole="button"
            className={`h-[58px] items-center justify-center rounded-ctl border-2 ${
              canContinue
                ? "border-signal bg-signal"
                : "border-hold bg-muted-fill"
            }`}
          >
            <Text
              className={`font-body-black text-lg ${
                canContinue ? "text-ink" : "text-gray"
              }`}
            >
              Set up my store
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
