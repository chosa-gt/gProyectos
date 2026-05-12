import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import {
  getProyecto,
  getEstadosProyecto,
  actualizarProyecto,
  cambiarEstadoProyecto,
  getHistorialProyecto,
} from "@/src/api/proyectos";
import { getClientes } from "@/src/api/clientes";
import type { Proyecto, HistorialProyecto, EstadoProyecto, Tarea, Cliente } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const ESTADO_COLOR: Record<string, { bg: string; text: string }> = {
  "Planificación": { bg: "#ede9fe", text: "#7c3aed" },
  "En progreso":   { bg: "#dbeafe", text: "#2563eb" },
  "Finalizado":    { bg: "#dcfce7", text: "#16a34a" },
  "Cancelado":     { bg: "#fee2e2", text: "#dc2626" },
  "Pausado":       { bg: "#fef9c3", text: "#a16207" },
};

const PRIORIDAD_COLOR: Record<string, string> = {
  Crítica: "#dc2626", Alta: "#ea580c", Media: "#2563eb", Baja: "#6b7280",
};

export default function ProyectoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [estados, setEstados] = useState<EstadoProyecto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Campos de edición
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idCliente, setIdCliente] = useState(0);

  const [generando, setGenerando] = useState(false);

  const generarPDF = async () => {
    if (!proyecto) return;
    setGenerando(true);
    try {
      const estadoColors: Record<string, { bg: string; text: string }> = {
        "Planificación": { bg: "#ede9fe", text: "#7c3aed" },
        "En progreso":   { bg: "#dbeafe", text: "#2563eb" },
        "Finalizado":    { bg: "#dcfce7", text: "#16a34a" },
        "Cancelado":     { bg: "#fee2e2", text: "#dc2626" },
        "Pausado":       { bg: "#fef9c3", text: "#a16207" },
      };
      const prioridadColors: Record<string, string> = {
        Crítica: "#dc2626", Alta: "#ea580c", Media: "#2563eb", Baja: "#6b7280",
      };
      const estadoActualColors = estadoColors[proyecto.estado_proyecto?.estado ?? ""] ?? { bg: "#f3f4f6", text: "#6b7280" };
      const fecha = new Date().toLocaleDateString("es-SV", { day: "2-digit", month: "long", year: "numeric" });

      const tareasHTML = proyecto.tareas?.length
        ? proyecto.tareas.map((t: Tarea) => `
            <tr>
              <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${prioridadColors[t.prioridad?.nombre_prioridad ?? ""] ?? "#6b7280"};margin-right:8px;"></span>
                ${t.tarea ?? ""}
              </td>
              <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;">${t.prioridad?.nombre_prioridad ?? "—"}</td>
              <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;">${t.estado_tarea?.estado ?? "—"}</td>
              <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;">${t.usuario ? `${t.usuario.nombre} ${t.usuario.apellido}` : "—"}</td>
            </tr>`).join("")
        : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#9ca3af;">Sin tareas registradas</td></tr>`;

      const historialHTML = proyecto.historial?.length
        ? proyecto.historial.map((h: HistorialProyecto) => {
            const hc = estadoColors[h.estado_proyecto?.estado ?? ""] ?? { bg: "#f3f4f6", text: "#6b7280" };
            return `
              <div style="display:flex;gap:12px;margin-bottom:14px;">
                <div style="width:10px;height:10px;border-radius:50%;background:${hc.text};margin-top:4px;flex-shrink:0;"></div>
                <div>
                  <span style="background:${hc.bg};color:${hc.text};padding:2px 10px;border-radius:12px;font-size:11px;font-weight:bold;">${h.estado_proyecto?.estado ?? ""}</span>
                  <span style="font-size:11px;color:#9ca3af;margin-left:8px;">${new Date(h.fecha_cambio).toLocaleDateString("es-SV")}</span>
                  ${h.detalle ? `<div style="font-size:12px;color:#6b7280;margin-top:3px;">${h.detalle}</div>` : ""}
                  <div style="font-size:11px;color:#9ca3af;margin-top:2px;">${h.usuario?.nombre ?? ""} ${h.usuario?.apellido ?? ""}</div>
                </div>
              </div>`;
          }).join("")
        : `<p style="color:#9ca3af;font-size:13px;">Sin historial registrado.</p>`;

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#1f2937;font-size:13px;}
  h2{margin:0 0 6px;font-size:20px;}
  .badge{display:inline-block;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:bold;}
  .section{margin-bottom:24px;}
  .section-title{font-size:13px;font-weight:bold;color:#374151;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px;}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .info-block .label{font-size:11px;color:#9ca3af;margin-bottom:2px;}
  .info-block .value{font-size:13px;color:#111827;}
  table{width:100%;border-collapse:collapse;}
  th{text-align:left;font-size:11px;color:#9ca3af;padding:6px;border-bottom:2px solid #e5e7eb;text-transform:uppercase;}
  .footer{margin-top:40px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px;}
</style>
</head><body>
  <div style="background:#2563eb;color:white;padding:24px;border-radius:12px;margin-bottom:28px;">
    <h2>${proyecto.nombre ?? ""}</h2>
    <span class="badge" style="background:${estadoActualColors.bg};color:${estadoActualColors.text};">${proyecto.estado_proyecto?.estado ?? ""}</span>
  </div>

  <div class="section">
    <div class="section-title">Información general</div>
    <div class="info-grid">
      <div class="info-block"><div class="label">Cliente</div><div class="value">${proyecto.cliente?.nombre ?? "—"}</div></div>
      <div class="info-block"><div class="label">Estado</div><div class="value">${proyecto.estado_proyecto?.estado ?? "—"}</div></div>
      <div class="info-block"><div class="label">Fecha inicio</div><div class="value">${proyecto.fecha_inicio?.split("T")[0] ?? "—"}</div></div>
      <div class="info-block"><div class="label">Fecha fin</div><div class="value">${proyecto.fecha_fin?.split("T")[0] ?? "—"}</div></div>
    </div>
    ${proyecto.descripcion ? `<div style="margin-top:12px;"><div class="info-block"><div class="label">Descripción</div><div class="value">${proyecto.descripcion}</div></div></div>` : ""}
  </div>

  <div class="section">
    <div class="section-title">Tareas (${proyecto.tareas?.length ?? 0})</div>
    <table>
      <thead><tr>
        <th>Tarea</th><th>Prioridad</th><th>Estado</th><th>Responsable</th>
      </tr></thead>
      <tbody>${tareasHTML}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Historial de estados</div>
    ${historialHTML}
  </div>

  <div class="footer">Reporte generado el ${fecha} · SGP</div>
</body></html>`;

      const slug = (proyecto.nombre ?? "proyecto")
        .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 20);
      const mes = new Date().toISOString().slice(0, 7);
      const filename = `sgp_proyecto_${slug}_${mes}.pdf`;

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

  // Modal cambio de estado
  const [showCambioEstado, setShowCambioEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState(0);
  const [detalle, setDetalle] = useState("");
  const [savingEstado, setSavingEstado] = useState(false);

  const load = async () => {
    try {
      const [proyRes, estadosRes, historialRes, clientesRes] = await Promise.all([
        getProyecto(Number(id)),
        getEstadosProyecto(),
        getHistorialProyecto(Number(id)),
        getClientes(1, ""),
      ]);
      const p = proyRes.data.data;
      p.historial = historialRes.data.data;
      setProyecto(p);
      setNombre(p.nombre ?? "");
      setDescripcion(p.descripcion ?? "");
      setFechaInicio(p.fecha_inicio?.split("T")[0] ?? "");
      setFechaFin(p.fecha_fin?.split("T")[0] ?? "");
      setIdCliente(p.id_cliente);
      setEstados(estadosRes.data.data);
      setClientes(clientesRes.data.data ?? []);
    } catch (e) {
      console.error("Error cargando proyecto:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    if (!nombre.trim() || !fechaInicio || !idCliente) {
      Alert.alert("Error", "Nombre, fecha de inicio y cliente son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await actualizarProyecto(Number(id), {
        nombre,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin || undefined,
        id_cliente: idCliente,
      });
      setEditing(false);
      load();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message ?? "No se pudo actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const handleCambioEstado = async () => {
    if (!nuevoEstado || !detalle.trim()) {
      Alert.alert("Error", "Selecciona un estado e ingresa el detalle.");
      return;
    }
    setSavingEstado(true);
    try {
      await cambiarEstadoProyecto(Number(id), { id_estado_proyecto: nuevoEstado, detalle });
      setShowCambioEstado(false);
      setDetalle("");
      setNuevoEstado(0);
      load();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message ?? "Error al cambiar estado.");
    } finally {
      setSavingEstado(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!proyecto) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Proyecto no encontrado</Text>
      </View>
    );
  }

  const estadoActual = proyecto.estado_proyecto?.estado ?? "";

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-5">
        <View className="flex-row items-center gap-3 mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1" numberOfLines={1}>
            {proyecto.nombre}
          </Text>
          {!editing && (
            <TouchableOpacity onPress={generarPDF} disabled={generando} style={{ marginRight: 12 }}>
              {generando
                ? <ActivityIndicator size="small" color="#fff" />
                : <FontAwesome name="file-pdf-o" size={20} color="#fff" />
              }
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <FontAwesome name={editing ? "times" : "pencil"} size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
            <Text className="text-white text-sm font-medium">{estadoActual}</Text>
          </View>
          {!editing && (
            <TouchableOpacity
              onPress={() => setShowCambioEstado(true)}
              className="bg-white/20 px-3 py-1 rounded-full"
            >
              <Text className="text-white text-sm">Cambiar estado</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-5" contentContainerStyle={{ gap: 16 }}>

        {/* Info / Edición */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 gap-4">
          {editing ? (
            <>
              <Field label="Nombre *" value={nombre} onChange={setNombre} />
              <Field label="Descripción" value={descripcion} onChange={setDescripcion} multiline />
              <Field label="Fecha inicio (YYYY-MM-DD)" value={fechaInicio} onChange={setFechaInicio} />
              <Field label="Fecha fin (YYYY-MM-DD)" value={fechaFin} onChange={setFechaFin} />

              <View>
                <Text className="text-xs font-medium text-gray-500 mb-2">Cliente *</Text>
                <ScrollView style={{ maxHeight: 140 }} nestedScrollEnabled>
                  {clientes.map((c) => (
                    <TouchableOpacity
                      key={c.id_cliente}
                      onPress={() => setIdCliente(c.id_cliente)}
                      className={`px-3 py-2 rounded-xl border mb-1 ${idCliente === c.id_cliente ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                    >
                      <Text className={idCliente === c.id_cliente ? "text-blue-600 font-medium" : "text-gray-700"}>
                        {c.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="bg-blue-600 rounded-xl py-3.5 items-center"
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text className="text-white font-semibold">Guardar cambios</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <InfoRow label="Cliente" value={proyecto.cliente?.nombre} />
              <InfoRow label="Descripción" value={proyecto.descripcion} />
              <InfoRow label="Fecha inicio" value={proyecto.fecha_inicio?.split("T")[0]} />
              <InfoRow label="Fecha fin" value={proyecto.fecha_fin?.split("T")[0]} />
            </>
          )}
        </View>

        {/* Tareas */}
        {proyecto.tareas && proyecto.tareas.length > 0 && (
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Tareas ({proyecto.tareas.length})
            </Text>
            <View className="gap-1">
              {proyecto.tareas.map((t: Tarea) => (
                <TouchableOpacity
                  key={t.id_tarea}
                  onPress={() => router.push(`/(app)/tareas/${t.id_tarea}`)}
                  className="flex-row items-center gap-2 py-2 border-b border-gray-50"
                >
                  <View
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PRIORIDAD_COLOR[t.prioridad?.nombre_prioridad ?? ""] ?? "#6b7280" }}
                  />
                  <Text className="flex-1 text-sm text-gray-700" numberOfLines={1}>{t.tarea}</Text>
                  <Text className="text-xs text-gray-400">{t.estado_tarea?.estado}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Historial */}
        {proyecto.historial && proyecto.historial.length > 0 && (
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="text-sm font-semibold text-gray-700 mb-3">Historial de estados</Text>
            <View className="gap-3">
              {proyecto.historial.map((h: HistorialProyecto, idx: number) => {
                const hColors = ESTADO_COLOR[h.estado_proyecto?.estado] ?? { bg: "#f3f4f6", text: "#6b7280" };
                return (
                  <View key={h.id_historial} className="flex-row gap-3">
                    <View className="items-center">
                      <View className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: hColors.text }} />
                      {idx < (proyecto.historial?.length ?? 0) - 1 && (
                        <View className="w-0.5 flex-1 bg-gray-200 mt-1" />
                      )}
                    </View>
                    <View className="flex-1 pb-3">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: hColors.bg }}>
                          <Text className="text-xs font-medium" style={{ color: hColors.text }}>
                            {h.estado_proyecto?.estado}
                          </Text>
                        </View>
                        <Text className="text-xs text-gray-400">
                          {new Date(h.fecha_cambio).toLocaleDateString("es-SV")}
                        </Text>
                      </View>
                      {h.detalle ? <Text className="text-xs text-gray-600">{h.detalle}</Text> : null}
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {h.usuario?.nombre} {h.usuario?.apellido}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal cambio de estado */}
      <Modal visible={showCambioEstado} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 gap-4">
            <Text className="text-lg font-bold text-gray-800">Cambiar estado</Text>
            <View className="flex-row flex-wrap gap-2">
              {estados.map((e) => {
                const c = ESTADO_COLOR[e.estado] ?? { bg: "#f3f4f6", text: "#6b7280" };
                return (
                  <TouchableOpacity
                    key={e.id_estado_proyecto}
                    onPress={() => setNuevoEstado(e.id_estado_proyecto)}
                    className="px-3 py-1.5 rounded-full border"
                    style={{
                      borderColor: nuevoEstado === e.id_estado_proyecto ? c.text : "#e5e7eb",
                      backgroundColor: nuevoEstado === e.id_estado_proyecto ? c.bg : "transparent",
                    }}
                  >
                    <Text className="text-sm font-medium" style={{ color: nuevoEstado === e.id_estado_proyecto ? c.text : "#6b7280" }}>
                      {e.estado}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View>
              <Text className="text-xs font-medium text-gray-500 mb-1">Detalle *</Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 bg-gray-50"
                placeholder="Describe el motivo del cambio..."
                value={detalle}
                onChangeText={setDetalle}
                multiline
                numberOfLines={3}
              />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setShowCambioEstado(false); setDetalle(""); setNuevoEstado(0); }}
                className="flex-1 border border-gray-200 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-600 font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCambioEstado}
                disabled={savingEstado}
                className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
              >
                {savingEstado
                  ? <ActivityIndicator color="#fff" />
                  : <Text className="text-white font-semibold">Confirmar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

function Field({ label, value, onChange, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
}) {
  return (
    <View>
      <Text className="text-xs font-medium text-gray-500 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 bg-gray-50"
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        autoCapitalize="none"
      />
    </View>
  );
}
