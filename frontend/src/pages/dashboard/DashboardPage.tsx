import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, Building2, FolderKanban, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuthStore } from "../../store/auth.store";
import { getStatsApi, type DashboardStats } from "../../api/dashboard.api";

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  route: string;
  adminOnly?: boolean;
}

const STAT_CARDS: StatCard[] = [
  { label: "Clientes",   value: 0, icon: Building2,     color: "text-blue-600",   route: "/clientes" },
  { label: "Proyectos",  value: 0, icon: FolderKanban,  color: "text-violet-600", route: "/proyectos" },
  { label: "Tareas",     value: 0, icon: ClipboardList,  color: "text-amber-600",  route: "/tareas" },
  { label: "Usuarios",   value: 0, icon: Users,          color: "text-emerald-600",route: "/usuarios", adminOnly: true },
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const isAdmin = usuario?.id_rol === 1;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStatsApi()
      .then(setStats)
      .catch(() => toast.error("No se pudo cargar el resumen"))
      .finally(() => setLoading(false));
  }, []);

  const cards = STAT_CARDS
    .filter((c) => !c.adminOnly || isAdmin)
    .map((c) => ({
      ...c,
      value: stats
        ? stats[`total${c.label}` as keyof DashboardStats]
        : 0,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bienvenido, {usuario?.nombre} {usuario?.apellido}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: isAdmin ? 4 : 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : cards.map(({ label, value, icon: Icon, color, route }) => (
              <Card
                key={label}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(route)}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {label}
                  </CardTitle>
                  <Icon size={20} className={color} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
};
