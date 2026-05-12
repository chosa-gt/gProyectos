import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";

export default function AuthLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);

  // Si ya tiene sesión, redirigir al área protegida
  if (accessToken) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
