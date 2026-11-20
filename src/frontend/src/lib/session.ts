import type { AdminSession, ClientView } from "@/backend";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  client: ClientView | null;
  admin: AdminSession | null;
  setClient: (client: ClientView | null) => void;
  setAdmin: (admin: AdminSession | null) => void;
  signOutClient: () => void;
  signOutAdmin: () => void;
};

/**
 * Signed-in client and administrator session token. Backend records stay in
 * React Query; this store only remembers who is signed in on this device.
 */
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      client: null,
      admin: null,
      setClient: (client) => set({ client }),
      setAdmin: (admin) => set({ admin }),
      signOutClient: () => set({ client: null }),
      signOutAdmin: () => set({ admin: null }),
    }),
    {
      name: "cajigalnet-session",
      partialize: (state) => ({ client: state.client, admin: state.admin }),
    },
  ),
);

export function isAdminSessionValid(admin: AdminSession | null): boolean {
  if (!admin) return false;
  const expiresMs = Number(admin.expiresAt / 1_000_000n);
  return Number.isFinite(expiresMs) && expiresMs > Date.now();
}
