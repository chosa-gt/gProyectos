import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import {
  getEmpresasApi as getEmpresasConConteoApi,
  createEmpresaApi, updateEmpresaApi, deleteEmpresaApi,
  type EmpresaConConteo,
} from "../../api/empresas.api";
import { useAuthStore } from "../../store/auth.store";

const estadoBadgeVariant = (estado: string) => {
  if (estado === "Activo")    return "default";
  if (estado === "Prospecto") return "secondary";
  return "outline";
};

const emptyForm = {
  nombre: "", correo: "", telefono: "", id_empresa: "", id_estado_cliente: "",
};

export const ClientesPage = () => {
  const { usuario: me } = useAuthStore();
  const isAdmin = me?.id_rol === 1;

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

  // — Empresas dialog —
  const [empDialogOpen, setEmpDialogOpen]     = useState(false);
  const [empList, setEmpList]                 = useState<EmpresaConConteo[]>([]);
  const [empLoading, setEmpLoading]           = useState(false);
  const [empForm, setEmpForm]                 = useState("");
  const [empSelected, setEmpSelected]         = useState<EmpresaConConteo | null>(null);
  const [empSaving, setEmpSaving]             = useState(false);
  const [empConfirmOpen, setEmpConfirmOpen]   = useState(false);
  const [empToDelete, setEmpToDelete]         = useState<EmpresaConConteo | null>(null);
  const [empDeleting, setEmpDeleting]         = useState(false);

  const loadCatalogs = async () => {
    const [e, es] = await Promise.all([getEmpresasApi(), getEstadosClienteApi()]);
    setEmpresas(e);
    setEstados(es);
  };

  const load = async (search: string, empresa: string, estado: string, p: number) => {
    try {
      setLoading(true);
      const res = await getClientesApi({
        page: p, limit: 10,
        search: search || undefined,
        id_empresa:        empresa !== "all" ? Number(empresa) : undefined,
        id_estado_cliente: estado  !== "all" ? Number(estado)  : undefined,
      });
      setClientes(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("No se pudo cargar la lista de clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs().catch(() => toast.error("No se pudieron cargar los catálogos"));
  }, []);

  useEffect(() => { load("", "all", "all", 1); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load(busqueda, filtroEmpresa, filtroEstado, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // — Clientes handlers —
  const openCreate = () => { setSelected(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (c: Cliente) => {
    setSelected(c);
    setForm({
      nombre:            c.nombre,
      correo:            c.correo    ?? "",
      telefono:          c.telefono  ?? "",
      id_empresa:        String(c.id_empresa),
      id_estado_cliente: String(c.id_estado_cliente),
    });
    setModalOpen(true);
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

  // — Empresas handlers —
  const openEmpDialog = async () => {
    setEmpDialogOpen(true);
    setEmpForm("");
    setEmpSelected(null);
    setEmpLoading(true);
    try {
      setEmpList(await getEmpresasConConteoApi());
    } catch {
      toast.error("No se pudieron cargar las empresas");
    } finally {
      setEmpLoading(false);
    }
  };

  const handleEmpSave = async () => {
    if (!empForm.trim()) { toast.error("El nombre es obligatorio"); return; }
    try {
      setEmpSaving(true);
      if (empSelected) {
        await updateEmpresaApi(empSelected.id_empresa, { nombre: empForm.trim() });
        toast.success("Empresa actualizada");
      } else {
        await createEmpresaApi({ nombre: empForm.trim() });
        toast.success("Empresa creada");
      }
      setEmpForm("");
      setEmpSelected(null);
      setEmpList(await getEmpresasConConteoApi());
      loadCatalogs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar");
    } finally {
      setEmpSaving(false);
    }
  };

  const handleEmpDelete = async () => {
    if (!empToDelete) return;
    try {
      setEmpDeleting(true);
      await deleteEmpresaApi(empToDelete.id_empresa);
      toast.success(`${empToDelete.nombre} eliminada`);
      setEmpConfirmOpen(false);
      setEmpToDelete(null);
      setEmpList(await getEmpresasConConteoApi());
      loadCatalogs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo eliminar la empresa");
    } finally {
      setEmpDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" onClick={openEmpDialog}>
              <Building2 size={16} className="mr-2" /> Empresas
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-2" /> Nuevo cliente
          </Button>
        </div>
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
                            onClick={() => { setToDelete(c); setConfirmOpen(true); }}
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

      {/* Modal crear / editar cliente */}
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
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminar cliente */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Eliminar cliente</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Eliminar a <span className="font-medium">{toDelete?.nombre}</span>? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog administrar empresas */}
      <Dialog open={empDialogOpen} onOpenChange={(open) => {
        setEmpDialogOpen(open);
        if (!open) { setEmpSelected(null); setEmpForm(""); }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Administrar empresas</DialogTitle>
          </DialogHeader>

          {/* Formulario nueva / editar empresa */}
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de la empresa"
              value={empForm}
              onChange={(e) => setEmpForm(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleEmpSave(); }}
            />
            <Button onClick={handleEmpSave} disabled={empSaving} className="shrink-0">
              {empSelected ? <Pencil size={14} /> : <Plus size={14} />}
              <span className="ml-1">{empSelected ? "Actualizar" : "Agregar"}</span>
            </Button>
            {empSelected && (
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => { setEmpSelected(null); setEmpForm(""); }}
              >
                Cancelar
              </Button>
            )}
          </div>

          {/* Lista de empresas */}
          <div className="mt-2 max-h-72 overflow-y-auto divide-y rounded-lg border">
            {empLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              : empList.length === 0
              ? (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No hay empresas registradas
                  </p>
                )
              : empList.map((e) => (
                  <div key={e.id_empresa} className="flex items-center justify-between px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{e.nombre}</p>
                      <p className="text-xs text-gray-400">
                        {e._count.clientes} {e._count.clientes === 1 ? "cliente" : "clientes"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-accent transition-colors text-gray-500"
                        onClick={() => { setEmpSelected(e); setEmpForm(e.nombre ?? ""); }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-destructive/10 transition-colors text-destructive"
                        onClick={() => { setEmpToDelete(e); setEmpConfirmOpen(true); }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminar empresa */}
      <Dialog open={empConfirmOpen} onOpenChange={setEmpConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Eliminar empresa</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Eliminar <span className="font-medium">{empToDelete?.nombre}</span>?
            {empToDelete && empToDelete._count.clientes > 0 && (
              <span className="block mt-1 text-amber-600 font-medium">
                Tiene {empToDelete._count.clientes} cliente(s) asociado(s) y no podrá eliminarse.
              </span>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmpConfirmOpen(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={handleEmpDelete}
              disabled={empDeleting || (empToDelete?._count.clientes ?? 0) > 0}
            >
              {empDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
