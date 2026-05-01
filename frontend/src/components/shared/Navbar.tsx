import { Menu, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../store/auth.store";
import { logoutApi } from "../../api/auth.api";
import { Button } from "../ui/button";

interface Props {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: Props) => {
  const navigate = useNavigate();
  const { usuario, refreshToken, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      if (refreshToken) await logoutApi(refreshToken);
    } catch {
      // si falla el logout en servidor igual limpiamos la sesión local
    } finally {
      logout();
      navigate("/login");
      toast.success("Sesión cerrada");
    }
  };

  return (
    <header className="h-16 bg-white border-b shrink-0 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors"
      >
        <Menu size={22} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} />
          <span className="hidden sm:inline">
            {usuario?.nombre} {usuario?.apellido}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline ml-1">Salir</span>
        </Button>
      </div>
    </header>
  );
};
