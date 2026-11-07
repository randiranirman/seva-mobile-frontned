import { Redirect } from "expo-router";
import { useAuthStatus } from "../hooks/useAuthStatus";

// Entry gate: signed-in owners go straight in, everyone else sees login/register.
export default function Index() {
  const status = useAuthStatus();
  if (status === "checking") return null; // splash screen is still covering the app
  return <Redirect href={status === "signedIn" ? "/welcome" : "/login"} />;
}
