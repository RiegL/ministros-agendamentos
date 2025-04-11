
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import DoentesPage from "./pages/DoentesPage";
import MinistrosPage from "./pages/MinistrosPage";
import AgendamentosPage from "./pages/AgendamentosPage";
import CadastrarDoentePage from "./pages/CadastrarDoentePage";
import CadastrarMinistroPage from "./pages/CadastrarMinistroPage";
import NovoAgendamentoPage from "./pages/NovoAgendamentoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/doentes" element={<DoentesPage />} />
          <Route path="/ministros" element={<MinistrosPage />} />
          <Route path="/agendamentos" element={<AgendamentosPage />} />
          <Route path="/cadastrar-doente" element={<CadastrarDoentePage />} />
          <Route path="/cadastrar-ministro" element={<CadastrarMinistroPage />} />
          <Route path="/novo-agendamento" element={<NovoAgendamentoPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
