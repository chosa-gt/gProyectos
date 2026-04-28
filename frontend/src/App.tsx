import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage }          from "./pages/auth/LoginPage";
import { RegisterPage }       from "./pages/auth/RegisterPage";
import { DashboardPage }      from "./pages/dashboard/DashboardPage";
import { UsuariosPage }       from "./pages/usuarios/UsuariosPage";
import { ClientesPage }       from "./pages/clientes/ClientesPage";
import { ProyectosPage }      from "./pages/proyectos/ProyectosPage";
import { ProyectoDetallePage } from "./pages/proyectos/ProyectoDetallePage";
import { TareasPage }         from "./pages/tareas/TareasPage";
import { ProtectedRoute }     from "./components/shared/ProtectedRoute";
import { Toaster }            from "./components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Públicas */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/"         element={<Navigate to="/dashboard" replace />} />

        {/* Protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/usuarios" element={
          <ProtectedRoute requiredRol={1}><UsuariosPage /></ProtectedRoute>
        } />
        <Route path="/clientes" element={
          <ProtectedRoute><ClientesPage /></ProtectedRoute>
        } />
        <Route path="/proyectos" element={
          <ProtectedRoute><ProyectosPage /></ProtectedRoute>
        } />
        <Route path="/proyectos/:id" element={
          <ProtectedRoute><ProyectoDetallePage /></ProtectedRoute>
        } />
        <Route path="/tareas" element={
          <ProtectedRoute><TareasPage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;