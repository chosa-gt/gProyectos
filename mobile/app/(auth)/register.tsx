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
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { registro, login } from "@/src/api/auth";
import { useAuthStore } from "@/src/store/auth.store";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async () => {
    if (!nombre.trim() || !apellido.trim() || !correo.trim() || !contrasena.trim() || !confirmar.trim()) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }
    if (contrasena !== confirmar) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (contrasena.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await registro({ nombre: nombre.trim(), apellido: apellido.trim(), correo: correo.trim(), contrasena });
      const { data } = await login(correo.trim(), contrasena);
      setAuth(data.data.accessToken, data.data.refreshToken, data.data.usuario);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message ?? "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 }}>
        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-blue-600">SGP</Text>
          <Text className="text-gray-500 mt-1">Sistema de Gestión de Proyectos</Text>
        </View>

        <View className="bg-white rounded-2xl shadow-sm p-6">
          <View className="flex-row items-center gap-2 mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome name="arrow-left" size={18} color="#6b7280" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-800">Crear cuenta</Text>
          </View>

          <Field label="Nombre" value={nombre} onChange={setNombre} placeholder="Tu nombre" />
          <Field label="Apellido" value={apellido} onChange={setApellido} placeholder="Tu apellido" />
          <Field label="Correo electrónico" value={correo} onChange={setCorreo} placeholder="correo@ejemplo.com" keyboardType="email-address" />
          <Field label="Contraseña" value={contrasena} onChange={setContrasena} placeholder="Mínimo 8 caracteres" secure />
          <Field label="Confirmar contraseña" value={confirmar} onChange={setConfirmar} placeholder="Repite la contraseña" secure last />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="bg-blue-600 rounded-xl py-4 items-center mt-2"
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-semibold text-base">Crear cuenta</Text>
            }
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-gray-500">¿Ya tienes cuenta?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-600 font-semibold">Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType = "default", secure = false, last = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: string; secure?: boolean; last?: boolean;
}) {
  return (
    <View className={last ? "" : "mb-4"}>
      <Text className="text-sm font-medium text-gray-600 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
        placeholder={placeholder}
        keyboardType={keyboardType as any}
        autoCapitalize="none"
        secureTextEntry={secure}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}
