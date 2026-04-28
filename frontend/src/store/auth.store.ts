import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  id_rol: number;
  activo: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: AuthUser | null;
  setAuth: (accessToken: string, refreshToken: string, usuario: AuthUser) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,

      setAuth: (accessToken, refreshToken, usuario) =>
        set({ accessToken, refreshToken, usuario }),

      setAccessToken: (token) =>
        set({ accessToken: token }),

      logout: () =>
        set({ accessToken: null, refreshToken: null, usuario: null }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "auth-storage",
    }
  )
);