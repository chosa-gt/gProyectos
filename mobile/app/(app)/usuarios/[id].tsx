import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router, Redirect } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { getUsuario, actualizarUsuario, toggleActivo } from "@/src/api/usuarios";
import type { Usuario } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function UsuarioDetalleScreen() {
  const authUsuario = useAuthStore((s) => s.usuario);
  if (authUsuario?.id_rol !== 1) return <Redirect href="/(app)/(tabs)/dashboard" />;

  const { id } = useLocalSearchParams<{ id: string }>();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [idRol, setIdRol] = useState(0);

  const load = async () => {
    try {
      const { data } = await getUsuario(Number(id));
      const u = data.data;
      setUsuario(u);
      setNombre(u.nombre ?? "");
      setApellido(u.apellido ?? "");
      setCorreo(u.correo ?? "");
      setIdRol(u.id_rol);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await actualizarUsuario(Number(id), { nombre, apellido, correo, id_rol: idRol });
      setEditing(false);
      load();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message ?? "No se pudo actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = () => {
    if (!usuario) return;
    const action = usuario.activo ? "desactivar" : "activar";
    Alert.alert(`¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`, "", [
      { text: "Cancelar", style: "cancel" },
      {
        text: action.charAt(0).toUpperCase() + action.slice(1),
        onPress: async () => {
          await toggleActivo(Number(id));
          load();
        },
      },
    ]);
  };

  if (loading) {
    return <View className="flex-1 bg-gray-50 items-center justify-center"><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (!usuario) {
    return <View className="flex-1 bg-gray-50 items-center justify-center"><Text>Usuario no encontrado</Text></View>;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 pt-14 pb-4 px-5 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">
          {usuario.nombre} {usuario.apellido}
        </Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <FontAwesome name={editing ? "times" : "pencil"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-5">
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 gap-4">
          {editing ? (
            <>
              <LabelInput label="Nombre" value={nombre} onChange={setNombre} />
              <LabelInput label="Apellido" value={apellido} onChange={setApellido} />
              <LabelInput label="Correo" value={correo} onChange={setCorreo} keyboardType="email-address" />

              <View>
                <Text className="text-xs font-medium text-gray-500 mb-2">Rol</Text>
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
                {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Guardar cambios</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <InfoRow label="Nombre" value={`${usuario.nombre} ${usuario.apellido}`} />
              <InfoRow label="Correo" value={usuario.correo} />
              <InfoRow label="Rol" value={usuario.rol?.nombre} />
              <View>
                <Text className="text-xs font-medium text-gray-400">Estado</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <View className={`px-2 py-0.5 rounded-full ${usuario.activo ? "bg-green-100" : "bg-gray-100"}`}>
                    <Text className={`text-sm font-medium ${usuario.activo ? "text-green-700" : "text-gray-500"}`}>
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleToggle} className="px-3 py-1 rounded-xl bg-gray-100">
                    <Text className="text-gray-600 text-sm">{usuario.activo ? "Desactivar" : "Activar"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View>
      <Text className="text-xs font-medium text-gray-400">{label}</Text>
      <Text className="text-gray-800 mt-0.5">{value || "—"}</Text>
    </View>
  );
}

function LabelInput({ label, value, onChange, keyboardType = "default" }: {
  label: string; value: string; onChange: (v: string) => void; keyboardType?: string;
}) {
  return (
    <View>
      <Text className="text-xs font-medium text-gray-500 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 bg-gray-50"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType as any}
        autoCapitalize="none"
      />
    </View>
  );
}
