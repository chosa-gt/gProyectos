import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";

export default function AppLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);

  // Si no tiene sesión, redirigir al login
  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
