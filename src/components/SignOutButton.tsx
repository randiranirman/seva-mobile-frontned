import { useState } from "react";
import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import { LogOut } from "lucide-react-native";
import { logout } from "../../service/AuthService";

export function SignOutButton() {
  const [signingOut, setSigningOut] = useState(false);

  const onPress = async () => {
    setSigningOut(true);
    await logout();
    router.replace("/login");
  };

  return (
    <Pressable
      onPress={onPress}
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
  );
}
