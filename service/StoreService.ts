import { api, toApiError } from "./api";
import { saveTokens } from "./tokenStorage";

export type CreateStoreInput = {
  storeName: string;
  address: string;
  area: string;
  ownerName: string;
  ownerContactNumber: string;
  businessRegistrationNumber: string;
};

export type Store = CreateStoreInput & {
  id: string;
  latitude: number;
  longitude: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

type StoreCreationResponse = {
  store: Store;
  tokens: { accessToken: string; refreshToken: string; tokenType: string };
};

// Temporary: the app has no map or location picker yet, so the backend gets fixed coordinates.
const PLACEHOLDER_COORDS = { latitude: 12, longitude: 23 } as const;

/** The store that belongs to this owner. Uses the latest stored access token via the api interceptor. */
export async function getOwnerStore(ownerId: string): Promise<Store> {
  try {
    const { data } = await api.get<Store | Store[]>(
      `/api/stores/owner/${encodeURIComponent(ownerId)}`,
    );
    const store = Array.isArray(data) ? data[0] : data;
    if (!store) throw new Error("No store found for this owner.");
    return store;
  } catch (e) {
    throw toApiError(e, "Could not load your store");
  }
}

export async function createStore(input: CreateStoreInput): Promise<Store> {
  try {
    const { data } = await api.post<StoreCreationResponse>("/api/stores", {
      ...input,
      ...PLACEHOLDER_COORDS,
    });
    // The old access token still says isOwner: false. Swap in the new pair
    // (isOwner: true) so later requests use it without a re-login.
    await saveTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return data.store;
  } catch (e) {
    throw toApiError(e, "Could not create store");
  }
}
