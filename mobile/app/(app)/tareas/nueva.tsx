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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { crearTarea, getPrioridades, getEstadosTarea } from "@/src/api/tareas";
import { getProyectos } from "@/src/api/proyectos";
import { getUsuarios } from "@/src/api/usuarios";
import type { Proyecto, Usuario } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface Prioridad { id_prioridad: number; nombre_prioridad: string }
interface EstadoTarea { id_estado_tarea: number; estado: string }

export default function NuevaTareaScreen() {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idProyecto, setIdProyecto] = useState(0);
  const [idUsuario, setIdUsuario] = useState(0);
  const [idPrioridad, setIdPrioridad] = useState(0);
  const [idEstado, setIdEstado] = useState(0);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);
  const [estados, setEstados] = useState<EstadoTarea[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getProyectos(1, ""),
      getUsuarios(1),
      getPrioridades(),
      getEstadosTarea(),
    ]).then(([proyRes, usrRes, prioRes, estRes]) => {
      setProyectos(proyRes.data.data ?? []);
      setUsuarios(usrRes.data.data ?? []);
      setPrioridades(prioRes.data.data);
      setEstados(estRes.data.data);
    });
  }, []);

  const handleSave = async () => {
    if (!nombre.trim() || !fechaInicio || !idProyecto || !idUsuario || !idPrioridad || !idEstado) {
      Alert.alert("Error", "Completa todos los campos obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await crearTarea({
        tarea: nombre,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin || undefined,
        id_proyecto: idProyecto,
        id_usuario: idUsuario,
        id_prioridad: idPrioridad,
        id_estado_tarea: idEstado,
      });
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
        <Text className="text-white text-xl font-bold">Nueva tarea</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-5" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 gap-4">
          <LabelInput label="Nombre *" value={nombre} onChange={setNombre} placeholder="Nombre de la tarea" />
          <LabelInput label="Descripción" value={descripcion} onChange={setDescripcion} placeholder="Descripción..." multiline />
          <LabelInput label="Fecha inicio * (YYYY-MM-DD)" value={fechaInicio} onChange={setFechaInicio} placeholder="2025-01-15" />
          <LabelInput label="Fecha fin (YYYY-MM-DD)" value={fechaFin} onChange={setFechaFin} placeholder="2025-06-30" />

          <SelectList label="Proyecto *" items={proyectos.map(p => ({ id: p.id_proyecto, label: p.nombre ?? "" }))} selected={idProyecto} onSelect={setIdProyecto} />
          <SelectList label="Responsable *" items={usuarios.map(u => ({ id: u.id_usuario, label: `${u.nombre} ${u.apellido}` }))} selected={idUsuario} onSelect={setIdUsuario} />

          <View>
            <Text className="text-xs font-medium text-gray-500 mb-2">Prioridad *</Text>
            <View className="flex-row flex-wrap gap-2">
              {prioridades.map((p) => (
                <TouchableOpacity
                  key={p.id_prioridad}
                  onPress={() => setIdPrioridad(p.id_prioridad)}
                  className={`px-3 py-1.5 rounded-full border ${idPrioridad === p.id_prioridad ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <Text className={idPrioridad === p.id_prioridad ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm"}>{p.nombre_prioridad}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-xs font-medium text-gray-500 mb-2">Estado *</Text>
            <View className="flex-row flex-wrap gap-2">
              {estados.map((e) => (
                <TouchableOpacity
                  key={e.id_estado_tarea}
                  onPress={() => setIdEstado(e.id_estado_tarea)}
                  className={`px-3 py-1.5 rounded-full border ${idEstado === e.id_estado_tarea ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <Text className={idEstado === e.id_estado_tarea ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm"}>{e.estado}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="bg-blue-600 rounded-xl py-3.5 items-center mt-2"
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Crear tarea</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function LabelInput({ label, value, onChange, placeholder, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  return (
    <View>
      <Text className="text-xs font-medium text-gray-500 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 bg-gray-50"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        autoCapitalize="none"
      />
    </View>
  );
}

function SelectList({ label, items, selected, onSelect }: {
  label: string;
  items: { id: number; label: string }[];
  selected: number;
  onSelect: (id: number) => void;
}) {
  return (
    <View>
      <Text className="text-xs font-medium text-gray-500 mb-2">{label}</Text>
      <View className="max-h-36">
        <ScrollView nestedScrollEnabled>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelect(item.id)}
              className={`px-3 py-2 rounded-xl border mb-1 ${selected === item.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            >
              <Text className={selected === item.id ? "text-blue-600 font-medium" : "text-gray-700"} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
