import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUsuario } from "../types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: AuthUsuario | null;
  setAuth: (accessToken: string, refreshToken: string, usuario: AuthUsuario) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,
      setAuth: (accessToken, refreshToken, usuario) =>
        set({ accessToken, refreshToken, usuario }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ accessToken: null, refreshToken: null, usuario: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
