'use client';'use client';



import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';

import Link from 'next/link';import Link from 'next/link';

import designSystem from '@/lib/design-system';import designSystem from '@/lib/design-system';

import { import { 

  Users,   Users, 

  FileText,   FileText, 

  Calendar,  Calendar,

  UserPlus,  UserPlus,

  Camera,  Camera,

  TrendingUp,  TrendingUp,

  Activity,  Activity,

  Clock,  Clock,

  ChevronRight  ChevronRight

} from 'lucide-react';} from 'lucide-react';



export default function Dashboard() {export default function Dashboard() {

  const [stats, setStats] = useState({  const [stats, setStats] = useState({

    totalPacientes: 0,    totalPacientes: 0,

    prontuariosAtivos: 0,    prontuariosAtivos: 0,

    consultasHoje: 0,    consultasHoje: 0,

    crescimentoMensal: '+0%'    crescimentoMensal: '+0%'

  });  });



  const [recentPatients, setRecentPatients] = useState<Array<{  const [recentPatients, setRecentPatients] = useState<Array<{

    id: number;    id: number;

    nome: string;    nome: string;

    ultimaConsulta: string;    ultimaConsulta: string;

    status: string;    status: string;

  }>>([]);  }>>([]);



  useEffect(() => {  useEffect(() => {

    setStats({    setStats({

      totalPacientes: 127,      totalPacientes: 127,

      prontuariosAtivos: 89,      prontuariosAtivos: 89,

      consultasHoje: 12,      consultasHoje: 12,

      crescimentoMensal: '+15%'      crescimentoMensal: '+15%'

    });    });



    setRecentPatients([    setRecentPatients([

      { id: 1, nome: 'Maria Silva', ultimaConsulta: '2024-01-15', status: 'Ativo' },      { id: 1, nome: 'Maria Silva', ultimaConsulta: '2024-01-15', status: 'Ativo' },

      { id: 2, nome: 'João Santos', ultimaConsulta: '2024-01-14', status: 'Ativo' },      { id: 2, nome: 'João Santos', ultimaConsulta: '2024-01-14', status: 'Ativo' },

      { id: 3, nome: 'Ana Costa', ultimaConsulta: '2024-01-13', status: 'Ativo' },      { id: 3, nome: 'Ana Costa', ultimaConsulta: '2024-01-13', status: 'Ativo' },

      { id: 4, nome: 'Pedro Lima', ultimaConsulta: '2024-01-12', status: 'Ativo' }      { id: 4, nome: 'Pedro Lima', ultimaConsulta: '2024-01-12', status: 'Ativo' }

    ]);    ]);

  }, []);  }, []);



  return (  return (

    <div className="min-h-screen bg-[#F5F7FA]">    <div className="min-h-screen" style={{ backgroundColor: designSystem.colors.background }}>

      <header className="bg-gradient-to-r from-[#4DB6AC] to-[#009688] shadow-sm">      <header className="bg-gradient-to-r from-[#4DB6AC] to-[#009688] shadow-sm">

        <div className="max-w-7xl mx-auto px-6 py-8">        <div className="max-w-7xl mx-auto px-6 py-8">

          <div className="flex items-center justify-between">          <div className="flex items-center justify-between">

            <div>            <div>

              <h1 className="text-3xl font-bold text-white mb-2">              <h1 className="text-3xl font-bold text-white mb-2">

                PHYSIOCAPTURE DASHBOARD                PHYSIOCAPTURE DASHBOARD

              </h1>              </h1>

              <p className="text-white/90 text-sm">              <p className="text-white/90 text-sm">

                Sistema de Gestão Fisioterapêutica • Desenvolvido pela Core Hive                Sistema de Gestão Fisioterapêutica • Desenvolvido pela Core Hive

              </p>              </p>

            </div>            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">

              <Clock className="w-5 h-5 text-white" />              <Clock className="w-5 h-5 text-white" />

              <span className="text-white font-medium">              <span className="text-white font-medium">

                {new Date().toLocaleDateString('pt-BR')}                {new Date().toLocaleDateString('pt-BR')}

              </span>              </span>

            </div>            </div>

          </div>          </div>

        </div>        </div>

      </header>      </header>



      <div className="max-w-7xl mx-auto px-6 py-8">      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">

            <div className="flex items-start justify-between">            <div className="flex items-start justify-between">

              <div className="flex-1">              <div className="flex-1">

                <p className="text-sm font-medium text-[#7F8C8D]">                <p className="text-sm font-medium" style={{ color: designSystem.colors.text.secondary }}>

                  Total de Pacientes                  Total de Pacientes

                </p>                </p>

                <p className="text-3xl font-bold mt-2 text-[#2C3E50]">                <p className="text-3xl font-bold mt-2" style={{ color: designSystem.colors.text.primary }}>

                  {stats.totalPacientes}                  {stats.totalPacientes}

                </p>                </p>

                <div className="flex items-center gap-1 mt-3">                <div className="flex items-center gap-1 mt-3">

                  <TrendingUp className="w-4 h-4 text-[#4CAF50]" />                  <TrendingUp className="w-4 h-4" style={{ color: designSystem.colors.success }} />

                  <span className="text-sm font-medium text-[#4CAF50]">                  <span className="text-sm font-medium" style={{ color: designSystem.colors.success }}>

                    {stats.crescimentoMensal}                    {stats.crescimentoMensal}

                  </span>                  </span>

                  <span className="text-xs text-[#7F8C8D]">                  <span className="text-xs" style={{ color: designSystem.colors.text.secondary }}>

                    vs mês anterior                    vs mês anterior

                  </span>                  </span>

                </div>                </div>

              </div>              </div>

              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#009688]/10">              <div 

                <Users className="w-7 h-7 text-[#009688]" />                className="w-14 h-14 rounded-full flex items-center justify-center"

              </div>                style={{ backgroundColor: `${designSystem.colors.primary}15` }}

            </div>              >

          </div>                <Users className="w-7 h-7" style={{ color: designSystem.colors.primary }} />

              </div>

          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">            </div>

            <div className="flex items-start justify-between">          </div>

              <div className="flex-1">

                <p className="text-sm font-medium text-[#7F8C8D]">          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">

                  Prontuários Ativos            <div className="flex items-start justify-between">

                </p>              <div className="flex-1">

                <p className="text-3xl font-bold mt-2 text-[#2C3E50]">                <p className="text-sm font-medium" style={{ color: designSystem.colors.text.secondary }}>

                  {stats.prontuariosAtivos}                  Prontuários Ativos

                </p>                </p>

                <div className="flex items-center gap-1 mt-3">                <p className="text-3xl font-bold mt-2" style={{ color: designSystem.colors.text.primary }}>

                  <Activity className="w-4 h-4 text-[#66BB6A]" />                  {stats.prontuariosAtivos}

                  <span className="text-xs text-[#7F8C8D]">                </p>

                    Atendimentos em andamento                <div className="flex items-center gap-1 mt-3">

                  </span>                  <Activity className="w-4 h-4" style={{ color: designSystem.colors.secondary }} />

                </div>                  <span className="text-xs" style={{ color: designSystem.colors.text.secondary }}>

              </div>                    Atendimentos em andamento

              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#66BB6A]/10">                  </span>

                <FileText className="w-7 h-7 text-[#66BB6A]" />                </div>

              </div>              </div>

            </div>              <div 

          </div>                className="w-14 h-14 rounded-full flex items-center justify-center"

                style={{ backgroundColor: `${designSystem.colors.secondary}15` }}

          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">              >

            <div className="flex items-start justify-between">                <FileText className="w-7 h-7" style={{ color: designSystem.colors.secondary }} />

              <div className="flex-1">              </div>

                <p className="text-sm font-medium text-[#7F8C8D]">            </div>

                  Consultas Hoje          </div>

                </p>

                <p className="text-3xl font-bold mt-2 text-[#2C3E50]">          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">

                  {stats.consultasHoje}            <div className="flex items-start justify-between">

                </p>              <div className="flex-1">

                <div className="flex items-center gap-1 mt-3">                <p className="text-sm font-medium" style={{ color: designSystem.colors.text.secondary }}>

                  <Calendar className="w-4 h-4 text-[#FF8099]" />                  Consultas Hoje

                  <span className="text-xs text-[#7F8C8D]">                </p>

                    Agendamentos confirmados                <p className="text-3xl font-bold mt-2" style={{ color: designSystem.colors.text.primary }}>

                  </span>                  {stats.consultasHoje}

                </div>                </p>

              </div>                <div className="flex items-center gap-1 mt-3">

              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#FF8099]/10">                  <Calendar className="w-4 h-4" style={{ color: designSystem.colors.accent }} />

                <Calendar className="w-7 h-7 text-[#FF8099]" />                  <span className="text-xs" style={{ color: designSystem.colors.text.secondary }}>

              </div>                    Agendamentos confirmados

            </div>                  </span>

          </div>                </div>

        </div>              </div>

              <div 

        <div className="mb-8">                className="w-14 h-14 rounded-full flex items-center justify-center"

          <h2 className="text-xl font-bold mb-4 text-[#2C3E50]">                style={{ backgroundColor: `${designSystem.colors.accent}15` }}

            Ações Rápidas              >

          </h2>                <Calendar className="w-7 h-7" style={{ color: designSystem.colors.accent }} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">              </div>

            <Link            </div>

              href="/patients"          </div>

              className="group bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-[#009688]"        </div>

            >

              <div className="flex items-center justify-between">        <div className="mb-8">

                <div className="flex items-center gap-4">          <h2 className="text-xl font-bold mb-4" style={{ color: designSystem.colors.text.primary }}>

                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-[#009688]/10">            Ações Rápidas

                    <UserPlus className="w-6 h-6 text-[#009688]" />          </h2>

                  </div>          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div>            <Link

                    <h3 className="font-semibold text-[#2C3E50]">              href="/patients"

                      Novo Paciente              className="group bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-[#009688]"

                    </h3>            >

                    <p className="text-sm text-[#7F8C8D]">              <div className="flex items-center justify-between">

                      Cadastrar paciente                <div className="flex items-center gap-4">

                    </p>                  <div 

                  </div>                    className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"

                </div>                    style={{ backgroundColor: `${designSystem.colors.primary}15` }}

                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-[#7F8C8D]" />                  >

              </div>                    <UserPlus className="w-6 h-6" style={{ color: designSystem.colors.primary }} />

            </Link>                  </div>

                  <div>

            <Link                    <h3 className="font-semibold" style={{ color: designSystem.colors.text.primary }}>

              href="/patients"                      Novo Paciente

              className="group bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-[#66BB6A]"                    </h3>

            >                    <p className="text-sm" style={{ color: designSystem.colors.text.secondary }}>

              <div className="flex items-center justify-between">                      Cadastrar paciente

                <div className="flex items-center gap-4">                    </p>

                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-[#66BB6A]/10">                  </div>

                    <FileText className="w-6 h-6 text-[#66BB6A]" />                </div>

                  </div>                <ChevronRight 

                  <div>                  className="w-5 h-5 transition-transform group-hover:translate-x-1" 

                    <h3 className="font-semibold text-[#2C3E50]">                  style={{ color: designSystem.colors.text.secondary }}

                      Prontuários                />

                    </h3>              </div>

                    <p className="text-sm text-[#7F8C8D]">            </Link>

                      Ver todos os prontuários

                    </p>            <Link

                  </div>              href="/patients"

                </div>              className="group bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-[#66BB6A]"

                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-[#7F8C8D]" />            >

              </div>              <div className="flex items-center justify-between">

            </Link>                <div className="flex items-center gap-4">

                  <div 

            <Link                    className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"

              href="/documents"                    style={{ backgroundColor: `${designSystem.colors.secondary}15` }}

              className="group bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-[#FF8099]"                  >

            >                    <FileText className="w-6 h-6" style={{ color: designSystem.colors.secondary }} />

              <div className="flex items-center justify-between">                  </div>

                <div className="flex items-center gap-4">                  <div>

                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-[#FF8099]/10">                    <h3 className="font-semibold" style={{ color: designSystem.colors.text.primary }}>

                    <Camera className="w-6 h-6 text-[#FF8099]" />                      Prontuários

                  </div>                    </h3>

                  <div>                    <p className="text-sm" style={{ color: designSystem.colors.text.secondary }}>

                    <h3 className="font-semibold text-[#2C3E50]">                      Ver todos os prontuários

                      Documentos                    </p>

                    </h3>                  </div>

                    <p className="text-sm text-[#7F8C8D]">                </div>

                      Capturar documentos                <ChevronRight 

                    </p>                  className="w-5 h-5 transition-transform group-hover:translate-x-1" 

                  </div>                  style={{ color: designSystem.colors.text.secondary }}

                </div>                />

                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-[#7F8C8D]" />              </div>

              </div>            </Link>

            </Link>

          </div>            <Link

        </div>              href="/documents"

              className="group bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-[#FF8099]"

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">            >

          <div className="px-6 py-4 border-b border-gray-100">              <div className="flex items-center justify-between">

            <div className="flex items-center justify-between">                <div className="flex items-center gap-4">

              <h2 className="text-xl font-bold text-[#2C3E50]">                  <div 

                Pacientes Recentes                    className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"

              </h2>                    style={{ backgroundColor: `${designSystem.colors.accent}15` }}

              <Link                   >

                href="/patients"                    <Camera className="w-6 h-6" style={{ color: designSystem.colors.accent }} />

                className="text-sm font-medium hover:underline text-[#009688]"                  </div>

              >                  <div>

                Ver todos                    <h3 className="font-semibold" style={{ color: designSystem.colors.text.primary }}>

              </Link>                      Documentos

            </div>                    </h3>

          </div>                    <p className="text-sm" style={{ color: designSystem.colors.text.secondary }}>

          <div className="divide-y divide-gray-100">                      Capturar documentos

            {recentPatients.map((patient) => (                    </p>

              <Link                  </div>

                key={patient.id}                </div>

                href={`/patients/${patient.id}/records`}                <ChevronRight 

                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"                  className="w-5 h-5 transition-transform group-hover:translate-x-1" 

              >                  style={{ color: designSystem.colors.text.secondary }}

                <div className="flex items-center gap-4">                />

                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white bg-[#009688]">              </div>

                    {patient.nome.charAt(0)}            </Link>

                  </div>          </div>

                  <div>        </div>

                    <h3 className="font-semibold text-[#2C3E50]">

                      {patient.nome}        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">

                    </h3>          <div className="px-6 py-4 border-b border-gray-100">

                    <p className="text-sm text-[#7F8C8D]">            <div className="flex items-center justify-between">

                      Última consulta: {new Date(patient.ultimaConsulta).toLocaleDateString('pt-BR')}              <h2 className="text-xl font-bold" style={{ color: designSystem.colors.text.primary }}>

                    </p>                Pacientes Recentes

                  </div>              </h2>

                </div>              <Link 

                <div className="flex items-center gap-3">                href="/patients"

                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#4CAF50]/10 text-[#4CAF50]">                className="text-sm font-medium hover:underline"

                    {patient.status}                style={{ color: designSystem.colors.primary }}

                  </span>              >

                  <ChevronRight className="w-5 h-5 text-[#7F8C8D]" />                Ver todos

                </div>              </Link>

              </Link>            </div>

            ))}          </div>

          </div>          <div className="divide-y divide-gray-100">

        </div>            {recentPatients.map((patient) => (

              <Link

        <div className="mt-8 text-center">                key={patient.id}

          <p className="text-sm text-[#7F8C8D]">                href={`/patients/${patient.id}/records`}

            PhysioCapture © 2024 • Desenvolvido por{' '}                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"

            <span className="font-semibold text-[#009688]">              >

              Core Hive                <div className="flex items-center gap-4">

            </span>                  <div 

          </p>                    className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"

        </div>                    style={{ backgroundColor: designSystem.colors.primary }}

      </div>                  >

    </div>                    {patient.nome.charAt(0)}

  );                  </div>

}                  <div>

                    <h3 className="font-semibold" style={{ color: designSystem.colors.text.primary }}>
                      {patient.nome}
                    </h3>
                    <p className="text-sm" style={{ color: designSystem.colors.text.secondary }}>
                      Última consulta: {new Date(patient.ultimaConsulta).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${designSystem.colors.success}15`,
                      color: designSystem.colors.success
                    }}
                  >
                    {patient.status}
                  </span>
                  <ChevronRight className="w-5 h-5" style={{ color: designSystem.colors.text.secondary }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: designSystem.colors.text.secondary }}>
            PhysioCapture © 2024 • Desenvolvido por{' '}
            <span className="font-semibold" style={{ color: designSystem.colors.primary }}>
              Core Hive
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
