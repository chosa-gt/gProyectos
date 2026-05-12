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
import { getProyectos, eliminarProyecto } from "@/src/api/proyectos";
import type { Proyecto } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const ESTADO_COLOR: Record<string, { bg: string; text: string }> = {
  "Planificación": { bg: "#ede9fe", text: "#7c3aed" },
  "En progreso":   { bg: "#dbeafe", text: "#2563eb" },
  "Finalizado":    { bg: "#dcfce7", text: "#16a34a" },
  "Cancelado":     { bg: "#fee2e2", text: "#dc2626" },
  "Pausado":       { bg: "#fef9c3", text: "#a16207" },
};

export default function ProyectosScreen() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (p = 1, q = search) => {
    try {
      const { data } = await getProyectos(p, q);
      if (p === 1) {
        setProyectos(data.data);
      } else {
        setProyectos((prev) => [...prev, ...data.data]);
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
    Alert.alert("Eliminar proyecto", `¿Eliminar "${nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await eliminarProyecto(id);
          load(1, search);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Proyecto }) => {
    const estado = item.estado_proyecto?.estado ?? "";
    const colors = ESTADO_COLOR[estado] ?? { bg: "#f3f4f6", text: "#6b7280" };
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(app)/proyectos/${item.id_proyecto}`)}
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="font-semibold text-gray-800 text-base">{item.nombre}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{item.cliente?.nombre}</Text>
            <Text className="text-gray-500 text-xs mt-1">
              {item.fecha_inicio} {item.fecha_fin ? `→ ${item.fecha_fin}` : ""}
            </Text>
          </View>
          <View className="items-end gap-2">
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.bg }}>
              <Text className="text-xs font-medium" style={{ color: colors.text }}>{estado}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id_proyecto, item.nombre ?? "")}>
              <FontAwesome name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 pt-14 pb-4 px-5">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">Proyectos</Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)/proyectos/nuevo")}
            className="bg-white/20 rounded-xl px-4 py-2"
          >
            <Text className="text-white text-sm font-medium">+ Nuevo</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          className="bg-white/20 rounded-xl px-4 py-2.5 text-white mt-3"
          placeholder="Buscar proyectos..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={proyectos}
          keyExtractor={(item) => String(item.id_proyecto)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={() => { if (proyectos.length < total) load(page + 1, search); }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View className="items-center py-16">
              <FontAwesome name="briefcase" size={40} color="#d1d5db" />
              <Text className="text-gray-400 mt-3">No hay proyectos</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
