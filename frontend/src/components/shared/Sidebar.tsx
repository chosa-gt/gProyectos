import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Building2, FolderKanban, ClipboardList, X } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { to: "/clientes",  label: "Clientes",   icon: Building2 },
  { to: "/proyectos", label: "Proyectos",  icon: FolderKanban },
  { to: "/tareas",    label: "Tareas",     icon: ClipboardList },
];

const adminItems = [
  { to: "/usuarios", label: "Usuarios", icon: Users },
];

export const Sidebar = ({ isOpen, onClose }: Props) => {
  const { usuario } = useAuthStore();
  const isAdmin = usuario?.id_rol === 1;

  const items = isAdmin
    ? [navItems[0], ...adminItems, ...navItems.slice(1)]
    : navItems;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-30
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-700 shrink-0">
          <span className="font-bold text-lg tracking-tight">SGP</span>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
