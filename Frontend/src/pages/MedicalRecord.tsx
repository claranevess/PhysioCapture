import { useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  Heart, 
  TrendingUp,
  Plus,
  Edit,
  Camera,
  Download,
  Share,
  AlertCircle,
  CheckCircle,
  Clock,
  Stethoscope,
  Brain,
  Zap
} from "lucide-react";

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  emergencyContact: string;
  medicalHistory: string[];
  currentTreatment: {
    diagnosis: string;
    startDate: string;
    progress: number;
    sessionsCompleted: number;
    totalSessions: number;
    nextAppointment: string;
  };
  vitalSigns: {
    date: string;
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
  }[];
  documents: {
    id: string;
    name: string;
    type: string;
    date: string;
    url?: string;
  }[];
  sessions: {
    id: string;
    date: string;
    duration: number;
    type: string;
    notes: string;
    progress: string;
    therapist: string;
  }[];
  assessments: {
    id: string;
    date: string;
    type: string;
    score: number;
    maxScore: number;
    notes: string;
  }[];
}

export default function MedicalRecordDetail() {
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");

  // Dados simulados do prontuário
  const medicalRecord: MedicalRecord = {
    id: "MR001",
    patientId: patientId || "PAC001",
    patientName: "João Silva",
    age: 45,
    gender: "Masculino",
    phone: "(11) 99999-9999",
    email: "joao.silva@email.com",
    emergencyContact: "Maria Silva - (11) 88888-8888",
    medicalHistory: [
      "Lombalgia crônica",
      "Hérnia de disco L4-L5",
      "Sedentarismo"
    ],
    currentTreatment: {
      diagnosis: "Lombalgia com irradiação para membro inferior direito",
      startDate: "2025-09-01",
      progress: 78,
      sessionsCompleted: 12,
      totalSessions: 20,
      nextAppointment: "2025-10-03T14:00:00"
    },
    vitalSigns: [
      {
        date: "2025-10-01",
        bloodPressure: "120/80",
        heartRate: 72,
        temperature: 36.5,
        oxygenSaturation: 98
      },
      {
        date: "2025-09-24",
        bloodPressure: "118/78",
        heartRate: 70,
        temperature: 36.3,
        oxygenSaturation: 99
      }
    ],
    documents: [
      {
        id: "1",
        name: "Ressonância Magnética Lombar",
        type: "Exame",
        date: "2025-08-15"
      },
      {
        id: "2",
        name: "Ficha de Avaliação Inicial",
        type: "Avaliação",
        date: "2025-09-01"
      },
      {
        id: "3",
        name: "Evolução Fisioterapêutica",
        type: "Evolução",
        date: "2025-09-30"
      }
    ],
    sessions: [
      {
        id: "1",
        date: "2025-10-01",
        duration: 60,
        type: "Fisioterapia Manual",
        notes: "Paciente apresentou boa resposta ao tratamento. Diminuição da dor em 20%.",
        progress: "Melhora significativa",
        therapist: "Dr. Maria Santos"
      },
      {
        id: "2",
        date: "2025-09-29",
        duration: 45,
        type: "Exercícios Terapêuticos",
        notes: "Realização de exercícios de fortalecimento e alongamento.",
        progress: "Progresso estável",
        therapist: "Dr. Maria Santos"
      }
    ],
    assessments: [
      {
        id: "1",
        date: "2025-10-01",
        type: "Escala Visual Analógica de Dor",
        score: 3,
        maxScore: 10,
        notes: "Redução significativa da dor em relação à avaliação inicial (era 8/10)"
      },
      {
        id: "2", 
        date: "2025-10-01",
        type: "Teste de Flexibilidade Lombar",
        score: 15,
        maxScore: 20,
        notes: "Melhora na amplitude de movimento"
      }
    ]
  };

  const addNewNote = () => {
    if (newNote.trim()) {
      // Simular adição de nova nota
      console.log("Nova nota adicionada:", newNote);
      setNewNote("");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header do Paciente */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {medicalRecord.patientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{medicalRecord.patientName}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mt-1">
                    <span>{medicalRecord.age} anos • {medicalRecord.gender}</span>
                    <span>ID: {medicalRecord.patientId}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span>{medicalRecord.phone}</span>
                    <span>{medicalRecord.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Status do Tratamento */}
            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Tratamento Atual</h3>
                <Badge className="bg-green-100 text-green-800">
                  <Activity className="h-3 w-3 mr-1" />
                  Em Andamento
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {medicalRecord.currentTreatment.diagnosis}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Progresso</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={medicalRecord.currentTreatment.progress} className="flex-1" />
                    <span className="text-sm font-medium">{medicalRecord.currentTreatment.progress}%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Sessões</p>
                  <p className="text-sm text-muted-foreground">
                    {medicalRecord.currentTreatment.sessionsCompleted} de {medicalRecord.currentTreatment.totalSessions} concluídas
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Próxima Consulta</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(medicalRecord.currentTreatment.nextAppointment).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(medicalRecord.currentTreatment.nextAppointment).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs do Prontuário */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumo</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="sessions">Sessões</TabsTrigger>
            <TabsTrigger value="assessments">Avaliações</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="vitals">Sinais Vitais</TabsTrigger>
          </TabsList>

          {/* Tab: Resumo */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Histórico Médico */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Histórico Médico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {medicalRecord.medicalHistory.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{condition}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Última Sessão */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-500" />
                    Última Sessão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Data:</span>
                      <span className="text-sm">{new Date(medicalRecord.sessions[0].date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Tipo:</span>
                      <span className="text-sm">{medicalRecord.sessions[0].type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Duração:</span>
                      <span className="text-sm">{medicalRecord.sessions[0].duration} min</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Observações:</span>
                      <p className="text-sm text-muted-foreground mt-1">{medicalRecord.sessions[0].notes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notas Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Adicionar Nota Rápida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Digite suas observações sobre o paciente..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={addNewNote} className="bg-gradient-primary hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Nota
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Sessões */}
          <TabsContent value="sessions" className="space-y-4">
            {medicalRecord.sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{session.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString('pt-BR')} • {session.duration} min
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Observações:</h4>
                        <p className="text-sm text-muted-foreground">{session.notes}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Progresso:</span>
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {session.progress}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Por: {session.therapist}</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Tab: Avaliações */}
          <TabsContent value="assessments" className="space-y-4">
            {medicalRecord.assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <h4 className="font-semibold">{assessment.type}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(assessment.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-primary">
                          {assessment.score}/{assessment.maxScore}
                        </span>
                        <div className="flex-1">
                          <Progress value={(assessment.score / assessment.maxScore) * 100} />
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{assessment.notes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Tab: Documentos */}
          <TabsContent value="documents" className="space-y-4">
            {medicalRecord.documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{doc.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{doc.type}</Badge>
                          <span>{new Date(doc.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Tab: Sinais Vitais */}
          <TabsContent value="vitals" className="space-y-4">
            {medicalRecord.vitalSigns.map((vital, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Sinais Vitais</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(vital.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Pressão Arterial</div>
                      <div className="text-lg font-semibold">{vital.bloodPressure}</div>
                      <div className="text-xs text-muted-foreground">mmHg</div>
                    </div>
                    
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Frequência Cardíaca</div>
                      <div className="text-lg font-semibold">{vital.heartRate}</div>
                      <div className="text-xs text-muted-foreground">bpm</div>
                    </div>
                    
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Temperatura</div>
                      <div className="text-lg font-semibold">{vital.temperature}°</div>
                      <div className="text-xs text-muted-foreground">Celsius</div>
                    </div>
                    
                    <div className="text-center p-3 bg-secondary/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">SpO2</div>
                      <div className="text-lg font-semibold">{vital.oxygenSaturation}%</div>
                      <div className="text-xs text-muted-foreground">Saturação</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}