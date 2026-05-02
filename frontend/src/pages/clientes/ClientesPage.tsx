import { useEffect, useState } from "react";
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
import type { Cliente, Empresa, EstadoCliente, PaginationMeta } from "../../types";
import { Pagination } from "../../components/ui/pagination";
import {
  getClientesApi, getEmpresasApi, getEstadosClienteApi,
  createClienteApi, updateClienteApi, deleteClienteApi,
} from "../../api/clientes.api";

const estadoBadgeVariant = (estado: string) => {
  if (estado === "Activo")    return "default";
  if (estado === "Prospecto") return "secondary";
  return "outline";
};

const emptyForm = {
  nombre: "", correo: "", telefono: "", id_empresa: "", id_estado_cliente: "",
};

export const ClientesPage = () => {
  const [clientes, setClientes]           = useState<Cliente[]>([]);
  const [empresas, setEmpresas]           = useState<Empresa[]>([]);
  const [estados, setEstados]             = useState<EstadoCliente[]>([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);

  const [busqueda, setBusqueda]           = useState("");
  const [filtroEmpresa, setFiltroEmpresa] = useState("all");
  const [filtroEstado, setFiltroEstado]   = useState("all");

  const [page, setPage]                   = useState(1);
  const [meta, setMeta]                   = useState<PaginationMeta | null>(null);

  const [modalOpen, setModalOpen]         = useState(false);
  const [selected, setSelected]           = useState<Cliente | null>(null);
  const [form, setForm]                   = useState(emptyForm);

  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [toDelete, setToDelete]           = useState<Cliente | null>(null);
  const [deleting, setDeleting]           = useState(false);

  const load = async (search: string, empresa: string, estado: string, p: number) => {
    try {
      setLoading(true);
      const res = await getClientesApi({
        page: p,
        limit: 10,
        search: search || undefined,
        id_empresa: empresa !== "all" ? Number(empresa) : undefined,
        id_estado_cliente: estado !== "all" ? Number(estado) : undefined,
      });
      setClientes(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("No se pudo cargar la lista de clientes");
    } finally {
      setLoading(false);
    }
  };

  // Load catalogs once
  useEffect(() => {
    Promise.all([getEmpresasApi(), getEstadosClienteApi()])
      .then(([e, es]) => { setEmpresas(e); setEstados(es); })
      .catch(() => toast.error("No se pudieron cargar los catálogos"));
  }, []);

  useEffect(() => { load("", "all", "all", 1); }, []);

  // Debounce busqueda → page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load(busqueda, filtroEmpresa, filtroEstado, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setSelected(c);
    setForm({
      nombre:            c.nombre,
      correo:            c.correo ?? "",
      telefono:          c.telefono ?? "",
      id_empresa:        String(c.id_empresa),
      id_estado_cliente: String(c.id_estado_cliente),
    });
    setModalOpen(true);
  };

  const openConfirm = (c: Cliente) => {
    setToDelete(c);
    setConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.id_empresa || !form.id_estado_cliente) {
      toast.error("Nombre, empresa y estado son obligatorios");
      return;
    }

    const payload = {
      nombre:            form.nombre,
      correo:            form.correo   || undefined,
      telefono:          form.telefono || undefined,
      id_empresa:        Number(form.id_empresa),
      id_estado_cliente: Number(form.id_estado_cliente),
    };

    try {
      setSaving(true);
      if (selected) {
        await updateClienteApi(selected.id_cliente, payload);
        toast.success("Cliente actualizado");
      } else {
        await createClienteApi(payload);
        toast.success("Cliente creado");
      }
      setModalOpen(false);
      load(busqueda, filtroEmpresa, filtroEstado, page);
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
      await deleteClienteApi(toDelete.id_cliente);
      toast.success(`${toDelete.nombre} eliminado`);
      setConfirmOpen(false);
      load(busqueda, filtroEmpresa, filtroEstado, page);
    } catch {
      toast.error("No se pudo eliminar el cliente");
    } finally {
      setDeleting(false);
    }
  };

  const field = (key: keyof typeof emptyForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" /> Nuevo cliente
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
          value={filtroEmpresa}
          onValueChange={(v) => {
            const val = v ?? "all";
            setFiltroEmpresa(val);
            setPage(1);
            load(busqueda, val, filtroEstado, 1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue>
              {filtroEmpresa === "all"
                ? "Empresa"
                : empresas.find((e) => String(e.id_empresa) === filtroEmpresa)?.nombre ?? "Empresa"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las empresas</SelectItem>
            {empresas.map((e) => (
              <SelectItem key={e.id_empresa} value={String(e.id_empresa)}>
                {e.nombre}
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
            load(busqueda, filtroEmpresa, val, 1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {filtroEstado === "all"
                ? "Estado"
                : estados.find((e) => String(e.id_estado_cliente) === filtroEstado)?.estado ?? "Estado"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {estados.map((e) => (
              <SelectItem key={e.id_estado_cliente} value={String(e.id_estado_cliente)}>
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
              <TableHead>Empresa</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
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
              : clientes.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                )
              : clientes.map((c) => (
                  <TableRow key={c.id_cliente}>
                    <TableCell className="font-medium">{c.nombre}</TableCell>
                    <TableCell className="text-gray-500">{c.empresa.nombre}</TableCell>
                    <TableCell className="text-gray-500">{c.correo || "—"}</TableCell>
                    <TableCell className="text-gray-500">{c.telefono || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={estadoBadgeVariant(c.estado_cliente.estado)}>
                        {c.estado_cliente.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors">
                          <MoreHorizontal size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(c)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openConfirm(c)}
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
            onChange={(p) => { setPage(p); load(busqueda, filtroEmpresa, filtroEstado, p); }}
          />
        )}
      </div>

      {/* Modal crear / editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selected ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input placeholder="Juan Pérez" {...field("nombre")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input type="email" placeholder="correo@ejemplo.com" {...field("correo")} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input placeholder="+503 7000-0000" {...field("telefono")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Empresa *</Label>
                <Select
                  value={form.id_empresa}
                  onValueChange={(v) => setForm((f) => ({ ...f, id_empresa: v ?? "" }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {form.id_empresa
                        ? empresas.find((e) => String(e.id_empresa) === form.id_empresa)?.nombre
                        : "Seleccionar..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id_empresa} value={String(e.id_empresa)}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select
                  value={form.id_estado_cliente}
                  onValueChange={(v) => setForm((f) => ({ ...f, id_estado_cliente: v ?? "" }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {form.id_estado_cliente
                        ? estados.find((e) => String(e.id_estado_cliente) === form.id_estado_cliente)?.estado
                        : "Seleccionar..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((e) => (
                      <SelectItem key={e.id_estado_cliente} value={String(e.id_estado_cliente)}>
                        {e.estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <DialogTitle>Eliminar cliente</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Eliminar a{" "}
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
