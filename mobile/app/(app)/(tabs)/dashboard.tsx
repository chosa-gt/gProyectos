import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "@/src/store/auth.store";
import { getStats, getCharts, getMisTareas } from "@/src/api/dashboard";
import type { DashboardStats, DashboardCharts, Tarea } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const PRIORIDAD_COLOR: Record<string, string> = {
  Crítica: "#dc2626",
  Alta: "#ea580c",
  Media: "#2563eb",
  Baja: "#6b7280",
};

const ESTADO_PROYECTO_COLOR: Record<string, string> = {
  "Planificación": "#8b5cf6",
  "En progreso":   "#2563eb",
  "Finalizado":    "#16a34a",
  "Cancelado":     "#dc2626",
  "Pausado":       "#d97706",
};

const ESTADO_TAREA_COLOR: Record<string, string> = {
  Pendiente:     "#6b7280",
  "En progreso": "#d97706",
  Completada:    "#16a34a",
  Cancelada:     "#dc2626",
};

function StatCard({
  label, value, icon, color,
}: {
  label: string; value: number; icon: string; color: string;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 flex-1 shadow-sm border border-gray-100">
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-2"
        style={{ backgroundColor: color + "20" }}
      >
        <FontAwesome name={icon as any} size={18} color={color} />
      </View>
      <Text className="text-2xl font-bold text-gray-800">{value}</Text>
      <Text className="text-xs text-gray-500 mt-1">{label}</Text>
    </View>
  );
}

function BarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View className="gap-2">
      {data.map((item) => (
        <View key={item.label} className="flex-row items-center gap-3">
          <Text className="text-xs text-gray-500 w-24" numberOfLines={1}>
            {item.label}
          </Text>
          <View className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </View>
          <Text className="text-xs font-semibold text-gray-700 w-5 text-right">
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const { usuario, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [misTareas, setMisTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [statsRes, chartsRes, tareasRes] = await Promise.all([
        getStats(),
        getCharts(),
        getMisTareas(),
      ]);
      setStats(statsRes.data.data);
      setCharts(chartsRes.data.data);
      setMisTareas(tareasRes.data.data);
    } catch {
      // silent — el interceptor de axios maneja el 401
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const proyBarData =
    charts?.proyectosPorEstado.map((p) => ({
      label: p.estado,
      value: p.total,
      color: ESTADO_PROYECTO_COLOR[p.estado] ?? "#6b7280",
    })) ?? [];

  const tarBarData =
    charts?.tareasPorEstado.map((t) => ({
      label: t.estado,
      value: t.total,
      color: ESTADO_TAREA_COLOR[t.estado] ?? "#6b7280",
    })) ?? [];

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-6 px-5">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white/70 text-sm">Bienvenido,</Text>
            <Text className="text-white text-xl font-bold">
              {usuario?.nombre ?? "Usuario"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="bg-white/20 rounded-xl px-4 py-2"
          >
            <Text className="text-white text-sm font-medium">Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 py-5 gap-5">
        {/* Stats */}
        {stats && (
          <View>
            <Text className="text-base font-semibold text-gray-700 mb-3">
              Resumen
            </Text>
            <View className="flex-row gap-3 mb-3">
              <StatCard
                label="Clientes"
                value={stats.totalClientes}
                icon="users"
                color="#2563eb"
              />
              <StatCard
                label="Proyectos"
                value={stats.totalProyectos}
                icon="briefcase"
                color="#7c3aed"
              />
            </View>
            <View className="flex-row gap-3">
              <StatCard
                label="Tareas"
                value={stats.totalTareas}
                icon="check-square"
                color="#059669"
              />
              <StatCard
                label="Usuarios"
                value={stats.totalUsuarios}
                icon="user"
                color="#d97706"
              />
            </View>
          </View>
        )}

        {/* Proyectos por estado */}
        {proyBarData.length > 0 && (
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="text-sm font-semibold text-gray-700 mb-4">
              Proyectos por estado
            </Text>
            <BarChart data={proyBarData} />
          </View>
        )}

        {/* Tareas por estado */}
        {tarBarData.length > 0 && (
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="text-sm font-semibold text-gray-700 mb-4">
              Tareas por estado
            </Text>
            <BarChart data={tarBarData} />
          </View>
        )}

        {/* Mis tareas pendientes */}
        {misTareas.length > 0 && (
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Mis tareas pendientes
            </Text>
            <View className="gap-2">
              {misTareas.map((t) => {
                const prioridad = t.prioridad?.nombre_prioridad ?? "Media";
                const color = PRIORIDAD_COLOR[prioridad] ?? "#6b7280";
                return (
                  <View
                    key={t.id_tarea}
                    className="flex-row items-center gap-3 py-2 border-b border-gray-50"
                  >
                    <View
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <Text
                      className="flex-1 text-sm text-gray-700"
                      numberOfLines={1}
                    >
                      {t.tarea}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {prioridad}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
