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
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { BrandRow } from "../../components/BrandRow";
import { verifyEmail } from "../../../service/AuthService";

const CODE_LENGTH = 6;

export default function Verify() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = code.length === CODE_LENGTH && !loading && !!email;

  const onVerify = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setMessage(null);
    try {
      await verifyEmail(email, code);
      router.replace({ pathname: "/login", params: { mode: "login", email } });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          contentContainerClassName="flex-grow px-5 pt-5 pb-5"
          keyboardShouldPersistTaps="handled"
        >
          <BrandRow />

          <Text className="mt-8 font-display uppercase text-[40px] leading-[40px] text-white">
            Enter your code
          </Text>
          <Text className="mt-4 font-body text-base text-[#D8D5C4]">
            We sent a {CODE_LENGTH}-digit code to {email}.
          </Text>

          <Text className="mt-8 font-mono text-xs uppercase tracking-wider text-[#D8D5C4]">
            {CODE_LENGTH}-digit code from email
          </Text>
          <TextInput
            className="mt-3 h-[58px] rounded-ctl border-2 border-hold bg-[#171715] px-4 font-mono-bold text-[24px] tracking-[8px] text-white"
            value={code}
            onChangeText={(v) =>
              setCode(v.replace(/\D/g, "").slice(0, CODE_LENGTH))
            }
            placeholder="······"
            placeholderTextColor="#8A8777"
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            autoFocus
            accessibilityLabel="Verification code"
          />

          <View className="min-h-6 flex-1" />

          {message && (
            <Text
              accessibilityLiveRegion="polite"
              className="mb-3 font-mono text-xs uppercase tracking-wider text-signal"
            >
              {message}
            </Text>
          )}

          <View className="flex-row">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              className="mr-3 h-[58px] w-[58px] items-center justify-center rounded-ctl border-2 border-hold"
            >
              <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>
            <Pressable
              disabled={!canSubmit}
              onPress={onVerify}
              accessibilityRole="button"
              className={`h-[58px] flex-1 items-center justify-center rounded-ctl border-2 ${
                canSubmit
                  ? "border-signal bg-signal"
                  : "border-hold bg-muted-fill"
              }`}
            >
              <Text
                className={`font-body-black text-lg ${
                  canSubmit ? "text-ink" : "text-gray"
                }`}
              >
                {loading ? "Verifying..." : "Verify"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
