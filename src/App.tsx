import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import DoentesPage from "./pages/DoentesPage";
import MinistrosPage from "./pages/MinistrosPage";
import AgendamentosPage from "./pages/AgendamentosPage";
import CadastrarDoentePage from "./pages/CadastrarDoentePage";
import CadastrarMinistroPage from "./pages/CadastrarMinistroPage";
import NovoAgendamentoPage from "./pages/NovoAgendamentoPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import EditarDoentePage from "./pages/EditarDoentePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/doentes" element={<DoentesPage />} />
              <Route path="/agendamentos" element={<AgendamentosPage />} />
              <Route path="/cadastrar-doente" element={<CadastrarDoentePage />} />
              <Route path="/editar-doente/:id" element={<EditarDoentePage />} />
              <Route path="/novo-agendamento" element={<NovoAgendamentoPage />} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
            </Route>
            
            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/ministros" element={<MinistrosPage />} />
              <Route path="/cadastrar-ministro" element={<CadastrarMinistroPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
