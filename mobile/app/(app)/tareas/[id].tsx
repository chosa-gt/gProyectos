import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getTarea, actualizarTarea, getPrioridades, getEstadosTarea } from "@/src/api/tareas";
import type { Tarea } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface Prioridad { id_prioridad: number; nombre_prioridad: string }
interface EstadoTarea { id_estado_tarea: number; estado: string }

const ESTADO_COLOR: Record<string, { bg: string; text: string }> = {
  Pendiente:     { bg: "#f3f4f6", text: "#6b7280" },
  "En progreso": { bg: "#fef9c3", text: "#a16207" },
  Completada:    { bg: "#dcfce7", text: "#16a34a" },
  Cancelada:     { bg: "#fee2e2", text: "#dc2626" },
};

export default function TareaDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);
  const [estados, setEstados] = useState<EstadoTarea[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idPrioridad, setIdPrioridad] = useState(0);
  const [idEstado, setIdEstado] = useState(0);

  // Modal cambio de estado
  const [showCambioEstado, setShowCambioEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState(0);
  const [savingEstado, setSavingEstado] = useState(false);

  const load = async () => {
    try {
      const [tRes, prioRes, estRes] = await Promise.all([
        getTarea(Number(id)),
        getPrioridades(),
        getEstadosTarea(),
      ]);
      const t = tRes.data.data;
      setTarea(t);
      setNombre(t.tarea ?? "");
      setDescripcion(t.descripcion ?? "");
      setFechaInicio(t.fecha_inicio?.split("T")[0] ?? "");
      setFechaFin(t.fecha_fin?.split("T")[0] ?? "");
      setIdPrioridad(t.id_prioridad);
      setIdEstado(t.id_estado_tarea);
      setPrioridades(prioRes.data.data);
      setEstados(estRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await actualizarTarea(Number(id), {
        tarea: nombre,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin || undefined,
        id_prioridad: idPrioridad,
        id_estado_tarea: idEstado,
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
    if (!nuevoEstado) {
      Alert.alert("Error", "Selecciona un estado.");
      return;
    }
    setSavingEstado(true);
    try {
      await actualizarTarea(Number(id), { id_estado_tarea: nuevoEstado });
      setShowCambioEstado(false);
      setNuevoEstado(0);
      load();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message ?? "Error al cambiar estado.");
    } finally {
      setSavingEstado(false);
    }
  };

  if (loading) {
    return <View className="flex-1 bg-gray-50 items-center justify-center"><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (!tarea) {
    return <View className="flex-1 bg-gray-50 items-center justify-center"><Text>Tarea no encontrada</Text></View>;
  }

  const estadoActual = tarea.estado_tarea?.estado ?? "";
  const estadoColors = ESTADO_COLOR[estadoActual] ?? { bg: "#f3f4f6", text: "#6b7280" };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-5">
        <View className="flex-row items-center gap-3 mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1" numberOfLines={1}>{tarea.tarea}</Text>
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
              onPress={() => { setNuevoEstado(0); setShowCambioEstado(true); }}
              className="bg-white/20 px-3 py-1 rounded-full"
            >
              <Text className="text-white text-sm">Cambiar estado</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-5">
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 gap-4">
          <InfoRow label="Proyecto" value={tarea.proyecto?.nombre} />
          <InfoRow label="Responsable" value={`${tarea.usuario?.nombre ?? ""} ${tarea.usuario?.apellido ?? ""}`} />

          {editing ? (
            <>
              <LabelInput label="Nombre" value={nombre} onChange={setNombre} />
              <LabelInput label="Descripción" value={descripcion} onChange={setDescripcion} multiline />
              <LabelInput label="Fecha inicio (YYYY-MM-DD)" value={fechaInicio} onChange={setFechaInicio} />
              <LabelInput label="Fecha fin (YYYY-MM-DD)" value={fechaFin} onChange={setFechaFin} />

              <View>
                <Text className="text-xs font-medium text-gray-500 mb-2">Prioridad</Text>
                <View className="flex-row flex-wrap gap-2">
                  {prioridades.map((p) => (
                    <TouchableOpacity
                      key={p.id_prioridad}
                      onPress={() => setIdPrioridad(p.id_prioridad)}
                      className={`px-3 py-1.5 rounded-full border ${idPrioridad === p.id_prioridad ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                    >
                      <Text className={idPrioridad === p.id_prioridad ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm"}>
                        {p.nombre_prioridad}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-xs font-medium text-gray-500 mb-2">Estado</Text>
                <View className="flex-row flex-wrap gap-2">
                  {estados.map((e) => (
                    <TouchableOpacity
                      key={e.id_estado_tarea}
                      onPress={() => setIdEstado(e.id_estado_tarea)}
                      className={`px-3 py-1.5 rounded-full border ${idEstado === e.id_estado_tarea ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                    >
                      <Text className={idEstado === e.id_estado_tarea ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm"}>
                        {e.estado}
                      </Text>
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
              <InfoRow label="Descripción" value={tarea.descripcion} />
              <InfoRow label="Fecha inicio" value={tarea.fecha_inicio} />
              <InfoRow label="Fecha fin" value={tarea.fecha_fin} />
              <InfoRow label="Prioridad" value={tarea.prioridad?.nombre_prioridad} />
              <InfoRow label="Estado" value={estadoActual} />
            </>
          )}
        </View>
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
                    key={e.id_estado_tarea}
                    onPress={() => setNuevoEstado(e.id_estado_tarea)}
                    className="px-3 py-1.5 rounded-full border"
                    style={{
                      borderColor: nuevoEstado === e.id_estado_tarea ? c.text : "#e5e7eb",
                      backgroundColor: nuevoEstado === e.id_estado_tarea ? c.bg : "transparent",
                    }}
                  >
                    <Text className="text-sm font-medium" style={{ color: nuevoEstado === e.id_estado_tarea ? c.text : "#6b7280" }}>
                      {e.estado}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setShowCambioEstado(false); setNuevoEstado(0); }}
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

function LabelInput({ label, value, onChange, multiline = false }: {
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
