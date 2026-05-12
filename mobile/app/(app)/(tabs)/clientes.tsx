import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { getClientes, eliminarCliente } from "@/src/api/clientes";
import type { Cliente } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const ESTADO_COLOR: Record<string, string> = {
  Activo: "bg-green-100 text-green-700",
  Inactivo: "bg-gray-100 text-gray-500",
  Prospecto: "bg-yellow-100 text-yellow-700",
};

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (p = 1, q = search) => {
    try {
      const { data } = await getClientes(p, q);
      if (p === 1) {
        setClientes(data.data);
      } else {
        setClientes((prev) => [...prev, ...data.data]);
      }
      setTotal(data.meta.total);
      setPage(p);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      load(1, search);
    }, [search])
  );

  const onRefresh = () => { setRefreshing(true); load(1, search); };

  const handleDelete = (id: number, nombre: string) => {
    Alert.alert("Eliminar cliente", `¿Eliminar a ${nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await eliminarCliente(id);
          load(1, search);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Cliente }) => {
    const estado = item.estado_cliente?.estado ?? "";
    const [bg, txt] = (ESTADO_COLOR[estado] ?? "bg-gray-100 text-gray-500").split(" ");
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(app)/clientes/${item.id_cliente}`)}
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="font-semibold text-gray-800 text-base">{item.nombre}</Text>
            <Text className="text-gray-500 text-sm mt-0.5">{item.correo}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{item.empresa?.nombre}</Text>
          </View>
          <View className="items-end gap-2">
            <View className={`px-2 py-0.5 rounded-full ${bg}`}>
              <Text className={`text-xs font-medium ${txt}`}>{estado}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id_cliente, item.nombre ?? "")}>
              <FontAwesome name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-5">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">Clientes</Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)/clientes/nuevo")}
            className="bg-white/20 rounded-xl px-4 py-2"
          >
            <Text className="text-white text-sm font-medium">+ Nuevo</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          className="bg-white/20 rounded-xl px-4 py-2.5 text-white mt-3 placeholder:text-white/60"
          placeholder="Buscar clientes..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={search}
          onChangeText={(t) => setSearch(t)}
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => String(item.id_cliente)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={() => {
            if (clientes.length < total) load(page + 1, search);
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View className="items-center py-16">
              <FontAwesome name="users" size={40} color="#d1d5db" />
              <Text className="text-gray-400 mt-3">No hay clientes</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
