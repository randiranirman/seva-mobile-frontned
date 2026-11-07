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
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { BrandRow } from "../../components/BrandRow";
import { useAuthStatus } from "../../hooks/useAuthStatus";
import { formatMobile } from "../../utils/phone";
import { createStore } from "../../../service/StoreService";

type FieldKey =
  | "storeName"
  | "address"
  | "area"
  | "ownerName"
  | "ownerContactNumber"
  | "businessRegistrationNumber";

type Step = {
  key: FieldKey;
  label: string;
  title: string;
  placeholder: string;
  phone?: boolean;
  capitalize?: "words" | "characters" | "sentences";
};

const STEPS: Step[] = [
  {
    key: "storeName",
    label: "Store name",
    title: "What is your store called?",
    placeholder: "Store name",
    capitalize: "words",
  },
  {
    key: "address",
    label: "Address",
    title: "Where is it?",
    placeholder: "Street address",
    capitalize: "words",
  },
  {
    key: "area",
    label: "Area",
    title: "Which area?",
    placeholder: "Town or area",
    capitalize: "words",
  },
  {
    key: "ownerName",
    label: "Owner name",
    title: "Who is the owner?",
    placeholder: "Owner full name",
    capitalize: "words",
  },
  {
    key: "ownerContactNumber",
    label: "Owner contact number",
    title: "Owner phone number",
    placeholder: "77 123 4567",
    phone: true,
  },
  {
    key: "businessRegistrationNumber",
    label: "Business registration number",
    title: "Business registration",
    placeholder: "e.g. PV/00123456",
    capitalize: "characters",
  },
];

type Values = Record<FieldKey, string>;

export default function CreateStore() {
  const status = useAuthStatus();
  const params = useLocalSearchParams<{ ownerName?: string }>();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({
    storeName: "",
    address: "",
    area: "",
    ownerName: params.ownerName ?? "",
    ownerContactNumber: "",
    businessRegistrationNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);

  if (status === "checking") return <View className="flex-1 bg-ink" />;
  if (status === "signedOut") return <Redirect href="/login" />;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isValid = (s: Step) =>
    s.phone
      ? values[s.key].replace(/\D/g, "").length === 9
      : values[s.key].trim().length > 0;
  const canContinue = isValid(current) && !loading;

  const setValue = (key: FieldKey, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const store = await createStore({
        storeName: values.storeName.trim(),
        address: values.address.trim(),
        area: values.area.trim(),
        ownerName: values.ownerName.trim(),
        // Backend expects local format, e.g. 0740031801
        ownerContactNumber: `0${values.ownerContactNumber.replace(/\D/g, "")}`,
        businessRegistrationNumber: values.businessRegistrationNumber.trim(),
      });
      setCreatedName(store.storeName);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onNext = () => {
    if (!canContinue) return;
    setMessage(null);
    if (isLast) submit();
    else setStep(step + 1);
  };

  const onBack = () => {
    setMessage(null);
    if (step === 0) router.back();
    else setStep(step - 1);
  };

  if (createdName) {
    return (
      <SafeAreaView className="flex-1 bg-ink">
        <View className="flex-1 px-5 pt-5 pb-5">
          <BrandRow showTag={false} />
          <Text className="mt-10 font-mono-bold text-sm uppercase tracking-wider text-signal">
            Store created
          </Text>
          <Text className="mt-3 font-display uppercase text-[52px] leading-[52px] text-white">
            {createdName} is live
          </Text>
          <Text className="mt-5 font-body text-[18px] leading-[26px] text-[#D8D5C4]">
            Customers can now find you by name.
          </Text>
          <View className="min-h-6 flex-1" />
          <Pressable
            onPress={() => router.replace("/store")}
            accessibilityRole="button"
            className="h-[58px] items-center justify-center rounded-ctl border-2 border-signal bg-signal"
          >
            <Text className="font-body-black text-lg text-ink">View my store</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          contentContainerClassName="flex-grow px-5 pt-5 pb-5"
          keyboardShouldPersistTaps="handled"
        >
          <BrandRow showTag={false} />

          <Text className="mt-8 font-display uppercase text-[40px] leading-[40px] text-white">
            {current.title}
          </Text>

          {/* Step indicator: filled = done, signal = now, outline = todo */}
          <View className="mt-8 flex-row items-center">
            <Text className="mr-3 font-mono text-xs uppercase tracking-wider text-[#D8D5C4]">
              Step {step + 1} of {STEPS.length}
            </Text>
            {STEPS.map((s, i) => (
              <View
                key={s.key}
                className={`mr-1.5 h-2 flex-1 rounded-sm border-2 ${
                  i < step
                    ? "border-white bg-white"
                    : i === step
                      ? "border-signal bg-signal"
                      : "border-hold bg-transparent"
                }`}
              />
            ))}
          </View>

          <Text className="mt-5 font-mono text-xs uppercase tracking-wider text-[#D8D5C4]">
            {current.label}
          </Text>

          {current.phone ? (
            <View className="mt-3 flex-row">
              <View className="h-[58px] w-[60px] items-center justify-center rounded-ctl bg-ink-soft">
                <Text className="font-mono-bold text-base text-white">+94</Text>
              </View>
              <TextInput
                key={current.key}
                className="ml-2 h-[58px] flex-1 rounded-ctl border-2 border-hold bg-[#171715] px-4 font-mono-bold text-[20px] text-white"
                value={formatMobile(values[current.key])}
                onChangeText={(v) => setValue(current.key, v)}
                placeholder={current.placeholder}
                placeholderTextColor="#8A8777"
                keyboardType="number-pad"
                maxLength={11}
                autoFocus
                accessibilityLabel={current.label}
              />
            </View>
          ) : (
            <TextInput
              key={current.key}
              className="mt-3 h-[58px] rounded-ctl border-2 border-hold bg-[#171715] px-4 font-body-bold text-[17px] text-white"
              value={values[current.key]}
              onChangeText={(v) => setValue(current.key, v)}
              placeholder={current.placeholder}
              placeholderTextColor="#8A8777"
              autoCapitalize={current.capitalize}
              autoCorrect={false}
              returnKeyType={isLast ? "done" : "next"}
              onSubmitEditing={onNext}
              autoFocus
              accessibilityLabel={current.label}
            />
          )}

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
              onPress={onBack}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Back"
              className="mr-3 h-[58px] w-[58px] items-center justify-center rounded-ctl border-2 border-hold"
            >
              <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>
            <Pressable
              disabled={!canContinue}
              onPress={onNext}
              accessibilityRole="button"
              className={`h-[58px] flex-1 items-center justify-center rounded-ctl border-2 ${
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
                {loading ? "Creating..." : isLast ? "Create store" : "Continue"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
