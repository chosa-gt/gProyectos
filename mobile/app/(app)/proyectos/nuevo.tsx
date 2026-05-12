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
import { crearProyecto, getEstadosProyecto, getClientesParaProyecto } from "@/src/api/proyectos";
import { getClientes } from "@/src/api/clientes";
import type { EstadoProyecto, Cliente } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function NuevoProyectoScreen() {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idCliente, setIdCliente] = useState(0);
  const [idEstado, setIdEstado] = useState(0);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [estados, setEstados] = useState<EstadoProyecto[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getClientes(1, ""), getEstadosProyecto()]).then(([cliRes, estRes]) => {
      setClientes(cliRes.data.data ?? []);
      setEstados(estRes.data.data);
    });
  }, []);

  const handleSave = async () => {
    if (!nombre.trim() || !fechaInicio || !idCliente || !idEstado) {
      Alert.alert("Error", "Completa los campos obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await crearProyecto({
        nombre,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin || undefined,
        id_cliente: idCliente,
        id_estado_proyecto: idEstado,
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
        <Text className="text-white text-xl font-bold">Nuevo proyecto</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-5" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 gap-4">

          <LabelInput label="Nombre *" value={nombre} onChange={setNombre} placeholder="Nombre del proyecto" />
          <LabelInput label="Descripción" value={descripcion} onChange={setDescripcion} placeholder="Descripción..." multiline />
          <LabelInput label="Fecha inicio * (YYYY-MM-DD)" value={fechaInicio} onChange={setFechaInicio} placeholder="2025-01-15" />
          <LabelInput label="Fecha fin (YYYY-MM-DD)" value={fechaFin} onChange={setFechaFin} placeholder="2025-06-30" />

          <View>
            <Text className="text-xs font-medium text-gray-500 mb-2">Cliente *</Text>
            <View className="gap-1 max-h-40">
              <ScrollView nestedScrollEnabled>
                {clientes.map((c) => (
                  <TouchableOpacity
                    key={c.id_cliente}
                    onPress={() => setIdCliente(c.id_cliente)}
                    className={`px-3 py-2 rounded-xl border mb-1 ${idCliente === c.id_cliente ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                  >
                    <Text className={idCliente === c.id_cliente ? "text-blue-600 font-medium" : "text-gray-700"}>{c.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View>
            <Text className="text-xs font-medium text-gray-500 mb-2">Estado *</Text>
            <View className="flex-row flex-wrap gap-2">
              {estados.map((e) => (
                <TouchableOpacity
                  key={e.id_estado_proyecto}
                  onPress={() => setIdEstado(e.id_estado_proyecto)}
                  className={`px-3 py-1.5 rounded-full border ${idEstado === e.id_estado_proyecto ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <Text className={idEstado === e.id_estado_proyecto ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm"}>{e.estado}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="bg-blue-600 rounded-xl py-3.5 items-center mt-2"
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Crear proyecto</Text>}
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
