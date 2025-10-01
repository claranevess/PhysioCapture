import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus, Users, Activity, Clock, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/patients?search=${searchQuery}`);
  };

  const stats = [
    { title: "Total de Pacientes", value: "248", icon: Users, color: "text-primary" },
    { title: "Consultas Hoje", value: "12", icon: Activity, color: "text-info" },
    { title: "Atendimentos Pendentes", value: "5", icon: Clock, color: "text-warning" },
    { title: "Taxa de Sucesso", value: "94%", icon: TrendingUp, color: "text-success" },
  ];

  const recentPatients = [
    { id: 1, name: "Maria Silva", lastVisit: "Hoje", status: "Em tratamento" },
    { id: 2, name: "João Santos", lastVisit: "Ontem", status: "Recuperação" },
    { id: 3, name: "Ana Costa", lastVisit: "2 dias atrás", status: "Em tratamento" },
    { id: 4, name: "Pedro Oliveira", lastVisit: "3 dias atrás", status: "Avaliação" },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao PhysioCapture. Aqui está um resumo da sua clínica.
          </p>
        </div>

        {/* Busca em destaque */}
        <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Buscar Paciente
            </CardTitle>
            <CardDescription>
              Digite o nome, CPF ou qualquer informação do paciente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                placeholder="Ex: Maria Silva, 123.456.789-00..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 text-lg"
              />
              <Button type="submit" size="lg" className="bg-gradient-primary hover:opacity-90">
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Botão de acesso rápido */}
        <Button
          onClick={() => navigate("/patients/new")}
          size="lg"
          className="w-full sm:w-auto bg-gradient-accent hover:opacity-90 shadow-md"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Cadastrar Novo Paciente
        </Button>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="hover-lift cursor-pointer border-2 hover:border-primary/30 transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-primary-light ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Últimos pacientes visualizados */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Últimos Pacientes Visualizados</CardTitle>
            <CardDescription>
              Acesse rapidamente os pacientes que você visualizou recentemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.map((patient, index) => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="flex items-center justify-between p-4 rounded-lg border-2 border-border hover:border-primary/30 hover:bg-primary-light/50 transition-all cursor-pointer hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold shadow-md">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">Última visita: {patient.lastVisit}</p>
                    </div>
                  </div>
                  <span className="text-sm px-4 py-2 rounded-full bg-gradient-primary/10 text-primary font-semibold border border-primary/20">
                    {patient.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
