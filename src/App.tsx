import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import RiskAnalysis from "./pages/RiskAnalysis.tsx";
import Investigation from "./pages/Investigation.tsx";
import Compliance from "./pages/Compliance.tsx";
import AMLScreening from "./pages/AMLScreening.tsx";
import ContractRiskAnalyser from "./pages/ContractRiskAnalyser.tsx";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/risk-analysis" element={<RiskAnalysis />} />
        <Route path="/investigation" element={<Investigation />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/aml-screening" element={<AMLScreening />} />
        <Route path="/contract-risk" element={<ContractRiskAnalyser />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
