import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
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
import type { Usuario } from "../../types";
import {
  getUsuariosApi, createUsuarioApi, updateUsuarioApi, desactivarUsuarioApi,
} from "../../api/usuarios.api";
import { useAuthStore } from "../../store/auth.store";

const rolNombreToId = (nombre: string) => (nombre === "Administrador" ? 1 : 2);

const emptyForm = {
  nombre: "", apellido: "", correo: "", contrasena: "", id_rol: "2",
};

export const UsuariosPage = () => {
  const { usuario: me } = useAuthStore();

  const [usuarios, setUsuarios]   = useState<Usuario[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  const [modalOpen, setModalOpen]       = useState(false);
  const [selected, setSelected]         = useState<Usuario | null>(null);
  const [form, setForm]                 = useState(emptyForm);

  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [toDesactivar, setToDesactivar] = useState<Usuario | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setUsuarios(await getUsuariosApi());
    } catch {
      toast.error("No se pudo cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (u: Usuario) => {
    setSelected(u);
    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      contrasena: "",
      id_rol: String(rolNombreToId(u.rol.nombre)),
    });
    setModalOpen(true);
  };

  const openConfirm = (u: Usuario) => {
    setToDesactivar(u);
    setConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.apellido || !form.correo) {
      toast.error("Nombre, apellido y correo son obligatorios");
      return;
    }
    if (!selected && !form.contrasena) {
      toast.error("La contraseña es obligatoria para nuevos usuarios");
      return;
    }

    try {
      setSaving(true);
      if (selected) {
        const payload: Record<string, string | number> = {
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.correo,
          id_rol: Number(form.id_rol),
        };
        if (form.contrasena) payload.contrasena = form.contrasena;
        await updateUsuarioApi(selected.id_usuario, payload);
        toast.success("Usuario actualizado");
      } else {
        await createUsuarioApi({
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.correo,
          contrasena: form.contrasena,
          id_rol: Number(form.id_rol),
        });
        toast.success("Usuario creado");
      }
      setModalOpen(false);
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDesactivar = async () => {
    if (!toDesactivar) return;
    try {
      setDeactivating(true);
      await desactivarUsuarioApi(toDesactivar.id_usuario);
      toast.success(`${toDesactivar.nombre} desactivado`);
      setConfirmOpen(false);
      load();
    } catch {
      toast.error("No se pudo desactivar el usuario");
    } finally {
      setDeactivating(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" /> Nuevo usuario
        </Button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
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
              : usuarios.map((u) => (
                  <TableRow key={u.id_usuario} className={!u.activo ? "opacity-50" : ""}>
                    <TableCell className="font-medium">
                      {u.nombre} {u.apellido}
                    </TableCell>
                    <TableCell className="text-gray-500">{u.correo}</TableCell>
                    <TableCell>{u.rol.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={u.activo ? "default" : "secondary"}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors">
                          <MoreHorizontal size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(u)}>
                            Editar
                          </DropdownMenuItem>
                          {u.activo && u.id_usuario !== me?.id_usuario && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => openConfirm(u)}
                            >
                              Desactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal crear / editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selected ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input placeholder="Juan" {...field("nombre")} />
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input placeholder="Pérez" {...field("apellido")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input type="email" placeholder="correo@ejemplo.com" {...field("correo")} />
            </div>
            <div className="space-y-2">
              <Label>
                Contraseña{" "}
                {selected && (
                  <span className="text-xs text-gray-400">(vacío = sin cambio)</span>
                )}
              </Label>
              <Input type="password" placeholder="••••••••" {...field("contrasena")} />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={form.id_rol}
                onValueChange={(v) => setForm((f) => ({ ...f, id_rol: v ?? "2" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Administrador</SelectItem>
                  <SelectItem value="2">Usuario</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Diálogo confirmar desactivar */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Desactivar usuario</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Desactivar a{" "}
            <span className="font-medium">
              {toDesactivar?.nombre} {toDesactivar?.apellido}
            </span>
            ? El usuario no podrá iniciar sesión. Esto es reversible.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDesactivar} disabled={deactivating}>
              {deactivating ? "Desactivando..." : "Desactivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
