import { useEffect, useState } from "react";
import { getAccessToken, getRefreshToken } from "../../service/tokenStorage";

export type AuthStatus = "checking" | "signedIn" | "signedOut";

/**
 * Reads the stored tokens once on mount.
 * A refresh token counts as signed in: the access token only lives 15 minutes,
 * and the refresh flow (not built yet) will renew it.
 */
export function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [access, refresh] = await Promise.all([
          getAccessToken(),
          getRefreshToken(),
        ]);
        if (active) setStatus(access || refresh ? "signedIn" : "signedOut");
      } catch {
        if (active) setStatus("signedOut");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return status;
}
