import ComingSoonPage from "@/components/ComingSoonPage";
import { Smartphone } from "lucide-react";

export default function MobilePage() {
  return (
    <ComingSoonPage
      title="App Mobile"
      description="Aplicativo nativo para iOS e Android que conecta fisioterapeutas e pacientes em qualquer lugar."
      icon={Smartphone}
      features={[
        "App para fisioterapeutas com acesso completo",
        "App para pacientes com exercícios personalizados",
        "Lembretes e notificações inteligentes",
        "Captura de fotos e vídeos de exercícios",
        "Chat seguro entre fisioterapeuta e paciente",
        "Sincronização offline para áreas sem internet",
        "Gamificação para engajamento dos pacientes"
      ]}
      estimatedDate="Q3 2026"
    />
  );
}