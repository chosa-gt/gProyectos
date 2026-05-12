import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, Redirect } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { crearUsuario } from "@/src/api/usuarios";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function NuevoUsuarioScreen() {
  const authUsuario = useAuthStore((s) => s.usuario);
  if (authUsuario?.id_rol !== 1) return <Redirect href="/(app)/(tabs)/dashboard" />;

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [idRol, setIdRol] = useState(2);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nombre.trim() || !apellido.trim() || !correo.trim() || !contrasena.trim() || !confirmar.trim()) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }
    if (contrasena !== confirmar) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    setSaving(true);
    try {
      await crearUsuario({ nombre, apellido, correo, contrasena, id_rol: idRol });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message ?? "No se pudo crear.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 pt-14 pb-4 px-5 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Nuevo usuario</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-5">
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 gap-4">
          <LabelInput label="Nombre *" value={nombre} onChange={setNombre} placeholder="Nombre" />
          <LabelInput label="Apellido *" value={apellido} onChange={setApellido} placeholder="Apellido" />
          <LabelInput label="Correo *" value={correo} onChange={setCorreo} placeholder="correo@ejemplo.com" keyboardType="email-address" />
          <LabelInput label="Contraseña *" value={contrasena} onChange={setContrasena} placeholder="Mínimo 8 caracteres" secure />
          <LabelInput label="Confirmar contraseña *" value={confirmar} onChange={setConfirmar} placeholder="Repite la contraseña" secure />

          <View>
            <Text className="text-xs font-medium text-gray-500 mb-2">Rol *</Text>
            <View className="flex-row gap-2">
              {[{ id: 1, label: "Administrador" }, { id: 2, label: "Usuario" }].map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setIdRol(r.id)}
                  className={`flex-1 py-2 rounded-xl border items-center ${idRol === r.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <Text className={idRol === r.id ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm"}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="bg-blue-600 rounded-xl py-3.5 items-center mt-2"
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Crear usuario</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function LabelInput({ label, value, onChange, placeholder, keyboardType = "default", secure = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; keyboardType?: string; secure?: boolean;
}) {
  return (
    <View>
      <Text className="text-xs font-medium text-gray-500 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 bg-gray-50"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType as any}
        secureTextEntry={secure}
        autoCapitalize="none"
      />
    </View>
  );
}
