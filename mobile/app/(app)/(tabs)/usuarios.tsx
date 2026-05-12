import { useState, useCallback } from "react";
import { useFocusEffect, Redirect } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { getUsuarios, toggleActivo } from "@/src/api/usuarios";
import type { Usuario } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function UsuariosScreen() {
  const usuario = useAuthStore((s) => s.usuario);
  if (usuario?.id_rol !== 1) return <Redirect href="/(app)/(tabs)/dashboard" />;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (p = 1) => {
    try {
      const { data } = await getUsuarios(p);
      if (p === 1) {
        setUsuarios(data.data);
      } else {
        setUsuarios((prev) => [...prev, ...data.data]);
      }
      setTotal(data.meta.total);
      setPage(p);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { load(); }, [])
  );

  const onRefresh = () => { setRefreshing(true); load(1); };

  const handleToggle = (usuario: Usuario) => {
    const action = usuario.activo ? "desactivar" : "activar";
    Alert.alert(`¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`, `${usuario.nombre} ${usuario.apellido}`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: action.charAt(0).toUpperCase() + action.slice(1),
        onPress: async () => {
          await toggleActivo(usuario.id_usuario, usuario.activo ?? false);
          load(1);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Usuario }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/usuarios/${item.id_usuario}`)}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
          <Text className="text-blue-600 font-bold text-base">
            {item.nombre?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-800">{item.nombre} {item.apellido}</Text>
          <Text className="text-gray-500 text-xs">{item.correo}</Text>
          <Text className="text-gray-400 text-xs">{item.rol?.nombre}</Text>
        </View>
        <View className="items-end gap-2">
          <View className={`px-2 py-0.5 rounded-full ${item.activo ? "bg-green-100" : "bg-gray-100"}`}>
            <Text className={`text-xs font-medium ${item.activo ? "text-green-700" : "text-gray-500"}`}>
              {item.activo ? "Activo" : "Inactivo"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleToggle(item)}>
            <FontAwesome
              name={item.activo ? "toggle-on" : "toggle-off"}
              size={24}
              color={item.activo ? "#16a34a" : "#9ca3af"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 pt-14 pb-4 px-5">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">Usuarios</Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)/usuarios/nuevo")}
            className="bg-white/20 rounded-xl px-4 py-2"
          >
            <Text className="text-white text-sm font-medium">+ Nuevo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => String(item.id_usuario)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={() => { if (usuarios.length < total) load(page + 1); }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View className="items-center py-16">
              <FontAwesome name="user" size={40} color="#d1d5db" />
              <Text className="text-gray-400 mt-3">No hay usuarios</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
