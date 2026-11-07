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
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { BrandRow } from "../../components/BrandRow";
import { formatMobile } from "../../utils/phone";
import { registerUser } from "../../../service/RegisterService";
import { login } from "../../../service/AuthService";
import { getHomeRoute } from "../../../service/tokenClaims";

type Mode = "register" | "login";

const STEPS = ["Mobile number", "Email", "Password"] as const;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const inputClass =
  "h-[58px] rounded-ctl border-2 border-hold bg-[#171715] px-4 text-white";
const labelClass =
  "font-mono text-xs uppercase tracking-wider text-[#D8D5C4]";

export default function OwnerAuth() {
  const params = useLocalSearchParams<{ mode?: string; email?: string }>();
  const [mode, setMode] = useState<Mode>(
    params.mode === "login" ? "login" : "register",
  );
  const [step, setStep] = useState(0);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState(params.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isLogin = mode === "login";
  const mobileDigits = mobile.replace(/\D/g, "");
  const emailOk = EMAIL_RE.test(email.trim());
  const passwordOk = password.length >= 8;

  const isLast = isLogin || step === STEPS.length - 1;
  const canContinue =
    !loading &&
    (isLogin
      ? emailOk && password.length > 0
      : [mobileDigits.length === 9, emailOk, passwordOk][step]);

  const switchMode = (next: Mode) => {
    if (next === mode || loading) return;
    setMode(next);
    setStep(0);
    setMessage(null);
  };

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (isLogin) {
        await login(email.trim(), password);
        // The new access token says whether this user already owns a store.
        router.replace(await getHomeRoute());
      } else {
        await registerUser({
          email: email.trim(),
          password,
          // Backend expects local format, e.g. 0772355023
          mobileNumber: `0${mobileDigits}`,
        });
        router.push({
          pathname: "/verify",
          params: { email: email.trim() },
        });
      }
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
    setStep(step - 1);
  };

  const passwordField = (
    <View className="mt-3 flex-row">
      <TextInput
        className={`flex-1 font-body-bold text-[17px] ${inputClass}`}
        value={password}
        onChangeText={setPassword}
        placeholder={isLogin ? "Your password" : "At least 8 characters"}
        placeholderTextColor="#8A8777"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={onNext}
        autoFocus={!isLogin}
        accessibilityLabel="Password"
      />
      <Pressable
        onPress={() => setShowPassword((s) => !s)}
        accessibilityRole="button"
        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        className="ml-2 h-[58px] w-[58px] items-center justify-center rounded-ctl border-2 border-hold"
      >
        {showPassword ? (
          <EyeOff size={22} color="#FFFFFF" strokeWidth={2.4} />
        ) : (
          <Eye size={22} color="#FFFFFF" strokeWidth={2.4} />
        )}
      </Pressable>
    </View>
  );

  const emailField = (autoFocus: boolean) => (
    <TextInput
      className={`mt-3 font-body-bold text-[17px] ${inputClass}`}
      value={email}
      onChangeText={setEmail}
      placeholder="you@example.com"
      placeholderTextColor="#8A8777"
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="email"
      returnKeyType="next"
      onSubmitEditing={isLogin ? undefined : onNext}
      autoFocus={autoFocus}
      accessibilityLabel="Email"
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          contentContainerClassName="flex-grow px-5 pt-5 pb-5"
          keyboardShouldPersistTaps="handled"
        >
          <BrandRow />

          {/* Mode switch: selected = yellow fill + label, so not color alone */}
          <View className="mt-6 flex-row">
            {(["register", "login"] as const).map((m) => {
              const on = mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => switchMode(m)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  className={`mr-2 h-11 items-center justify-center rounded-chip border-2 px-5 ${
                    on ? "border-signal bg-signal" : "border-hold"
                  }`}
                >
                  <Text
                    className={`font-mono-bold text-xs uppercase tracking-wider ${
                      on ? "text-ink" : "text-white"
                    }`}
                  >
                    {m === "register" ? "Register" : "Log in"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Headline: full size only on the first register step, so the keyboard has room */}
          {!isLogin && step === 0 ? (
            <>
              <Text className="mt-8 font-display uppercase text-[52px] leading-[52px] text-white">
                Run your bay from your phone
              </Text>
              <Text className="mt-5 font-body text-base text-[#D8D5C4]">
                Take bookings, check cars in, and text customers at every step.
              </Text>
            </>
          ) : (
            <Text className="mt-8 font-display uppercase text-[40px] leading-[40px] text-white">
              {isLogin
                ? "Welcome back"
                : step === 1
                  ? "Where do we send your code?"
                  : "Set a password"}
            </Text>
          )}

          {isLogin ? (
            <>
              <Text className={`mt-8 ${labelClass}`}>Email</Text>
              {emailField(!params.email)}
              <Text className={`mt-5 ${labelClass}`}>Password</Text>
              {passwordField}
            </>
          ) : (
            <>
              {/* Step indicator: filled = done, signal = now, outline = todo */}
              <View className="mt-8 flex-row items-center">
                <Text className={`mr-3 ${labelClass}`}>
                  Step {step + 1} of {STEPS.length}
                </Text>
                {STEPS.map((name, i) => (
                  <View
                    key={name}
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

              <Text className={`mt-5 ${labelClass}`}>{STEPS[step]}</Text>

              {step === 0 && (
                <View className="mt-3 flex-row">
                  <View className="h-[58px] w-[60px] items-center justify-center rounded-ctl bg-ink-soft">
                    <Text className="font-mono-bold text-base text-white">
                      +94
                    </Text>
                  </View>
                  <TextInput
                    className={`ml-2 flex-1 font-mono-bold text-[20px] ${inputClass}`}
                    value={formatMobile(mobile)}
                    onChangeText={setMobile}
                    placeholder="77 123 4567"
                    placeholderTextColor="#8A8777"
                    keyboardType="number-pad"
                    maxLength={11}
                    autoFocus
                    accessibilityLabel="Mobile number"
                  />
                </View>
              )}
              {step === 1 && emailField(true)}
              {step === 2 && passwordField}
            </>
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

          {/* Footer */}
          <View className="flex-row">
            {!isLogin && step > 0 && (
              <Pressable
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Back"
                className="mr-3 h-[58px] w-[58px] items-center justify-center rounded-ctl border-2 border-hold"
              >
                <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            )}
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
                {loading
                  ? isLogin
                    ? "Logging in..."
                    : "Registering..."
                  : isLogin
                    ? "Log in"
                    : isLast
                      ? "Register"
                      : "Continue"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
