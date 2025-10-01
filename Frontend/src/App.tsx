import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientForm from "./pages/PatientForm";
import PatientRecord from "./pages/PatientRecord";
import Activities from "./pages/Activities";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import DocumentDigitization from "./pages/DocumentDigitization";
import MedicalRecord from "./pages/MedicalRecord";
import DevicesPage from "./pages/DevicesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MobilePage from "./pages/MobilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/patients/:id" element={<PatientRecord />} />
          <Route path="/patients/:id/edit" element={<PatientForm />} />
          <Route path="/patients/:id/record" element={<MedicalRecord />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/documents" element={<DocumentDigitization />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/mobile" element={<MobilePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
