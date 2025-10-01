import ComingSoonPage from "@/components/ComingSoonPage";
import { TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <ComingSoonPage
      title="Analytics Avançado"
      description="Relatórios inteligentes e insights de negócio para otimizar sua clínica e melhorar resultados dos tratamentos."
      icon={TrendingUp}
      features={[
        "Dashboard executivo com métricas de negócio",
        "Análise preditiva de recuperação de pacientes",
        "Relatórios de eficiência por fisioterapeuta",
        "Insights de retenção e satisfação de pacientes",
        "Comparação de tratamentos e protocolos",
        "Exportação automática para contabilidade",
        "Alertas de performance e oportunidades"
      ]}
      estimatedDate="Q1 2026"
    />
  );
}