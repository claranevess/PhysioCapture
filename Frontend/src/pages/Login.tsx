import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }}></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-info/10 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-2xl mb-6 shadow-2xl animate-float">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3 tracking-tight">
            PhysioCapture
          </h1>
          <p className="text-muted-foreground text-lg">Transformando dados de fisioterapia</p>
        </div>

        <Card className="shadow-2xl animate-scale-in backdrop-blur-sm bg-card/95 border-2 hover-lift">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-base">
              Entre com suas credenciais para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg bg-gradient-primary hover:opacity-90 transition-all hover:shadow-lg hover:scale-[1.02]">
                Entrar
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="link" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Esqueci minha senha
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in">
          © 2025 PhysioCapture. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
