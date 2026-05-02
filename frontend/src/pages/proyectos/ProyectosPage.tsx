import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Search } from "lucide-react";
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
import type { Proyecto, Cliente, EstadoProyecto, PaginationMeta } from "../../types";
import { Pagination } from "../../components/ui/pagination";
import {
  getProyectosApi, getEstadosProyectoApi,
  createProyectoApi, updateProyectoApi, deleteProyectoApi,
} from "../../api/proyectos.api";
import { getClientesApi } from "../../api/clientes.api";

const estadoClases: Record<string, string> = {
  "Planificación": "border-blue-300 bg-blue-50 text-blue-700",
  "En progreso":   "border-yellow-300 bg-yellow-50 text-yellow-700",
  "Finalizado":    "border-green-300 bg-green-50 text-green-700",
  "Cancelado":     "border-gray-300 bg-gray-100 text-gray-500",
};

const emptyForm = {
  nombre: "", descripcion: "", fecha_inicio: "", fecha_fin: "",
  id_cliente: "", id_estado_proyecto: "",
};

export const ProyectosPage = () => {
  const navigate = useNavigate();

  const [proyectos, setProyectos]         = useState<Proyecto[]>([]);
  const [clientes, setClientes]           = useState<Cliente[]>([]);
  const [estados, setEstados]             = useState<EstadoProyecto[]>([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);

  const [busqueda, setBusqueda]           = useState("");
  const [filtroCliente, setFiltroCliente] = useState("all");
  const [filtroEstado, setFiltroEstado]   = useState("all");

  const [page, setPage]                   = useState(1);
  const [meta, setMeta]                   = useState<PaginationMeta | null>(null);

  const [modalOpen, setModalOpen]         = useState(false);
  const [selected, setSelected]           = useState<Proyecto | null>(null);
  const [form, setForm]                   = useState(emptyForm);

  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [toDelete, setToDelete]           = useState<Proyecto | null>(null);
  const [deleting, setDeleting]           = useState(false);

  const load = async (search: string, cliente: string, estado: string, p: number) => {
    try {
      setLoading(true);
      const res = await getProyectosApi({
        page: p,
        limit: 10,
        search: search || undefined,
        id_cliente: cliente !== "all" ? Number(cliente) : undefined,
        id_estado_proyecto: estado !== "all" ? Number(estado) : undefined,
      });
      setProyectos(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("No se pudo cargar la lista de proyectos");
    } finally {
      setLoading(false);
    }
  };

  // Load catalogs once
  useEffect(() => {
    Promise.all([getClientesApi(), getEstadosProyectoApi()])
      .then(([cr, e]) => { setClientes(cr.data); setEstados(e); })
      .catch(() => toast.error("No se pudieron cargar los catálogos"));
  }, []);

  useEffect(() => { load("", "all", "all", 1); }, []);

  // Debounce busqueda → page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load(busqueda, filtroCliente, filtroEstado, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: Proyecto, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(p);
    setForm({
      nombre:             p.nombre,
      descripcion:        p.descripcion ?? "",
      fecha_inicio:       p.fecha_inicio.slice(0, 10),
      fecha_fin:          p.fecha_fin ? p.fecha_fin.slice(0, 10) : "",
      id_cliente:         String(p.id_cliente),
      id_estado_proyecto: String(p.id_estado_proyecto),
    });
    setModalOpen(true);
  };

  const openConfirm = (p: Proyecto, e: React.MouseEvent) => {
    e.stopPropagation();
    setToDelete(p);
    setConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.fecha_inicio || !form.id_cliente || !form.id_estado_proyecto) {
      toast.error("Nombre, fecha de inicio, cliente y estado son obligatorios");
      return;
    }

    const payload = {
      nombre:             form.nombre,
      descripcion:        form.descripcion || undefined,
      fecha_inicio:       form.fecha_inicio,
      fecha_fin:          form.fecha_fin || undefined,
      id_cliente:         Number(form.id_cliente),
      id_estado_proyecto: Number(form.id_estado_proyecto),
    };

    try {
      setSaving(true);
      if (selected) {
        await updateProyectoApi(selected.id_proyecto, payload);
        toast.success("Proyecto actualizado");
      } else {
        await createProyectoApi(payload);
        toast.success("Proyecto creado");
      }
      setModalOpen(false);
      load(busqueda, filtroCliente, filtroEstado, page);
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
      await deleteProyectoApi(toDelete.id_proyecto);
      toast.success(`${toDelete.nombre} eliminado`);
      setConfirmOpen(false);
      load(busqueda, filtroCliente, filtroEstado, page);
    } catch {
      toast.error("No se pudo eliminar el proyecto");
    } finally {
      setDeleting(false);
    }
  };

  const field = (key: keyof typeof emptyForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" /> Nuevo proyecto
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
        <Select
          value={filtroCliente}
          onValueChange={(v) => {
            const val = v ?? "all";
            setFiltroCliente(val);
            setPage(1);
            load(busqueda, val, filtroEstado, 1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue>
              {filtroCliente === "all"
                ? "Cliente"
                : clientes.find((c) => String(c.id_cliente) === filtroCliente)?.nombre ?? "Cliente"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clientes</SelectItem>
            {clientes.map((c) => (
              <SelectItem key={c.id_cliente} value={String(c.id_cliente)}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filtroEstado}
          onValueChange={(v) => {
            const val = v ?? "all";
            setFiltroEstado(val);
            setPage(1);
            load(busqueda, filtroCliente, val, 1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {filtroEstado === "all"
                ? "Estado"
                : estados.find((e) => String(e.id_estado_proyecto) === filtroEstado)?.estado ?? "Estado"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {estados.map((e) => (
              <SelectItem key={e.id_estado_proyecto} value={String(e.id_estado_proyecto)}>
                {e.estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha inicio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : proyectos.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400 py-10">
                      No se encontraron proyectos
                    </TableCell>
                  </TableRow>
                )
              : proyectos.map((p) => (
                  <TableRow
                    key={p.id_proyecto}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/proyectos/${p.id_proyecto}`)}
                  >
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell className="text-gray-500">{p.cliente.nombre}</TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(p.fecha_inicio).toLocaleDateString("es-SV")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={estadoClases[p.estado_proyecto.estado]}>
                        {p.estado_proyecto.estado}
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
                          <DropdownMenuItem onClick={(e) => openEdit(p, e)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => openConfirm(p, e)}
                          >
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
            onChange={(p) => { setPage(p); load(busqueda, filtroCliente, filtroEstado, p); }}
          />
        )}
      </div>

      {/* Modal crear / editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected ? "Editar proyecto" : "Nuevo proyecto"}</DialogTitle>
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

      {/* Diálogo confirmar eliminar */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar proyecto</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Eliminar{" "}
            <span className="font-medium">{toDelete?.nombre}</span>
            ? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
