import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, Building2, FolderKanban, ClipboardList, ArrowRight } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuthStore } from "../../store/auth.store";
import {
  getStatsApi, getMisTareasApi, getChartsApi,
  type DashboardStats, type MiTarea, type ChartData,
} from "../../api/dashboard.api";

// ── Colores por nombre ────────────────────────────────────────────
const ESTADO_PROYECTO_COLOR: Record<string, string> = {
  "Planificación": "#3b82f6",
  "En progreso":   "#eab308",
  "Finalizado":    "#22c55e",
  "Cancelado":     "#9ca3af",
  "Pausado":       "#a855f7",
};

const ESTADO_TAREA_COLOR: Record<string, string> = {
  "Pendiente":   "#9ca3af",
  "En progreso": "#eab308",
  "Completada":  "#22c55e",
  "Cancelada":   "#ef4444",
};

const PRIORIDAD_COLOR: Record<string, string> = {
  "Crítica": "#ef4444",
  "Alta":    "#f97316",
  "Media":   "#3b82f6",
  "Baja":    "#9ca3af",
};

// ── Stat cards ────────────────────────────────────────────────────
interface StatCard {
  label: string; icon: React.ElementType;
  color: string; route: string; adminOnly?: boolean;
}
const STAT_CARDS: StatCard[] = [
  { label: "Clientes",  icon: Building2,    color: "text-blue-600",   route: "/clientes" },
  { label: "Proyectos", icon: FolderKanban, color: "text-violet-600", route: "/proyectos" },
  { label: "Tareas",    icon: ClipboardList, color: "text-amber-600",  route: "/tareas" },
  { label: "Usuarios",  icon: Users,         color: "text-emerald-600",route: "/usuarios", adminOnly: true },
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

// ── Tooltip personalizado ─────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-gray-800">{payload[0].name}</p>
      <p className="text-gray-500">{payload[0].value} registros</p>
    </div>
  );
};

// ── Skeleton de gráfica ───────────────────────────────────────────
const ChartSkeleton = () => (
  <div className="flex items-end justify-center gap-3 h-40 px-4">
    {[60, 90, 45, 75, 55].map((h, i) => (
      <Skeleton key={i} className="w-8 rounded" style={{ height: `${h}%` }} />
    ))}
  </div>
);

// ── Componente dona ───────────────────────────────────────────────
function DonaProyectos({ data }: { data: { estado: string; total: number }[] }) {
  if (data.length === 0)
    return <p className="text-center text-sm text-gray-400 py-10">Sin datos</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="estado"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell
              key={entry.estado}
              fill={ESTADO_PROYECTO_COLOR[entry.estado] ?? "#cbd5e1"}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          iconSize={10}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Barras horizontales genéricas ─────────────────────────────────
function BarrasHorizontales({
  data, colorMap, nameKey,
}: {
  data: { total: number; [k: string]: any }[];
  colorMap: Record<string, string>;
  nameKey: string;
}) {
  if (data.length === 0)
    return <p className="text-center text-sm text-gray-400 py-10">Sin datos</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey={nameKey}
          width={90}
          tick={{ fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((entry) => (
            <Cell
              key={entry[nameKey]}
              fill={colorMap[entry[nameKey]] ?? "#cbd5e1"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Página ────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const navigate   = useNavigate();
  const { usuario } = useAuthStore();
  const isAdmin    = usuario?.id_rol === 1;

  const [stats, setStats]           = useState<DashboardStats | null>(null);
  const [misTareas, setMisTareas]   = useState<MiTarea[]>([]);
  const [charts, setCharts]         = useState<ChartData | null>(null);
  const [loadingStats, setLoadingStats]   = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    getStatsApi()
      .then(setStats)
      .catch(() => toast.error("No se pudo cargar el resumen"))
      .finally(() => setLoadingStats(false));

    getMisTareasApi()
      .then(setMisTareas)
      .catch(() => {})
      .finally(() => setLoadingTareas(false));

    getChartsApi()
      .then(setCharts)
      .catch(() => toast.error("No se pudieron cargar las gráficas"))
      .finally(() => setLoadingCharts(false));
  }, []);

  const cards = STAT_CARDS
    .filter((c) => !c.adminOnly || isAdmin)
    .map((c) => ({
      ...c,
      value: stats ? stats[`total${c.label}` as keyof DashboardStats] : 0,
    }));

  // Datos según rol
  const chart2Data   = isAdmin ? charts?.tareasPorEstado       : charts?.misTareasPorEstado;
  const chart2Key    = "estado";
  const chart2Color  = ESTADO_TAREA_COLOR;
  const chart2Title  = isAdmin ? "Tareas por estado"           : "Mis tareas por estado";

  const chart3Data   = isAdmin ? charts?.tareasPorPrioridad    : charts?.misTareasPorPrioridad;
  const chart3Key    = "prioridad";
  const chart3Color  = PRIORIDAD_COLOR;
  const chart3Title  = isAdmin ? "Tareas por prioridad"        : "Mis tareas por prioridad";

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1 — Proyectos por estado (dona) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Proyectos por estado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingCharts
              ? <ChartSkeleton />
              : <DonaProyectos data={charts?.proyectosPorEstado ?? []} />}
          </CardContent>
        </Card>

        {/* 2 — Tareas por estado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {chart2Title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingCharts
              ? <ChartSkeleton />
              : <BarrasHorizontales
                  data={chart2Data ?? []}
                  colorMap={chart2Color}
                  nameKey={chart2Key}
                />}
          </CardContent>
        </Card>

        {/* 3 — Tareas por prioridad */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {chart3Title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingCharts
              ? <ChartSkeleton />
              : <BarrasHorizontales
                  data={chart3Data ?? []}
                  colorMap={chart3Color}
                  nameKey={chart3Key}
                />}
          </CardContent>
        </Card>
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
