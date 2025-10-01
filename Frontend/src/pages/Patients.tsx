import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserPlus, Phone, Mail, Calendar } from "lucide-react";

export default function Patients() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const patients = [
    { id: 1, name: "Maria Silva", cpf: "123.456.789-00", phone: "(11) 98765-4321", email: "maria@email.com", age: 35, status: "Em tratamento" },
    { id: 2, name: "João Santos", cpf: "987.654.321-00", phone: "(11) 98765-1234", email: "joao@email.com", age: 42, status: "Recuperação" },
    { id: 3, name: "Ana Costa", cpf: "456.789.123-00", phone: "(11) 98765-5678", email: "ana@email.com", age: 28, status: "Em tratamento" },
    { id: 4, name: "Pedro Oliveira", cpf: "321.654.987-00", phone: "(11) 98765-8765", email: "pedro@email.com", age: 55, status: "Avaliação" },
    { id: 5, name: "Juliana Lima", cpf: "789.123.456-00", phone: "(11) 98765-4567", email: "juliana@email.com", age: 31, status: "Em tratamento" },
    { id: 6, name: "Carlos Mendes", cpf: "654.321.789-00", phone: "(11) 98765-7890", email: "carlos@email.com", age: 48, status: "Recuperação" },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.cpf.includes(searchQuery) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie todos os pacientes da sua clínica
            </p>
          </div>
          <Button
            onClick={() => navigate("/patients/new")}
            className="bg-gradient-primary hover:opacity-90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </div>

        {/* Barra de busca */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de pacientes */}
        <div className="grid gap-4">
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhum paciente encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div>
                          <h3 className="text-lg font-semibold">{patient.name}</h3>
                          <p className="text-sm text-muted-foreground">CPF: {patient.cpf}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {patient.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {patient.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {patient.age} anos
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-sm px-3 py-1 rounded-full bg-primary-light text-primary font-medium whitespace-nowrap">
                        {patient.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
