import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { getTareas, eliminarTarea } from "@/src/api/tareas";
import { getProyectos } from "@/src/api/proyectos";
import type { Tarea, Proyecto } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type Filtro = "mias" | "todas" | "proyecto";

const PRIORIDAD_COLOR: Record<string, { bg: string; text: string }> = {
  Crítica: { bg: "#fee2e2", text: "#dc2626" },
  Alta:    { bg: "#ffedd5", text: "#ea580c" },
  Media:   { bg: "#dbeafe", text: "#2563eb" },
  Baja:    { bg: "#f3f4f6", text: "#6b7280" },
};

const ESTADO_COLOR: Record<string, { bg: string; text: string }> = {
  Pendiente:     { bg: "#f3f4f6", text: "#6b7280" },
  "En progreso": { bg: "#fef9c3", text: "#a16207" },
  Completada:    { bg: "#dcfce7", text: "#16a34a" },
  Cancelada:     { bg: "#fee2e2", text: "#dc2626" },
};

export default function TareasScreen() {
  const authUsuario = useAuthStore((s) => s.usuario);

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filtro, setFiltro] = useState<Filtro>("mias");
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);
  const [showProyectos, setShowProyectos] = useState(false);

  const buildFilters = (f: Filtro, proy: Proyecto | null) => {
    if (f === "mias")     return { id_usuario: authUsuario?.id_usuario };
    if (f === "proyecto" && proy) return { id_proyecto: proy.id_proyecto };
    return {};
  };

  const load = useCallback(async (p = 1, q = search, f = filtro, proy = proyectoSeleccionado) => {
    try {
      const { data } = await getTareas(p, q, buildFilters(f, proy));
      if (p === 1) setTareas(data.data);
      else setTareas((prev) => [...prev, ...data.data]);
      setTotal(data.meta.total);
      setPage(p);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, filtro, proyectoSeleccionado]);

  useFocusEffect(
    useCallback(() => { load(1, search, filtro, proyectoSeleccionado); }, [search, filtro, proyectoSeleccionado])
  );

  const handleFiltro = (f: Filtro) => {
    if (f === "proyecto") {
      if (proyectos.length === 0) {
        getProyectos(1, "").then(({ data }) => setProyectos(data.data ?? []));
      }
      setShowProyectos(true);
      return;
    }
    setFiltro(f);
    setProyectoSeleccionado(null);
    setLoading(true);
    load(1, search, f, null);
  };

  const handleSeleccionarProyecto = (proy: Proyecto) => {
    setFiltro("proyecto");
    setProyectoSeleccionado(proy);
    setShowProyectos(false);
    setLoading(true);
    load(1, search, "proyecto", proy);
  };

  const onRefresh = () => { setRefreshing(true); load(1, search, filtro, proyectoSeleccionado); };

  const handleDelete = (id: number, nombre: string) => {
    Alert.alert("Eliminar tarea", `¿Eliminar "${nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          await eliminarTarea(id);
          load(1, search, filtro, proyectoSeleccionado);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Tarea }) => {
    const prioridad = item.prioridad?.nombre_prioridad ?? "";
    const estado = item.estado_tarea?.estado ?? "";
    const pc = PRIORIDAD_COLOR[prioridad] ?? { bg: "#f3f4f6", text: "#6b7280" };
    const ec = ESTADO_COLOR[estado] ?? { bg: "#f3f4f6", text: "#6b7280" };
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(app)/tareas/${item.id_tarea}`)}
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="font-semibold text-gray-800">{item.tarea}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{item.proyecto?.nombre}</Text>
            <View className="flex-row gap-2 mt-2">
              <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: pc.bg }}>
                <Text className="text-xs font-medium" style={{ color: pc.text }}>{prioridad}</Text>
              </View>
              <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: ec.bg }}>
                <Text className="text-xs font-medium" style={{ color: ec.text }}>{estado}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id_tarea, item.tarea ?? "")}>
            <FontAwesome name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const chipLabel = filtro === "proyecto" && proyectoSeleccionado
    ? proyectoSeleccionado.nombre ?? "Proyecto"
    : filtro === "proyecto" ? "Proyecto" : undefined;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 pt-14 pb-4 px-5">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-xl font-bold">Tareas</Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)/tareas/nueva")}
            className="bg-white/20 rounded-xl px-4 py-2"
          >
            <Text className="text-white text-sm font-medium">+ Nueva</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <View className="flex-row gap-2 mb-3">
          <TouchableOpacity
            onPress={() => handleFiltro("mias")}
            className="px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: filtro === "mias" ? "#fff" : "transparent",
              borderColor: filtro === "mias" ? "#fff" : "rgba(255,255,255,0.4)",
            }}
          >
            <Text className="text-sm font-medium" style={{ color: filtro === "mias" ? "#2563eb" : "#fff" }}>
              Mis tareas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFiltro("todas")}
            className="px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: filtro === "todas" ? "#fff" : "transparent",
              borderColor: filtro === "todas" ? "#fff" : "rgba(255,255,255,0.4)",
            }}
          >
            <Text className="text-sm font-medium" style={{ color: filtro === "todas" ? "#2563eb" : "#fff" }}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFiltro("proyecto")}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: filtro === "proyecto" ? "#fff" : "transparent",
              borderColor: filtro === "proyecto" ? "#fff" : "rgba(255,255,255,0.4)",
            }}
          >
            <Text className="text-sm font-medium" style={{ color: filtro === "proyecto" ? "#2563eb" : "#fff" }} numberOfLines={1}>
              {chipLabel ?? "Proyecto"}
            </Text>
            <FontAwesome name="chevron-down" size={10} color={filtro === "proyecto" ? "#2563eb" : "#fff"} />
          </TouchableOpacity>
        </View>

        <TextInput
          className="bg-white/20 rounded-xl px-4 py-2.5 text-white"
          placeholder="Buscar tareas..."
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
          data={tareas}
          keyExtractor={(item) => String(item.id_tarea)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={() => { if (tareas.length < total) load(page + 1, search, filtro, proyectoSeleccionado); }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View className="items-center py-16">
              <FontAwesome name="check-square" size={40} color="#d1d5db" />
              <Text className="text-gray-400 mt-3">No hay tareas</Text>
            </View>
          }
        />
      )}

      {/* Modal selector de proyecto */}
      <Modal visible={showProyectos} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: "70%" }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">Filtrar por proyecto</Text>
              <TouchableOpacity onPress={() => setShowProyectos(false)}>
                <FontAwesome name="times" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {proyectos.map((p) => (
                <TouchableOpacity
                  key={p.id_proyecto}
                  onPress={() => handleSeleccionarProyecto(p)}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                >
                  <Text className="text-gray-700 flex-1">{p.nombre}</Text>
                  {proyectoSeleccionado?.id_proyecto === p.id_proyecto && (
                    <FontAwesome name="check" size={14} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
