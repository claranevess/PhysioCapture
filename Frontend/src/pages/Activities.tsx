import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Users, Calendar } from "lucide-react";

export default function Activities() {
  const activities = [
    { id: 1, patient: "Maria Silva", action: "Consulta realizada", date: "2025-03-20 14:30", type: "consulta" },
    { id: 2, patient: "João Santos", action: "Documento adicionado", date: "2025-03-20 11:15", type: "documento" },
    { id: 3, patient: "Ana Costa", action: "Paciente cadastrado", date: "2025-03-19 16:00", type: "cadastro" },
    { id: 4, patient: "Pedro Oliveira", action: "Avaliação atualizada", date: "2025-03-19 10:45", type: "avaliacao" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "consulta":
        return <Activity className="h-5 w-5 text-info" />;
      case "documento":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "cadastro":
        return <Users className="h-5 w-5 text-primary" />;
      case "avaliacao":
        return <Calendar className="h-5 w-5 text-warning" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe todas as atividades recentes da clínica
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-primary-light/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      Paciente: {activity.patient}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.date).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
