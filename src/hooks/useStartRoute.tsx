import { createContext, useContext, useEffect, useState } from "react";
import { getStartRoute } from "../../service/tokenClaims";

export type StartRoute = "/login" | "/store" | "/welcome";

export const StartRouteContext = createContext<StartRoute>("/login");
export const useStartRoute = () => useContext(StartRouteContext);

/** Works out, once at launch, which screen the app should open on. null while checking. */
export function useResolveStartRoute(): StartRoute | null {
  const [route, setRoute] = useState<StartRoute | null>(null);

  useEffect(() => {
    let active = true;
    getStartRoute()
      .catch((): StartRoute => "/login")
      .then((r) => {
        if (active) setRoute(r);
      });
    return () => {
      active = false;
    };
  }, []);

  return route;
}
