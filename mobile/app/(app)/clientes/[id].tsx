import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getCliente, actualizarCliente, getEmpresas, getEstadosCliente } from "@/src/api/clientes";
import type { Cliente, Empresa } from "@/src/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface EstadoCliente { id_estado_cliente: number; estado: string }

export default function ClienteDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [estados, setEstados] = useState<EstadoCliente[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [idEmpresa, setIdEmpresa] = useState(0);
  const [idEstado, setIdEstado] = useState(0);

  useEffect(() => {
    Promise.all([
      getCliente(Number(id)),
      getEmpresas(),
      getEstadosCliente(),
    ]).then(([clienteRes, empRes, estRes]) => {
      const c = clienteRes.data.data;
      setCliente(c);
      setNombre(c.nombre ?? "");
      setCorreo(c.correo ?? "");
      setTelefono(c.telefono ?? "");
      setIdEmpresa(c.id_empresa);
      setIdEstado(c.id_estado_cliente);
      setEmpresas(empRes.data.data);
      setEstados(estRes.data.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await actualizarCliente(Number(id), { nombre, correo, telefono, id_empresa: idEmpresa, id_estado_cliente: idEstado });
      setEditing(false);
      const { data } = await getCliente(Number(id));
      setCliente(data.data);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message ?? "No se pudo actualizar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View className="flex-1 bg-gray-50 items-center justify-center"><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (!cliente) {
    return <View className="flex-1 bg-gray-50 items-center justify-center"><Text>Cliente no encontrado</Text></View>;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 pt-14 pb-4 px-5 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1" numberOfLines={1}>{cliente.nombre}</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <FontAwesome name={editing ? "times" : "pencil"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-5">
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 gap-4">

          <Field label="Nombre" value={nombre} onChange={setNombre} editing={editing} />
          <Field label="Correo" value={correo} onChange={setCorreo} editing={editing} keyboardType="email-address" />
          <Field label="Teléfono" value={telefono} onChange={setTelefono} editing={editing} keyboardType="phone-pad" />

          <View>
            <Text className="text-xs font-medium text-gray-500 mb-1">Empresa</Text>
            {editing ? (
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
            ) : (
              <Text className="text-gray-800">{cliente.empresa?.nombre}</Text>
            )}
          </View>

          <View>
            <Text className="text-xs font-medium text-gray-500 mb-1">Estado</Text>
            {editing ? (
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
            ) : (
              <Text className="text-gray-800">{cliente.estado_cliente?.estado}</Text>
            )}
          </View>

          {editing && (
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-blue-600 rounded-xl py-3.5 items-center mt-2"
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Guardar cambios</Text>}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChange, editing, keyboardType = "default" }: {
  label: string; value: string; onChange: (v: string) => void; editing: boolean; keyboardType?: string;
}) {
  return (
    <View>
      <Text className="text-xs font-medium text-gray-500 mb-1">{label}</Text>
      {editing ? (
        <TextInput
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 bg-gray-50"
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType as any}
        />
      ) : (
        <Text className="text-gray-800">{value || "—"}</Text>
      )}
    </View>
  );
}
