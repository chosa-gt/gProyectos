import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, Building2, FolderKanban, ClipboardList, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuthStore } from "../../store/auth.store";
import { getStatsApi, getMisTareasApi, type DashboardStats, type MiTarea } from "../../api/dashboard.api";

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  route: string;
  adminOnly?: boolean;
}

const STAT_CARDS: StatCard[] = [
  { label: "Clientes",  value: 0, icon: Building2,    color: "text-blue-600",   route: "/clientes" },
  { label: "Proyectos", value: 0, icon: FolderKanban, color: "text-violet-600", route: "/proyectos" },
  { label: "Tareas",    value: 0, icon: ClipboardList, color: "text-amber-600",  route: "/tareas" },
  { label: "Usuarios",  value: 0, icon: Users,         color: "text-emerald-600",route: "/usuarios", adminOnly: true },
];

const prioridadClases: Record<string, string> = {
  "Crítica": "border-red-300 bg-red-50 text-red-700",
  "Alta":    "border-orange-300 bg-orange-50 text-orange-700",
  "Media":   "border-blue-300 bg-blue-50 text-blue-700",
  "Baja":    "border-gray-300 bg-gray-100 text-gray-500",
};

const estadoClases: Record<string, string> = {
  "Pendiente":   "border-gray-300 bg-gray-100 text-gray-500",
  "En progreso": "border-yellow-300 bg-yellow-50 text-yellow-700",
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const isAdmin = usuario?.id_rol === 1;

  const [stats, setStats]           = useState<DashboardStats | null>(null);
  const [misTareas, setMisTareas]   = useState<MiTarea[]>([]);
  const [loadingStats, setLoadingStats]   = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(true);

  useEffect(() => {
    getStatsApi()
      .then(setStats)
      .catch(() => toast.error("No se pudo cargar el resumen"))
      .finally(() => setLoadingStats(false));

    getMisTareasApi()
      .then(setMisTareas)
      .catch(() => {})
      .finally(() => setLoadingTareas(false));
  }, []);

  const cards = STAT_CARDS
    .filter((c) => !c.adminOnly || isAdmin)
    .map((c) => ({
      ...c,
      value: stats ? stats[`total${c.label}` as keyof DashboardStats] : 0,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bienvenido, {usuario?.nombre} {usuario?.apellido}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats
          ? Array.from({ length: isAdmin ? 4 : 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-16" /></CardContent>
              </Card>
            ))
          : cards.map(({ label, value, icon: Icon, color, route }) => (
              <Card
                key={label}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(route)}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
                  <Icon size={20} className={color} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Mis tareas pendientes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Mis tareas pendientes</h2>
          <button
            onClick={() => navigate("/tareas")}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            Ver todas <ArrowRight size={14} />
          </button>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          {loadingTareas ? (
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : misTareas.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              No tienes tareas pendientes
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2.5">Tarea</th>
                  <th className="px-4 py-2.5">Proyecto</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5">Prioridad</th>
                  <th className="px-4 py-2.5 text-right">Vence</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {misTareas.map((t) => (
                  <tr
                    key={t.id_tarea}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate("/tareas")}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                      {t.tarea}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                      {t.proyecto.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={estadoClases[t.estado_tarea.estado] ?? ""}>
                        {t.estado_tarea.estado}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={prioridadClases[t.prioridad.nombre_prioridad] ?? ""}>
                        {t.prioridad.nombre_prioridad}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 whitespace-nowrap">
                      {t.fecha_fin
                        ? new Date(t.fecha_fin).toLocaleDateString("es-SV", { day: "2-digit", month: "short" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
