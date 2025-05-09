
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DocumentsProvider } from "@/hooks/useDocuments";
import { UsersProvider } from "@/hooks/useUsers";
import { MissionsProvider } from "@/hooks/useMissions";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Páginas
import Login from "./pages/Login";
import Index from "./pages/Index";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentsList from "./pages/DocumentsList";
import DocumentDetail from "./pages/DocumentDetail";
import AdminDocumentsList from "./pages/AdminDocumentsList";
import AdminUsersList from "./pages/AdminUsersList";
import AdminNewUser from "./pages/AdminNewUser";
import AdminEditUser from "./pages/AdminEditUser";
import NotFound from "./pages/NotFound";
import DailyMissions from "./pages/DailyMissions";
import AdminMissionsList from "./pages/AdminMissionsList";
import AdminCreateMission from "./pages/AdminCreateMission";
import AdminMissionDetail from "./pages/AdminMissionDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DocumentsProvider>
        <UsersProvider>
          <MissionsProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Rota pública */}
                <Route path="/login" element={<Login />} />
                
                {/* Rotas protegidas para todos os usuários */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents/upload"
                  element={
                    <ProtectedRoute>
                      <DocumentUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents"
                  element={
                    <ProtectedRoute>
                      <DocumentsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents/:id"
                  element={
                    <ProtectedRoute>
                      <DocumentDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/missions"
                  element={
                    <ProtectedRoute>
                      <DailyMissions />
                    </ProtectedRoute>
                  }
                />
                
                {/* Rotas protegidas apenas para administradores */}
                <Route
                  path="/admin/documents"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDocumentsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminUsersList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/new"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminNewUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/edit/:id"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminEditUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/missions"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminMissionsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/missions/new"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminCreateMission />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/missions/:id"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminMissionDetail />
                    </ProtectedRoute>
                  }
                />
                
                {/* Rota de fallback */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </MissionsProvider>
        </UsersProvider>
      </DocumentsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
