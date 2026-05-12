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
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
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

  const [generando, setGenerando] = useState(false);
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

  const generarPDF = async () => {
    setGenerando(true);
    try {
      const { data } = await getTareas(1, search, { ...buildFilters(filtro, proyectoSeleccionado), limit: 1000 });
      const todas: Tarea[] = data.data;

      let titulo = "Todas las Tareas";
      let subtitulo = "";
      if (filtro === "mias") {
        titulo = "Mis Tareas";
        subtitulo = `${authUsuario?.nombre ?? ""} ${authUsuario?.apellido ?? ""}`;
      } else if (filtro === "proyecto" && proyectoSeleccionado) {
        titulo = "Tareas por Proyecto";
        subtitulo = proyectoSeleccionado.nombre ?? "";
      }

      const fecha = new Date().toLocaleDateString("es-SV", { day: "2-digit", month: "long", year: "numeric" });
      const prioColors: Record<string, string> = {
        Crítica: "#dc2626", Alta: "#ea580c", Media: "#2563eb", Baja: "#6b7280",
      };
      const estColors: Record<string, { bg: string; text: string }> = {
        Pendiente:     { bg: "#f3f4f6", text: "#6b7280" },
        "En progreso": { bg: "#fef9c3", text: "#a16207" },
        Completada:    { bg: "#dcfce7", text: "#16a34a" },
        Cancelada:     { bg: "#fee2e2", text: "#dc2626" },
      };

      const filas = todas.length
        ? todas.map((t) => {
            const ec = estColors[t.estado_tarea?.estado ?? ""] ?? { bg: "#f3f4f6", text: "#6b7280" };
            const pc = prioColors[t.prioridad?.nombre_prioridad ?? ""] ?? "#6b7280";
            return `<tr>
              <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;font-size:13px;">${t.tarea ?? ""}</td>
              <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;">${t.proyecto?.nombre ?? "—"}</td>
              <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;">
                <span style="color:${pc};font-weight:bold;font-size:12px;">${t.prioridad?.nombre_prioridad ?? "—"}</span>
              </td>
              <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;">
                <span style="background:${ec.bg};color:${ec.text};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold;">${t.estado_tarea?.estado ?? "—"}</span>
              </td>
              <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;">${t.usuario ? `${t.usuario.nombre} ${t.usuario.apellido}` : "—"}</td>
            </tr>`;
          }).join("")
        : `<tr><td colspan="5" style="padding:16px;text-align:center;color:#9ca3af;">Sin tareas</td></tr>`;

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#1f2937;font-size:13px;}
  h2{margin:0 0 4px;font-size:20px;}
  .sub{font-size:14px;opacity:.85;margin-top:4px;}
  .section-title{font-size:12px;font-weight:bold;color:#374151;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px;}
  table{width:100%;border-collapse:collapse;}
  th{text-align:left;font-size:11px;color:#9ca3af;padding:6px;border-bottom:2px solid #e5e7eb;text-transform:uppercase;}
  .footer{margin-top:40px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px;}
</style>
</head><body>
  <div style="background:#2563eb;color:white;padding:24px;border-radius:12px;margin-bottom:28px;">
    <h2>${titulo}</h2>
    ${subtitulo ? `<div class="sub">${subtitulo}</div>` : ""}
    <div style="margin-top:8px;font-size:12px;opacity:.75;">${todas.length} tarea${todas.length !== 1 ? "s" : ""}</div>
  </div>
  <div class="section-title">Listado de tareas</div>
  <table>
    <thead><tr>
      <th>Tarea</th><th>Proyecto</th><th>Prioridad</th><th>Estado</th><th>Responsable</th>
    </tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <div class="footer">Reporte generado el ${fecha} · SGP</div>
</body></html>`;

      const toSlug = (s: string) =>
        s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
         .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 20);
      const mes = new Date().toISOString().slice(0, 7);
      let filename = `sgp_tareas-todas_${mes}.pdf`;
      if (filtro === "mias")
        filename = `sgp_tareas-mias_${mes}.pdf`;
      else if (filtro === "proyecto" && proyectoSeleccionado)
        filename = `sgp_tareas-proyecto_${toSlug(proyectoSeleccionado.nombre ?? "")}_${mes}.pdf`;

      const { uri: tempUri } = await Print.printToFileAsync({ html, base64: false });
      const finalUri = FileSystem.cacheDirectory + filename;
      await FileSystem.copyAsync({ from: tempUri, to: finalUri });
      await Sharing.shareAsync(finalUri, { mimeType: "application/pdf", dialogTitle: filename });
    } catch {
      Alert.alert("Error", "No se pudo generar el PDF.");
    } finally {
      setGenerando(false);
    }
  };

  const chipLabel = filtro === "proyecto" && proyectoSeleccionado
    ? proyectoSeleccionado.nombre ?? "Proyecto"
    : filtro === "proyecto" ? "Proyecto" : undefined;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 pt-14 pb-4 px-5">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-xl font-bold">Tareas</Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={generarPDF} disabled={generando}>
              {generando
                ? <ActivityIndicator size="small" color="#fff" />
                : <FontAwesome name="file-pdf-o" size={20} color="#fff" />
              }
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(app)/tareas/nueva")}
              className="bg-white/20 rounded-xl px-4 py-2"
            >
              <Text className="text-white text-sm font-medium">+ Nueva</Text>
            </TouchableOpacity>
          </View>
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
