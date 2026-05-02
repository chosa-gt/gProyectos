import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Search, X, ExternalLink } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import type { Tarea, Proyecto, Usuario, Prioridad, EstadoTarea, PaginationMeta } from "../../types";
import { Pagination } from "../../components/ui/pagination";
import {
  getTareasApi, getPrioridadesApi, getEstadosTareaApi,
  createTareaApi, updateTareaApi, deleteTareaApi,
} from "../../api/tareas.api";
import { getProyectosApi } from "../../api/proyectos.api";
import { getUsuariosApi } from "../../api/usuarios.api";

const prioridadClases: Record<string, string> = {
  "Crítica": "border-red-300 bg-red-50 text-red-700",
  "Alta":    "border-orange-300 bg-orange-50 text-orange-700",
  "Media":   "border-blue-300 bg-blue-50 text-blue-700",
  "Baja":    "border-gray-300 bg-gray-100 text-gray-500",
};

const estadoClases: Record<string, string> = {
  "Pendiente":   "border-gray-300 bg-gray-100 text-gray-500",
  "En progreso": "border-yellow-300 bg-yellow-50 text-yellow-700",
  "Completada":  "border-green-300 bg-green-50 text-green-700",
  "Cancelada":   "border-red-300 bg-red-50 text-red-700",
};

const emptyForm = {
  tarea: "", descripcion: "", fecha_inicio: "", fecha_fin: "",
  id_proyecto: "", id_usuario: "", id_prioridad: "", id_estado_tarea: "",
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString("es-SV");

export const TareasPage = () => {
  const navigate = useNavigate();

  const [tareas, setTareas]               = useState<Tarea[]>([]);
  const [proyectos, setProyectos]         = useState<Proyecto[]>([]);
  const [usuarios, setUsuarios]           = useState<Usuario[]>([]);
  const [prioridades, setPrioridades]     = useState<Prioridad[]>([]);
  const [estadosTarea, setEstadosTarea]   = useState<EstadoTarea[]>([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);

  const [busqueda, setBusqueda]               = useState("");
  const [filtroProyecto, setFiltroProyecto]   = useState("all");
  const [filtroPrioridad, setFiltroPrioridad] = useState("all");
  const [filtroEstado, setFiltroEstado]       = useState("all");

  const [page, setPage]                   = useState(1);
  const [meta, setMeta]                   = useState<PaginationMeta | null>(null);

  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [drawerTarea, setDrawerTarea] = useState<Tarea | null>(null);

  const [modalOpen, setModalOpen]     = useState(false);
  const [selected, setSelected]       = useState<Tarea | null>(null);
  const [form, setForm]               = useState(emptyForm);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete]       = useState<Tarea | null>(null);
  const [deleting, setDeleting]       = useState(false);

  const load = async (search: string, proyecto: string, prioridad: string, estado: string, p: number) => {
    try {
      setLoading(true);
      const res = await getTareasApi({
        page: p,
        limit: 10,
        search: search || undefined,
        id_proyecto: proyecto !== "all" ? Number(proyecto) : undefined,
        id_prioridad: prioridad !== "all" ? Number(prioridad) : undefined,
        id_estado_tarea: estado !== "all" ? Number(estado) : undefined,
      });
      setTareas(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("No se pudo cargar la lista de tareas");
    } finally {
      setLoading(false);
    }
  };

  // Load catalogs once
  useEffect(() => {
    Promise.all([
      getProyectosApi(),
      getUsuariosApi(),
      getPrioridadesApi(),
      getEstadosTareaApi(),
    ]).then(([pr, ur, prioridades, estados]) => {
      setProyectos(pr.data);
      setUsuarios(ur.data.filter((u) => u.activo));
      setPrioridades(prioridades);
      setEstadosTarea(estados);
    }).catch(() => toast.error("No se pudieron cargar los catálogos"));
  }, []);

  useEffect(() => { load("", "all", "all", "all", 1); }, []);

  // Debounce busqueda → page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load(busqueda, filtroProyecto, filtroPrioridad, filtroEstado, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const openDrawer = (t: Tarea) => {
    setDrawerTarea(t);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: Tarea) => {
    setDrawerOpen(false);
    setSelected(t);
    setForm({
      tarea:           t.tarea,
      descripcion:     t.descripcion ?? "",
      fecha_inicio:    t.fecha_inicio.slice(0, 10),
      fecha_fin:       t.fecha_fin ? t.fecha_fin.slice(0, 10) : "",
      id_proyecto:     String(t.id_proyecto),
      id_usuario:      String(t.id_usuario),
      id_prioridad:    String(t.id_prioridad),
      id_estado_tarea: String(t.id_estado_tarea),
    });
    setModalOpen(true);
  };

  const openConfirm = (t: Tarea) => {
    setDrawerOpen(false);
    setToDelete(t);
    setConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!form.tarea || !form.fecha_inicio || !form.id_proyecto ||
        !form.id_usuario || !form.id_prioridad || !form.id_estado_tarea) {
      toast.error("Nombre, fecha inicio, proyecto, responsable, prioridad y estado son obligatorios");
      return;
    }
    const payload = {
      tarea:           form.tarea,
      descripcion:     form.descripcion || undefined,
      fecha_inicio:    form.fecha_inicio,
      fecha_fin:       form.fecha_fin || undefined,
      id_proyecto:     Number(form.id_proyecto),
      id_usuario:      Number(form.id_usuario),
      id_prioridad:    Number(form.id_prioridad),
      id_estado_tarea: Number(form.id_estado_tarea),
    };
    try {
      setSaving(true);
      if (selected) {
        await updateTareaApi(selected.id_tarea, payload);
        toast.success("Tarea actualizada");
      } else {
        await createTareaApi(payload);
        toast.success("Tarea creada");
      }
      setModalOpen(false);
      load(busqueda, filtroProyecto, filtroPrioridad, filtroEstado, page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      await deleteTareaApi(toDelete.id_tarea);
      toast.success("Tarea eliminada");
      setConfirmOpen(false);
      load(busqueda, filtroProyecto, filtroPrioridad, filtroEstado, page);
    } catch {
      toast.error("No se pudo eliminar la tarea");
    } finally {
      setDeleting(false);
    }
  };

  const fieldInput = (key: keyof typeof emptyForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const selectValue = (key: keyof typeof emptyForm, items: { label: string; value: string }[]) => ({
    value: form[key],
    display: form[key] ? items.find((i) => i.value === form[key])?.label ?? "Seleccionar..." : "Seleccionar...",
    onValueChange: (v: string | null) => setForm((f) => ({ ...f, [key]: v ?? "" })),
  });

  const proyectoItems  = proyectos.map((p) => ({ label: p.nombre, value: String(p.id_proyecto) }));
  const usuarioItems   = usuarios.map((u)  => ({ label: `${u.nombre} ${u.apellido}`, value: String(u.id_usuario) }));
  const prioridadItems = prioridades.map((p) => ({ label: p.nombre_prioridad, value: String(p.id_prioridad) }));
  const estadoItems    = estadosTarea.map((e) => ({ label: e.estado, value: String(e.id_estado_tarea) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" /> Nueva tarea
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-8"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {[
          { label: "Proyecto",  value: filtroProyecto,  setter: setFiltroProyecto,  items: proyectoItems,  width: "w-44" },
          { label: "Prioridad", value: filtroPrioridad, setter: setFiltroPrioridad, items: prioridadItems, width: "w-36" },
          { label: "Estado",    value: filtroEstado,    setter: setFiltroEstado,    items: estadoItems,    width: "w-36" },
        ].map(({ label, value, setter, items, width }) => (
          <Select
            key={label}
            value={value}
            onValueChange={(v) => {
              const val = v ?? "all";
              setter(val);
              setPage(1);
              const newProyecto  = label === "Proyecto"  ? val : filtroProyecto;
              const newPrioridad = label === "Prioridad" ? val : filtroPrioridad;
              const newEstado    = label === "Estado"    ? val : filtroEstado;
              load(busqueda, newProyecto, newPrioridad, newEstado, 1);
            }}
          >
            <SelectTrigger className={width}>
              <SelectValue>
                {value === "all" ? label : items.find((i) => i.value === value)?.label ?? label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {items.map((i) => (
                <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarea</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : tareas.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                      No se encontraron tareas
                    </TableCell>
                  </TableRow>
                )
              : tareas.map((t) => (
                  <TableRow
                    key={t.id_tarea}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => openDrawer(t)}
                  >
                    <TableCell className="font-medium">{t.tarea}</TableCell>
                    <TableCell className="text-gray-500">{t.proyecto.nombre}</TableCell>
                    <TableCell className="text-gray-500">
                      {t.usuario.nombre} {t.usuario.apellido}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={prioridadClases[t.prioridad.nombre_prioridad]}>
                        {t.prioridad.nombre_prioridad}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={estadoClases[t.estado_tarea.estado]}>
                        {t.estado_tarea.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(t); }}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); openConfirm(t); }}>
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {meta && (
          <Pagination
            meta={meta}
            onChange={(p) => { setPage(p); load(busqueda, filtroProyecto, filtroPrioridad, filtroEstado, p); }}
          />
        )}
      </div>

      {/* Drawer detalle */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeDrawer}
          />
          {/* Panel */}
          <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            {/* Cabecera */}
            <div className="flex items-start justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 pr-4 leading-snug">
                {drawerTarea?.tarea}
              </h2>
              <button
                onClick={closeDrawer}
                className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Proyecto */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Proyecto</p>
                <button
                  onClick={() => navigate(`/proyectos/${drawerTarea?.id_proyecto}`)}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                >
                  {drawerTarea?.proyecto.nombre}
                  <ExternalLink size={13} />
                </button>
              </div>

              {/* Responsable */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Responsable</p>
                <p className="text-sm">{drawerTarea?.usuario.nombre} {drawerTarea?.usuario.apellido}</p>
              </div>

              {/* Prioridad y Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Prioridad</p>
                  {drawerTarea && (
                    <Badge variant="outline" className={prioridadClases[drawerTarea.prioridad.nombre_prioridad]}>
                      {drawerTarea.prioridad.nombre_prioridad}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Estado</p>
                  {drawerTarea && (
                    <Badge variant="outline" className={estadoClases[drawerTarea.estado_tarea.estado]}>
                      {drawerTarea.estado_tarea.estado}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Fecha inicio</p>
                  <p className="text-sm">{drawerTarea && fmt(drawerTarea.fecha_inicio)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Fecha fin</p>
                  <p className="text-sm">{drawerTarea?.fecha_fin ? fmt(drawerTarea.fecha_fin) : "—"}</p>
                </div>
              </div>

              {/* Descripción */}
              {drawerTarea?.descripcion && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Descripción</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{drawerTarea.descripcion}</p>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => drawerTarea && openConfirm(drawerTarea)}>
                Eliminar
              </Button>
              <Button onClick={() => drawerTarea && openEdit(drawerTarea)}>
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear / editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input placeholder="Nombre de la tarea" {...fieldInput("tarea")} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <textarea
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                rows={2}
                placeholder="Descripción opcional..."
                {...fieldInput("descripcion")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Proyecto *",    sv: selectValue("id_proyecto",     proyectoItems),  items: proyectoItems  },
                { label: "Responsable *", sv: selectValue("id_usuario",      usuarioItems),   items: usuarioItems   },
                { label: "Prioridad *",   sv: selectValue("id_prioridad",    prioridadItems), items: prioridadItems },
                { label: "Estado *",      sv: selectValue("id_estado_tarea", estadoItems),    items: estadoItems    },
              ].map(({ label, sv, items }) => (
                <div key={label} className="space-y-2">
                  <Label>{label}</Label>
                  <Select value={sv.value} onValueChange={sv.onValueChange}>
                    <SelectTrigger>
                      <SelectValue>{sv.display}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((i) => (
                        <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha inicio *</Label>
                <Input type="date" {...fieldInput("fecha_inicio")} />
              </div>
              <div className="space-y-2">
                <Label>Fecha fin</Label>
                <Input type="date" {...fieldInput("fecha_fin")} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo confirmar eliminar */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar tarea</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Eliminar la tarea{" "}
            <span className="font-medium">{toDelete?.tarea}</span>
            ? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
