import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Mail, 
  Bell,
  Smartphone,
  Camera,
  TrendingUp
} from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  estimatedDate?: string;
  notifyUrl?: string;
}

export default function ComingSoonPage({ 
  title, 
  description, 
  icon: Icon, 
  features, 
  estimatedDate = "Q1 2026",
  notifyUrl 
}: ComingSoonPageProps) {
  const navigate = useNavigate();

  const handleNotifyMe = () => {
    // Simular inscrição para notificações
    alert("Obrigado! Você será notificado quando esta funcionalidade estiver disponível.");
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8 text-center">
          
          {/* Ícone e Status */}
          <div className="space-y-4">
            <div className="mx-auto w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-2xl">
              <Icon className="h-12 w-12 text-white" />
            </div>
            
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-lg px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              Em Desenvolvimento
            </Badge>
          </div>

          {/* Título e Descrição */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold gradient-text-alt">{title}</h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              {description}
            </p>
          </div>

          {/* Preview das Funcionalidades */}
          <Card className="text-left max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                O que você pode esperar
              </CardTitle>
              <CardDescription>
                Funcionalidades planejadas para esta versão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Timeline e Notificação */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">Timeline Estimado</h3>
              <p className="text-muted-foreground mb-4">
                Previsão de lançamento: <strong>{estimatedDate}</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleNotifyMe} className="bg-gradient-primary hover:opacity-90">
                  <Bell className="h-4 w-4 mr-2" />
                  Receber Notificação
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Funcionalidades Disponíveis */}
          <div className="pt-8 border-t">
            <h3 className="font-semibold text-lg mb-4">Enquanto isso, explore o que já está disponível:</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/documents")}>
                Digitalização de Documentos
              </Button>
              <Button variant="outline" onClick={() => navigate("/patients")}>
                Prontuários Centralizados
              </Button>
              <Button variant="outline" onClick={() => navigate("/activities")}>
                Atividades e Relatórios
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}