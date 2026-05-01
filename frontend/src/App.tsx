import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage }           from "./pages/auth/LoginPage";
import { RegisterPage }        from "./pages/auth/RegisterPage";
import { DashboardPage }       from "./pages/dashboard/DashboardPage";
import { UsuariosPage }        from "./pages/usuarios/UsuariosPage";
import { ClientesPage }        from "./pages/clientes/ClientesPage";
import { ProyectosPage }       from "./pages/proyectos/ProyectosPage";
import { ProyectoDetallePage } from "./pages/proyectos/ProyectoDetallePage";
import { TareasPage }          from "./pages/tareas/TareasPage";
import { ProtectedRoute }      from "./components/shared/ProtectedRoute";
import { MainLayout }          from "./components/shared/MainLayout";
import { Toaster }             from "./components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Públicas */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/"         element={<Navigate to="/dashboard" replace />} />

        {/* Protegidas con layout — cualquier rol */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard"      element={<DashboardPage />} />
            <Route path="/clientes"       element={<ClientesPage />} />
            <Route path="/proyectos"      element={<ProyectosPage />} />
            <Route path="/proyectos/:id"  element={<ProyectoDetallePage />} />
            <Route path="/tareas"         element={<TareasPage />} />
          </Route>
        </Route>

        {/* Protegidas — solo Admin (rol 1) */}
        <Route element={<ProtectedRoute requiredRol={1} />}>
          <Route element={<MainLayout />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
