import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import type { Proyecto, Cliente, EstadoProyecto } from "../../types";
import { getProyectoByIdApi, getEstadosProyectoApi, updateProyectoApi } from "../../api/proyectos.api";
import { getClientesApi } from "../../api/clientes.api";

const estadoClases: Record<string, string> = {
  "Planificación": "border-blue-300 bg-blue-50 text-blue-700",
  "En progreso":   "border-yellow-300 bg-yellow-50 text-yellow-700",
  "Finalizado":    "border-green-300 bg-green-50 text-green-700",
  "Cancelado":     "border-gray-300 bg-gray-100 text-gray-500",
};

const prioridadColor: Record<string, string> = {
  Alta:   "text-red-600",
  Media:  "text-yellow-600",
  Baja:   "text-gray-500",
};

export const ProyectoDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proyecto, setProyecto]   = useState<Proyecto | null>(null);
  const [clientes, setClientes]   = useState<Cliente[]>([]);
  const [estados, setEstados]     = useState<EstadoProyecto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    nombre: "", descripcion: "", fecha_inicio: "", fecha_fin: "",
    id_cliente: "", id_estado_proyecto: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const [p, c, e] = await Promise.all([
        getProyectoByIdApi(Number(id)),
        getClientesApi(),
        getEstadosProyectoApi(),
      ]);
      setProyecto(p);
      setClientes(c.data);
      setEstados(e);
    } catch {
      toast.error("No se pudo cargar el proyecto");
      navigate("/proyectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const openEdit = () => {
    if (!proyecto) return;
    setForm({
      nombre:             proyecto.nombre,
      descripcion:        proyecto.descripcion ?? "",
      fecha_inicio:       proyecto.fecha_inicio.slice(0, 10),
      fecha_fin:          proyecto.fecha_fin ? proyecto.fecha_fin.slice(0, 10) : "",
      id_cliente:         String(proyecto.id_cliente),
      id_estado_proyecto: String(proyecto.id_estado_proyecto),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.fecha_inicio || !form.id_cliente || !form.id_estado_proyecto) {
      toast.error("Nombre, fecha de inicio, cliente y estado son obligatorios");
      return;
    }
    try {
      setSaving(true);
      await updateProyectoApi(Number(id), {
        nombre:             form.nombre,
        descripcion:        form.descripcion || undefined,
        fecha_inicio:       form.fecha_inicio,
        fecha_fin:          form.fecha_fin || undefined,
        id_cliente:         Number(form.id_cliente),
        id_estado_proyecto: Number(form.id_estado_proyecto),
      });
      toast.success("Proyecto actualizado");
      setModalOpen(false);
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="bg-white rounded-lg border p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (!proyecto) return null;

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/proyectos")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} /> Proyectos
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-900">{proyecto.nombre}</h1>
        </div>
        <Button onClick={openEdit}>
          <Pencil size={14} className="mr-2" /> Editar
        </Button>
      </div>

      {/* Info del proyecto */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-500">Cliente</span>
            <p className="font-medium">{proyecto.cliente.nombre}</p>
          </div>
          <div>
            <span className="text-gray-500">Estado</span>
            <div className="mt-0.5">
              <Badge variant="outline" className={estadoClases[proyecto.estado_proyecto.estado]}>
                {proyecto.estado_proyecto.estado}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Fecha inicio</span>
            <p className="font-medium">
              {new Date(proyecto.fecha_inicio).toLocaleDateString("es-SV")}
            </p>
          </div>
          {proyecto.fecha_fin && (
            <div>
              <span className="text-gray-500">Fecha fin</span>
              <p className="font-medium">
                {new Date(proyecto.fecha_fin).toLocaleDateString("es-SV")}
              </p>
            </div>
          )}
        </div>
        {proyecto.descripcion && (
          <div>
            <span className="text-sm text-gray-500">Descripción</span>
            <p className="text-sm mt-0.5">{proyecto.descripcion}</p>
          </div>
        )}
      </div>

      {/* Tareas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Tareas</h2>
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!proyecto.tareas || proyecto.tareas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-10">
                    Este proyecto no tiene tareas aún
                  </TableCell>
                </TableRow>
              ) : (
                proyecto.tareas.map((t) => (
                  <TableRow key={t.id_tarea}>
                    <TableCell className="font-medium">{t.tarea}</TableCell>
                    <TableCell className="text-gray-500">
                      {t.usuario.nombre} {t.usuario.apellido}
                    </TableCell>
                    <TableCell className={prioridadColor[t.prioridad.nombre_prioridad] ?? ""}>
                      {t.prioridad.nombre_prioridad}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.estado_tarea.estado}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input placeholder="Nombre del proyecto" {...field("nombre")} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <textarea
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                rows={3}
                placeholder="Descripción opcional..."
                {...field("descripcion")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select
                  value={form.id_cliente}
                  onValueChange={(v) => setForm((f) => ({ ...f, id_cliente: v ?? "" }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {form.id_cliente
                        ? clientes.find((c) => String(c.id_cliente) === form.id_cliente)?.nombre
                        : "Seleccionar..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select
                  value={form.id_estado_proyecto}
                  onValueChange={(v) => setForm((f) => ({ ...f, id_estado_proyecto: v ?? "" }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {form.id_estado_proyecto
                        ? estados.find((e) => String(e.id_estado_proyecto) === form.id_estado_proyecto)?.estado
                        : "Seleccionar..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((e) => (
                      <SelectItem key={e.id_estado_proyecto} value={String(e.id_estado_proyecto)}>
                        {e.estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha inicio *</Label>
                <Input type="date" {...field("fecha_inicio")} />
              </div>
              <div className="space-y-2">
                <Label>Fecha fin</Label>
                <Input type="date" {...field("fecha_fin")} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
