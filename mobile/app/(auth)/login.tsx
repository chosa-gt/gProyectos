import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { login } from "@/src/api/auth";
import { useAuthStore } from "@/src/store/auth.store";

export default function LoginScreen() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!correo.trim() || !contrasena.trim()) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await login(correo.trim(), contrasena);
      setAuth(data.data.accessToken, data.data.refreshToken, data.data.usuario);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? "Credenciales incorrectas."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-blue-600">SGP</Text>
          <Text className="text-gray-500 mt-1">Sistema de Gestión de Proyectos</Text>
        </View>

        <View className="bg-white rounded-2xl shadow-sm p-6">
          <Text className="text-xl font-semibold text-gray-800 mb-6">
            Iniciar sesión
          </Text>

          <Text className="text-sm font-medium text-gray-600 mb-1">
            Correo electrónico
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 mb-4 bg-gray-50"
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />

          <Text className="text-sm font-medium text-gray-600 mb-1">
            Contraseña
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 mb-6 bg-gray-50"
            placeholder="••••••••"
            secureTextEntry
            value={contrasena}
            onChangeText={setContrasena}
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="bg-blue-600 rounded-xl py-4 items-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Iniciar sesión
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
