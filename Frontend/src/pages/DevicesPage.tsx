import ComingSoonPage from "@/components/ComingSoonPage";
import { Camera } from "lucide-react";

export default function DevicesPage() {
  return (
    <ComingSoonPage
      title="Dispositivos IoT"
      description="Conecte smartwatches, sensores e equipamentos médicos diretamente ao PhysioCapture para coleta automática de dados."
      icon={Camera}
      features={[
        "Integração com Apple Watch e dispositivos Android",
        "Sensores de movimento e postura em tempo real",
        "Monitoramento de frequência cardíaca durante exercícios",
        "Sincronização automática com prontuários",
        "Alertas personalizados para fisioterapeutas",
        "Dashboard de métricas de recuperação"
      ]}
      estimatedDate="Q2 2026"
    />
  );
}