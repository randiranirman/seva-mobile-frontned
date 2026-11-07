import { Redirect } from "expo-router";
import { useStartRoute } from "../hooks/useStartRoute";

// The root layout already worked out the destination while the splash screen was showing,
// so this redirects instantly and nothing is drawn.
export default function Index() {
  return <Redirect href={useStartRoute()} />;
}
