import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, FileDown, Pencil, Plus } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
import type { Proyecto, Cliente, EstadoProyecto, HistorialProyecto, Usuario, Prioridad, EstadoTarea } from "../../types";
import {
  getProyectoByIdApi, getEstadosProyectoApi,
  updateProyectoApi, getProyectoHistorialApi,
} from "../../api/proyectos.api";
import { getClientesApi } from "../../api/clientes.api";
import { createTareaApi, getPrioridadesApi, getEstadosTareaApi } from "../../api/tareas.api";
import { getUsuariosApi } from "../../api/usuarios.api";

const estadoClases: Record<string, string> = {
  "Planificación": "border-blue-300 bg-blue-50 text-blue-700",
  "En progreso":   "border-yellow-300 bg-yellow-50 text-yellow-700",
  "Finalizado":    "border-green-300 bg-green-50 text-green-700",
  "Cancelado":     "border-gray-300 bg-gray-100 text-gray-500",
  "Pausado":       "border-purple-300 bg-purple-50 text-purple-700",
};

const prioridadColor: Record<string, string> = {
  Alta:  "text-red-600",
  Media: "text-yellow-600",
  Baja:  "text-gray-500",
};

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-SV", { day: "2-digit", month: "short", year: "numeric" });

const fmtHora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" });

const emptyTareaForm = {
  tarea: "", descripcion: "", fecha_inicio: "", fecha_fin: "",
  id_usuario: "", id_prioridad: "", id_estado_tarea: "",
};

export const ProyectoDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proyecto, setProyecto]   = useState<Proyecto | null>(null);
  const [clientes, setClientes]   = useState<Cliente[]>([]);
  const [estados, setEstados]     = useState<EstadoProyecto[]>([]);
  const [historial, setHistorial] = useState<HistorialProyecto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // — Editar proyecto —
  const [form, setForm] = useState({
    nombre: "", descripcion: "", fecha_inicio: "", fecha_fin: "",
    id_cliente: "", id_estado_proyecto: "", detalle: "",
  });
  const [estadoOriginal, setEstadoOriginal] = useState("");
  const estadoCambio = form.id_estado_proyecto !== estadoOriginal && estadoOriginal !== "";

  // — Nueva tarea —
  const [tareaModalOpen, setTareaModalOpen] = useState(false);
  const [tareaForm, setTareaForm]           = useState(emptyTareaForm);
  const [savingTarea, setSavingTarea]       = useState(false);
  const [usuarios, setUsuarios]             = useState<Usuario[]>([]);
  const [prioridades, setPrioridades]       = useState<Prioridad[]>([]);
  const [estadosTarea, setEstadosTarea]     = useState<EstadoTarea[]>([]);
  const [catalogsLoaded, setCatalogsLoaded] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [p, c, e, h] = await Promise.all([
        getProyectoByIdApi(Number(id)),
        getClientesApi(),
        getEstadosProyectoApi(),
        getProyectoHistorialApi(Number(id)),
      ]);
      setProyecto(p);
      setClientes(c.data);
      setEstados(e);
      setHistorial(h);
    } catch {
      toast.error("No se pudo cargar el proyecto");
      navigate("/proyectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // Carga catálogos de tarea la primera vez que se abre el modal
  const openTareaModal = async () => {
    setTareaForm(emptyTareaForm);
    setTareaModalOpen(true);
    if (!catalogsLoaded) {
      try {
        const [u, p, e] = await Promise.all([
          getUsuariosApi(),
          getPrioridadesApi(),
          getEstadosTareaApi(),
        ]);
        setUsuarios(u.data.filter((usr) => usr.activo));
        setPrioridades(p);
        setEstadosTarea(e);
        setCatalogsLoaded(true);
      } catch {
        toast.error("No se pudieron cargar los catálogos");
      }
    }
  };

  const handleSaveTarea = async () => {
    if (!tareaForm.tarea || !tareaForm.fecha_inicio || !tareaForm.id_usuario ||
        !tareaForm.id_prioridad || !tareaForm.id_estado_tarea) {
      toast.error("Nombre, fecha inicio, responsable, prioridad y estado son obligatorios");
      return;
    }
    try {
      setSavingTarea(true);
      await createTareaApi({
        tarea:           tareaForm.tarea,
        descripcion:     tareaForm.descripcion || undefined,
        fecha_inicio:    tareaForm.fecha_inicio,
        fecha_fin:       tareaForm.fecha_fin || undefined,
        id_proyecto:     Number(id),
        id_usuario:      Number(tareaForm.id_usuario),
        id_prioridad:    Number(tareaForm.id_prioridad),
        id_estado_tarea: Number(tareaForm.id_estado_tarea),
      });
      toast.success("Tarea creada");
      setTareaModalOpen(false);
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear la tarea");
    } finally {
      setSavingTarea(false);
    }
  };

  const tareaField = (key: keyof typeof emptyTareaForm) => ({
    value: tareaForm[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setTareaForm((f) => ({ ...f, [key]: e.target.value })),
  });

  // — Editar proyecto —
  const openEdit = () => {
    if (!proyecto) return;
    const estadoStr = String(proyecto.id_estado_proyecto);
    setEstadoOriginal(estadoStr);
    setForm({
      nombre:             proyecto.nombre,
      descripcion:        proyecto.descripcion ?? "",
      fecha_inicio:       proyecto.fecha_inicio.slice(0, 10),
      fecha_fin:          proyecto.fecha_fin ? proyecto.fecha_fin.slice(0, 10) : "",
      id_cliente:         String(proyecto.id_cliente),
      id_estado_proyecto: estadoStr,
      detalle:            "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.fecha_inicio || !form.id_cliente || !form.id_estado_proyecto) {
      toast.error("Nombre, fecha de inicio, cliente y estado son obligatorios");
      return;
    }
    if (estadoCambio && !form.detalle.trim()) {
      toast.error("El detalle es obligatorio al cambiar el estado");
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
        detalle:            estadoCambio ? form.detalle.trim() : undefined,
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

  const exportarPDF = () => {
    if (!proyecto) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const fechaExport = new Date().toLocaleDateString("es-SV", {
      day: "2-digit", month: "short", year: "numeric",
    });

    // — App name + fecha de exportación (top right) —
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(`Sistema de Proyectos · Exportado el ${fechaExport}`, pageWidth - 14, 10, { align: "right" });
    doc.setTextColor(0, 0, 0);

    // — Encabezado —
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(proyecto.nombre, 14, 20);
    doc.setDrawColor(200);
    doc.line(14, 24, 196, 24);

    // — Info del proyecto —
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let y = 32;
    const campo = (label: string, valor: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(valor, 50, y);
      y += 7;
    };
    campo("Cliente",      proyecto.cliente.nombre);
    campo("Estado",       proyecto.estado_proyecto.estado);
    campo("Fecha inicio", new Date(proyecto.fecha_inicio).toLocaleDateString("es-SV"));
    if (proyecto.fecha_fin)
      campo("Fecha fin",  new Date(proyecto.fecha_fin).toLocaleDateString("es-SV"));
    if (proyecto.descripcion) {
      doc.setFont("helvetica", "bold");
      doc.text("Descripción:", 14, y); y += 6;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(proyecto.descripcion, 180);
      doc.text(lines, 14, y);
      y += (lines as string[]).length * 5 + 4;
    }

    // — Resumen de tareas —
    const tareas = proyecto.tareas ?? [];
    const completadas = tareas.filter((t) => t.estado_tarea.estado === "Completada").length;
    const enProgreso  = tareas.filter((t) => t.estado_tarea.estado === "En progreso").length;
    const pendientes  = tareas.filter((t) => t.estado_tarea.estado === "Pendiente").length;
    const canceladas  = tareas.filter((t) => t.estado_tarea.estado === "Cancelada").length;

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Tareas", 14, y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Total: ${tareas.length}  ·  Completadas: ${completadas}  ·  En progreso: ${enProgreso}  ·  Pendientes: ${pendientes}${canceladas > 0 ? `  ·  Canceladas: ${canceladas}` : ""}`,
      14, y + 6,
    );
    doc.setTextColor(0, 0, 0);
    y += 12;

    // — Tabla de tareas con colores semánticos —
    const PRIORIDAD_RGB: Record<string, [number, number, number]> = {
      "Crítica": [239, 68, 68],
      "Alta":    [249, 115, 22],
      "Media":   [59, 130, 246],
      "Baja":    [156, 163, 175],
    };
    const ESTADO_TAREA_RGB: Record<string, [number, number, number]> = {
      "Pendiente":   [156, 163, 175],
      "En progreso": [202, 138, 4],
      "Completada":  [34, 197, 94],
      "Cancelada":   [239, 68, 68],
    };

    autoTable(doc, {
      startY: y,
      head: [["Tarea", "Responsable", "Prioridad", "Estado", "Fecha fin"]],
      body: tareas.map((t) => [
        t.tarea,
        `${t.usuario.nombre} ${t.usuario.apellido}`,
        t.prioridad.nombre_prioridad,
        t.estado_tarea.estado,
        t.fecha_fin ? new Date(t.fecha_fin).toLocaleDateString("es-SV") : "—",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      didParseCell: (data) => {
        if (data.section !== "body") return;
        if (data.column.index === 2) {
          const color = PRIORIDAD_RGB[data.cell.raw as string];
          if (color) data.cell.styles.textColor = color;
        }
        if (data.column.index === 3) {
          const color = ESTADO_TAREA_RGB[data.cell.raw as string];
          if (color) data.cell.styles.textColor = color;
        }
      },
    });

    // — Historial de estados —
    if (historial.length > 0) {
      const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Historial de estados", 14, afterTable);
      autoTable(doc, {
        startY: afterTable + 4,
        head: [["Estado", "Usuario", "Fecha", "Detalle"]],
        body: historial.map((h) => [
          h.estado_proyecto.estado,
          `${h.usuario.nombre} ${h.usuario.apellido}`,
          fmtFecha(h.fecha_cambio),
          h.detalle ?? "",
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [107, 114, 128] },
      });
    }

    // — Pie de página con número de páginas —
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${totalPages} · ${fechaExport}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 8,
        { align: "center" },
      );
    }

    doc.save(`proyecto-${proyecto.id_proyecto}-${proyecto.nombre.replace(/\s+/g, "_")}.pdf`);
  };

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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportarPDF}>
            <FileDown size={14} className="mr-2" /> Exportar PDF
          </Button>
          <Button onClick={openEdit}>
            <Pencil size={14} className="mr-2" /> Editar
          </Button>
        </div>
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
            <p className="font-medium">{new Date(proyecto.fecha_inicio).toLocaleDateString("es-SV")}</p>
          </div>
          {proyecto.fecha_fin && (
            <div>
              <span className="text-gray-500">Fecha fin</span>
              <p className="font-medium">{new Date(proyecto.fecha_fin).toLocaleDateString("es-SV")}</p>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Tareas</h2>
          <Button size="sm" onClick={openTareaModal}>
            <Plus size={14} className="mr-1" /> Nueva tarea
          </Button>
        </div>
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

      {/* Historial de estados */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Historial de estados</h2>
        {historial.length === 0 ? (
          <div className="bg-white rounded-lg border p-6 text-center text-sm text-gray-400">
            Aún no hay cambios de estado registrados
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-6">
            <ol className="relative border-l border-gray-200 space-y-6 ml-3">
              {historial.map((h) => (
                <li key={h.id_historial} className="ml-6">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-gray-300" />
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="outline" className={estadoClases[h.estado_proyecto.estado] ?? ""}>
                      {h.estado_proyecto.estado}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {fmtFecha(h.fecha_cambio)} · {fmtHora(h.fecha_cambio)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {h.usuario.nombre} {h.usuario.apellido}
                  </p>
                  {h.detalle && (
                    <p className="text-sm text-gray-500 mt-0.5 italic">"{h.detalle}"</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Modal editar proyecto */}
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
            {estadoCambio && (
              <div className="space-y-2">
                <Label>
                  Detalle del cambio de estado *
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (¿por qué cambia a "{estados.find((e) => String(e.id_estado_proyecto) === form.id_estado_proyecto)?.estado}"?)
                  </span>
                </Label>
                <textarea
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                  rows={2}
                  placeholder="Describe el motivo del cambio..."
                  {...field("detalle")}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal nueva tarea */}
      <Dialog open={tareaModalOpen} onOpenChange={setTareaModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Proyecto (solo lectura) */}
            <div className="space-y-2">
              <Label>Proyecto</Label>
              <Input value={proyecto.nombre} disabled className="bg-gray-50 text-gray-500" />
            </div>
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input placeholder="Nombre de la tarea" {...tareaField("tarea")} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <textarea
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                rows={2}
                placeholder="Descripción opcional..."
                {...tareaField("descripcion")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Responsable *</Label>
                <Select
                  value={tareaForm.id_usuario}
                  onValueChange={(v) => setTareaForm((f) => ({ ...f, id_usuario: v ?? "" }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {tareaForm.id_usuario
                        ? (() => { const u = usuarios.find((u) => String(u.id_usuario) === tareaForm.id_usuario); return u ? `${u.nombre} ${u.apellido}` : "Seleccionar..."; })()
                        : "Seleccionar..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((u) => (
                      <SelectItem key={u.id_usuario} value={String(u.id_usuario)}>
                        {u.nombre} {u.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridad *</Label>
                <Select
                  value={tareaForm.id_prioridad}
                  onValueChange={(v) => setTareaForm((f) => ({ ...f, id_prioridad: v ?? "" }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {tareaForm.id_prioridad
                        ? prioridades.find((p) => String(p.id_prioridad) === tareaForm.id_prioridad)?.nombre_prioridad
                        : "Seleccionar..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map((p) => (
                      <SelectItem key={p.id_prioridad} value={String(p.id_prioridad)}>
                        {p.nombre_prioridad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select
                  value={tareaForm.id_estado_tarea}
                  onValueChange={(v) => setTareaForm((f) => ({ ...f, id_estado_tarea: v ?? "" }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {tareaForm.id_estado_tarea
                        ? estadosTarea.find((e) => String(e.id_estado_tarea) === tareaForm.id_estado_tarea)?.estado
                        : "Seleccionar..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {estadosTarea.map((e) => (
                      <SelectItem key={e.id_estado_tarea} value={String(e.id_estado_tarea)}>
                        {e.estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha inicio *</Label>
                <Input type="date" {...tareaField("fecha_inicio")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fecha fin</Label>
              <Input type="date" {...tareaField("fecha_fin")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTareaModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveTarea} disabled={savingTarea}>
              {savingTarea ? "Guardando..." : "Crear tarea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
