import { Redirect } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";

export default function Index() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return (
    <Redirect href={accessToken ? "/(app)/(tabs)/dashboard" : "/(auth)/login"} />
  );
}
