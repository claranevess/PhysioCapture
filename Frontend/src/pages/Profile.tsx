import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Briefcase, Lock, Bell, Shield, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function Profile() {
  const { toast } = useToast();
  const [name, setName] = useState("Dr. João Silva");
  const [email, setEmail] = useState("joao.silva@physiocapture.com");
  const [phone, setPhone] = useState("(11) 98765-4321");
  const [specialty, setSpecialty] = useState("Fisioterapia Ortopédica");
  const [crm, setCrm] = useState("12345-SP");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Senha alterada!",
      description: "Sua senha foi atualizada com sucesso.",
    });
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header do Perfil */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas informações pessoais e configurações da conta
            </p>
          </div>
        </div>

        {/* Card do Avatar e Info Básica */}
        <Card className="border-2 hover-lift">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarFallback className="bg-gradient-primary text-white text-4xl font-bold">
                    JS
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-muted-foreground flex items-center gap-2 justify-center sm:justify-start">
                  <Briefcase className="h-4 w-4" />
                  {specialty}
                </p>
                <p className="text-sm text-muted-foreground">CRM: {crm}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Configurações */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="personal">Pessoal</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          {/* Informações Pessoais */}
          <TabsContent value="personal" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações de perfil e dados profissionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        <User className="h-4 w-4 inline mr-2" />
                        Nome Completo
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="h-4 w-4 inline mr-2" />
                        E-mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Telefone
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">
                        <Briefcase className="h-4 w-4 inline mr-2" />
                        Especialidade
                      </Label>
                      <Input
                        id="specialty"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crm">CRM</Label>
                      <Input
                        id="crm"
                        value={crm}
                        onChange={(e) => setCrm(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="security" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Shield className="h-5 w-5 inline mr-2" />
                  Segurança da Conta
                </CardTitle>
                <CardDescription>
                  Altere sua senha e gerencie configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        <Lock className="h-4 w-4 inline mr-2" />
                        Senha Atual
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="••••••••"
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                      Alterar Senha
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Autenticação em Dois Fatores</CardTitle>
                <CardDescription>
                  Adicione uma camada extra de segurança à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Habilitar 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Proteja sua conta com autenticação em dois fatores
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notifications" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Bell className="h-5 w-5 inline mr-2" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Escolha como e quando você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Notificações por E-mail</p>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações importantes por e-mail
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Novas Consultas</p>
                      <p className="text-sm text-muted-foreground">
                        Seja notificado quando houver novas consultas agendadas
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Atualizações de Pacientes</p>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações sobre atualizações nos prontuários
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Lembretes de Consultas</p>
                      <p className="text-sm text-muted-foreground">
                        Receba lembretes antes das consultas agendadas
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Notificações do Sistema</p>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações sobre manutenção e novos recursos
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
