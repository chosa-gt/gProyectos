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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { crearCliente, getEmpresas, getEstadosCliente, crearEmpresa } from "@/src/api/clientes";
import type { Empresa } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface EstadoCliente { id_estado_cliente: number; estado: string }

export default function NuevoClienteScreen() {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [idEmpresa, setIdEmpresa] = useState(0);
  const [idEstado, setIdEstado] = useState(0);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [estados, setEstados] = useState<EstadoCliente[]>([]);
  const [saving, setSaving] = useState(false);

  // Modal nueva empresa
  const [showNuevaEmpresa, setShowNuevaEmpresa] = useState(false);
  const [nuevaEmpresaNombre, setNuevaEmpresaNombre] = useState("");
  const [savingEmpresa, setSavingEmpresa] = useState(false);

  useEffect(() => {
    Promise.all([getEmpresas(), getEstadosCliente()]).then(([empRes, estRes]) => {
      setEmpresas(empRes.data.data);
      setEstados(estRes.data.data);
    });
  }, []);

  const handleCrearEmpresa = async () => {
    if (!nuevaEmpresaNombre.trim()) {
      Alert.alert("Error", "Ingresa el nombre de la empresa.");
      return;
    }
    setSavingEmpresa(true);
    try {
      const { data } = await crearEmpresa({ nombre: nuevaEmpresaNombre.trim() });
      const nueva = data.data;
      const empRes = await getEmpresas();
      setEmpresas(empRes.data.data);
      setIdEmpresa(nueva.id_empresa);
      setShowNuevaEmpresa(false);
      setNuevaEmpresaNombre("");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message ?? "No se pudo crear la empresa.");
    } finally {
      setSavingEmpresa(false);
    }
  };

  const handleSave = async () => {
    if (!nombre.trim() || !correo.trim() || !idEmpresa || !idEstado) {
      Alert.alert("Error", "Completa todos los campos obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await crearCliente({ nombre, correo, telefono, id_empresa: idEmpresa, id_estado_cliente: idEstado });
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
        <Text className="text-white text-xl font-bold">Nuevo cliente</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-5" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 gap-4">

          <LabelInput label="Nombre *" value={nombre} onChange={setNombre} placeholder="Nombre completo" />
          <LabelInput label="Correo *" value={correo} onChange={setCorreo} placeholder="correo@ejemplo.com" keyboardType="email-address" />
          <LabelInput label="Teléfono" value={telefono} onChange={setTelefono} placeholder="50212345678" keyboardType="phone-pad" />

          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-medium text-gray-500">Empresa *</Text>
              <TouchableOpacity onPress={() => setShowNuevaEmpresa(true)} className="flex-row items-center gap-1">
                <FontAwesome name="plus" size={10} color="#2563eb" />
                <Text className="text-xs text-blue-600 font-medium">Nueva empresa</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-1">
              {empresas.map((e) => (
                <TouchableOpacity
                  key={e.id_empresa}
                  onPress={() => setIdEmpresa(e.id_empresa)}
                  className={`px-3 py-2 rounded-xl border ${idEmpresa === e.id_empresa ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <Text className={idEmpresa === e.id_empresa ? "text-blue-600 font-medium" : "text-gray-700"}>{e.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-xs font-medium text-gray-500 mb-2">Estado *</Text>
            <View className="flex-row flex-wrap gap-2">
              {estados.map((e) => (
                <TouchableOpacity
                  key={e.id_estado_cliente}
                  onPress={() => setIdEstado(e.id_estado_cliente)}
                  className={`px-3 py-1.5 rounded-full border ${idEstado === e.id_estado_cliente ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <Text className={idEstado === e.id_estado_cliente ? "text-blue-600 font-medium text-sm" : "text-gray-600 text-sm"}>{e.estado}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="bg-blue-600 rounded-xl py-3.5 items-center mt-2"
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Crear cliente</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal nueva empresa */}
      <Modal visible={showNuevaEmpresa} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 gap-4" style={{ paddingBottom: insets.bottom + 16 }}>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-800">Nueva empresa</Text>
              <TouchableOpacity onPress={() => { setShowNuevaEmpresa(false); setNuevaEmpresaNombre(""); }}>
                <FontAwesome name="times" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-xs font-medium text-gray-500 mb-1">Nombre *</Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 bg-gray-50"
                placeholder="Nombre de la empresa"
                value={nuevaEmpresaNombre}
                onChangeText={setNuevaEmpresaNombre}
                autoCapitalize="words"
                autoFocus
              />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setShowNuevaEmpresa(false); setNuevaEmpresaNombre(""); }}
                className="flex-1 border border-gray-200 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-600 font-medium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCrearEmpresa}
                disabled={savingEmpresa}
                className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
              >
                {savingEmpresa
                  ? <ActivityIndicator color="#fff" />
                  : <Text className="text-white font-semibold">Crear</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function LabelInput({ label, value, onChange, placeholder, keyboardType = "default" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; keyboardType?: string;
}) {
  return (
    <View>
      <Text className="text-xs font-medium text-gray-500 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 bg-gray-50"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType as any}
        autoCapitalize="none"
      />
    </View>
  );
}
