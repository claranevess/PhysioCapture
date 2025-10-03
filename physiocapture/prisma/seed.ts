import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  console.log('🗑️  Limpando dados existentes...')
  await prisma.document.deleteMany()
  await prisma.consultation.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.user.deleteMany()
  await prisma.clinic.deleteMany()

  // Criar clínicas de exemplo
  console.log('🏥 Criando clínicas...')
  
  const clinic1 = await prisma.clinic.create({
    data: {
      name: 'FisioVida Clínica de Reabilitação',
      cnpj: '12.345.678/0001-90',
      email: 'contato@fisiovida.com.br',
      phone: '(11) 98765-4321',
      phoneSecondary: '(11) 3456-7890',
      zipCode: '01310-100',
      street: 'Av. Paulista',
      number: '1578',
      complement: 'Conjunto 405',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      plan: 'PROFESSIONAL',
      planStatus: 'ACTIVE',
      maxUsers: 10,
      maxPatients: 500,
      maxStorage: 10,
      website: 'https://fisiovida.com.br',
      description: 'Clínica especializada em reabilitação e fisioterapia esportiva',
    }
  })

  const clinic2 = await prisma.clinic.create({
    data: {
      name: 'Centro de Fisioterapia Movimento',
      cnpj: '98.765.432/0001-10',
      email: 'contato@movimento.com.br',
      phone: '(11) 91234-5678',
      zipCode: '04567-890',
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Jardim Europa',
      city: 'São Paulo',
      state: 'SP',
      plan: 'BASIC',
      planStatus: 'TRIAL',
      maxUsers: 5,
      maxPatients: 100,
      maxStorage: 5,
    }
  })

  console.log('✅ Clínicas criadas')

  // Criar usuários para Clínica 1
  console.log('👥 Criando usuários...')
  
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@fisiovida.com.br',
      password: await bcrypt.hash('admin123', 10),
      name: 'Dr. João Silva',
      role: 'ADMIN',
      crm: '12345-SP',
      cpf: '123.456.789-00',
      phone: '(11) 98765-0001',
      clinicId: clinic1.id,
    }
  })

  const manager1 = await prisma.user.create({
    data: {
      email: 'gestao@fisiovida.com.br',
      password: await bcrypt.hash('gestao123', 10),
      name: 'Ana Paula Oliveira',
      role: 'MANAGER',
      cpf: '234.567.890-11',
      phone: '(11) 98765-0002',
      clinicId: clinic1.id,
    }
  })

  const therapist1 = await prisma.user.create({
    data: {
      email: 'maria@fisiovida.com.br',
      password: await bcrypt.hash('fisio123', 10),
      name: 'Dra. Maria Santos',
      role: 'PHYSIOTHERAPIST',
      crm: '67890-SP',
      cpf: '345.678.901-22',
      phone: '(11) 98765-0003',
      clinicId: clinic1.id,
    }
  })

  const therapist2 = await prisma.user.create({
    data: {
      email: 'carlos@fisiovida.com.br',
      password: await bcrypt.hash('fisio123', 10),
      name: 'Dr. Carlos Eduardo',
      role: 'PHYSIOTHERAPIST',
      crm: '54321-SP',
      cpf: '456.789.012-33',
      phone: '(11) 98765-0004',
      clinicId: clinic1.id,
    }
  })

  const receptionist1 = await prisma.user.create({
    data: {
      email: 'recepcao@fisiovida.com.br',
      password: await bcrypt.hash('recepcao123', 10),
      name: 'Juliana Costa',
      role: 'RECEPTIONIST',
      cpf: '567.890.123-44',
      phone: '(11) 98765-0005',
      clinicId: clinic1.id,
    }
  })

  // Adicionar mais fisioterapeutas recentes (últimos dias)
  const therapist3 = await prisma.user.create({
    data: {
      email: 'fernanda@fisiovida.com.br',
      password: await bcrypt.hash('fisio123', 10),
      name: 'Dra. Fernanda Martins',
      role: 'PHYSIOTHERAPIST',
      crm: '11223-SP',
      cpf: '678.901.234-56',
      phone: '(11) 98765-0006',
      clinicId: clinic1.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    }
  })

  const receptionist2 = await prisma.user.create({
    data: {
      email: 'atendimento@fisiovida.com.br',
      password: await bcrypt.hash('recepcao123', 10),
      name: 'Lucas Mendes',
      role: 'RECEPTIONIST',
      cpf: '789.012.345-67',
      phone: '(11) 98765-0007',
      clinicId: clinic1.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
    }
  })

  const therapist4 = await prisma.user.create({
    data: {
      email: 'rodrigo@fisiovida.com.br',
      password: await bcrypt.hash('fisio123', 10),
      name: 'Dr. Rodrigo Alves',
      role: 'PHYSIOTHERAPIST',
      crm: '33445-SP',
      cpf: '890.123.456-78',
      phone: '(11) 98765-0008',
      clinicId: clinic1.id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    }
  })

  // Criar usuário para Clínica 2
  const admin2 = await prisma.user.create({
    data: {
      email: 'admin@movimento.com.br',
      password: await bcrypt.hash('admin123', 10),
      name: 'Dra. Patricia Lima',
      role: 'ADMIN',
      crm: '99999-SP',
      cpf: '678.901.234-55',
      phone: '(11) 91234-0001',
      clinicId: clinic2.id,
    }
  })

  const therapist5 = await prisma.user.create({
    data: {
      email: 'beatriz@movimento.com.br',
      password: await bcrypt.hash('fisio123', 10),
      name: 'Dra. Beatriz Souza',
      role: 'PHYSIOTHERAPIST',
      crm: '55667-SP',
      cpf: '901.234.567-89',
      phone: '(11) 91234-0002',
      clinicId: clinic2.id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
    }
  })

  // Mais usuários para Clínica 2 (Centro Movimento)
  const manager2 = await prisma.user.create({
    data: {
      email: 'gestao@movimento.com.br',
      password: await bcrypt.hash('gestao123', 10),
      name: 'Carlos Roberto Mendes',
      role: 'MANAGER',
      cpf: '012.345.678-90',
      phone: '(11) 91234-0003',
      clinicId: clinic2.id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    }
  })

  const therapist6 = await prisma.user.create({
    data: {
      email: 'ricardo@movimento.com.br',
      password: await bcrypt.hash('fisio123', 10),
      name: 'Dr. Ricardo Fernandes',
      role: 'PHYSIOTHERAPIST',
      crm: '66778-SP',
      cpf: '123.456.789-01',
      phone: '(11) 91234-0004',
      clinicId: clinic2.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    }
  })

  const receptionist3 = await prisma.user.create({
    data: {
      email: 'recepcao@movimento.com.br',
      password: await bcrypt.hash('recepcao123', 10),
      name: 'Amanda Cristina Silva',
      role: 'RECEPTIONIST',
      cpf: '234.567.890-12',
      phone: '(11) 91234-0005',
      clinicId: clinic2.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
    }
  })

  const therapist7 = await prisma.user.create({
    data: {
      email: 'juliana@movimento.com.br',
      password: await bcrypt.hash('fisio123', 10),
      name: 'Dra. Juliana Martins',
      role: 'PHYSIOTHERAPIST',
      crm: '77889-SP',
      cpf: '345.678.901-23',
      phone: '(11) 91234-0006',
      clinicId: clinic2.id,
      createdAt: new Date(), // Criado hoje
    }
  })

  console.log('✅ Usuários criados')

  // Criar pacientes de exemplo para Clínica 1
  console.log('🏃 Criando pacientes...')
  
  // Paciente criado há 6 dias
  const patient1 = await prisma.patient.create({
    data: {
      fullName: 'Pedro Henrique Almeida',
      cpf: '111.222.333-44',
      dateOfBirth: new Date('1985-05-15'),
      age: 39,
      phone: '(11) 99876-5432',
      email: 'pedro.almeida@email.com',
      zipCode: '01234-567',
      street: 'Rua das Acácias',
      number: '456',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo',
      state: 'SP',
      occupation: 'Engenheiro',
      insurance: 'Unimed',
      insuranceNumber: '123456789',
      status: 'ACTIVE',
      chiefComplaint: 'Dor lombar crônica',
      currentIllness: 'Paciente relata dor na região lombar há 6 meses',
      medicalHistory: 'Hipertensão controlada',
      medications: 'Losartana 50mg',
      clinicId: clinic1.id,
      assignedTherapistId: therapist1.id,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 dias atrás
    }
  })

  // Paciente criado há 5 dias
  const patient2 = await prisma.patient.create({
    data: {
      fullName: 'Fernanda Rodrigues',
      cpf: '222.333.444-55',
      dateOfBirth: new Date('1990-08-20'),
      age: 34,
      phone: '(11) 98765-1234',
      email: 'fernanda.rodrigues@email.com',
      zipCode: '02345-678',
      street: 'Av. dos Bandeirantes',
      number: '789',
      neighborhood: 'Mooca',
      city: 'São Paulo',
      state: 'SP',
      occupation: 'Professora',
      status: 'ACTIVE',
      chiefComplaint: 'Lesão no joelho direito',
      currentIllness: 'Lesão de LCA em prática esportiva',
      medicalHistory: 'Sem comorbidades',
      clinicId: clinic1.id,
      assignedTherapistId: therapist2.id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
    }
  })

  // Paciente criado há 4 dias
  const patient3 = await prisma.patient.create({
    data: {
      fullName: 'Roberto Silva Santos',
      cpf: '333.444.555-66',
      dateOfBirth: new Date('1978-03-10'),
      age: 46,
      phone: '(11) 97654-3210',
      email: 'roberto.santos@email.com',
      zipCode: '03456-789',
      street: 'Rua do Comércio',
      number: '123',
      neighborhood: 'Brás',
      city: 'São Paulo',
      state: 'SP',
      occupation: 'Contador',
      insurance: 'Bradesco Saúde',
      insuranceNumber: '987654321',
      status: 'ACTIVE',
      chiefComplaint: 'Dor no ombro direito',
      currentIllness: 'Dor no ombro há 1 mês, dificuldade para elevar o braço',
      medicalHistory: 'Diabetes tipo 2',
      medications: 'Metformina 850mg',
      clinicId: clinic1.id,
      assignedTherapistId: therapist3.id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
    }
  })

  // Paciente criado há 3 dias
  const patient4 = await prisma.patient.create({
    data: {
      fullName: 'Mariana Costa Lima',
      cpf: '444.555.666-77',
      dateOfBirth: new Date('1988-11-25'),
      age: 35,
      phone: '(11) 96543-2109',
      email: 'mariana.lima@email.com',
      zipCode: '04567-890',
      street: 'Av. Paulista',
      number: '1500',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      occupation: 'Designer',
      status: 'ACTIVE',
      chiefComplaint: 'Dor cervical',
      currentIllness: 'Dor cervical por má postura no trabalho',
      clinicId: clinic1.id,
      assignedTherapistId: therapist1.id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    }
  })

  // Paciente criado há 2 dias
  const patient5 = await prisma.patient.create({
    data: {
      fullName: 'Lucas Ferreira Souza',
      cpf: '555.666.777-88',
      dateOfBirth: new Date('1995-07-08'),
      age: 29,
      phone: '(11) 95432-1098',
      email: 'lucas.souza@email.com',
      zipCode: '05678-901',
      street: 'Rua Augusta',
      number: '2500',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      occupation: 'Personal Trainer',
      status: 'ACTIVE',
      chiefComplaint: 'Lesão no tornozelo',
      currentIllness: 'Entorse de tornozelo durante treino',
      clinicId: clinic1.id,
      assignedTherapistId: therapist4.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    }
  })

  // Paciente criado há 1 dia
  const patient6 = await prisma.patient.create({
    data: {
      fullName: 'Juliana Oliveira Martins',
      cpf: '666.777.888-99',
      dateOfBirth: new Date('1992-02-14'),
      age: 32,
      phone: '(11) 94321-0987',
      email: 'juliana.martins@email.com',
      zipCode: '06789-012',
      street: 'Rua da Consolação',
      number: '800',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      occupation: 'Advogada',
      insurance: 'SulAmérica',
      insuranceNumber: '456789123',
      status: 'ACTIVE',
      chiefComplaint: 'Dor no punho direito',
      currentIllness: 'Possível síndrome do túnel do carpo',
      medicalHistory: 'Sem comorbidades',
      clinicId: clinic1.id,
      assignedTherapistId: therapist2.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
    }
  })

  // Paciente criado hoje
  const patient7 = await prisma.patient.create({
    data: {
      fullName: 'Ricardo Almeida Pereira',
      cpf: '777.888.999-00',
      dateOfBirth: new Date('1982-09-30'),
      age: 42,
      phone: '(11) 93210-9876',
      email: 'ricardo.pereira@email.com',
      zipCode: '07890-123',
      street: 'Av. Rebouças',
      number: '1200',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      occupation: 'Empresário',
      status: 'ACTIVE',
      chiefComplaint: 'Dor no joelho esquerdo',
      currentIllness: 'Dor no joelho após corrida',
      clinicId: clinic1.id,
      assignedTherapistId: therapist3.id,
      createdAt: new Date(), // Criado hoje
    }
  })

  console.log('✅ Pacientes criados')

  // Criar consultas de exemplo
  console.log('📋 Criando consultas...')
  
  // Consultas distribuídas nos últimos 7 dias
  const today = new Date()
  
  // Hoje
  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      type: 'TREATMENT_SESSION',
      subjective: 'Paciente relata melhora significativa',
      objective: 'Amplitude de movimento completa restaurada',
      assessment: 'Evolução excelente',
      plan: 'Alta médica programada para próxima sessão',
      clinicId: clinic1.id,
      patientId: patient1.id,
      performedBy: therapist1.id,
    }
  })

  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      type: 'TREATMENT_SESSION',
      subjective: 'Paciente sem queixas',
      objective: 'Força muscular grau 4',
      assessment: 'Progresso conforme esperado',
      plan: 'Continuar tratamento',
      clinicId: clinic1.id,
      patientId: patient2.id,
      performedBy: therapist2.id,
    }
  })

  // 1 dia atrás
  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 10, 0),
      type: 'TREATMENT_SESSION',
      subjective: 'Dor reduzida para 3/10',
      objective: 'Ganho de 20% na amplitude',
      assessment: 'Resposta positiva ao tratamento',
      plan: 'Manter protocolo',
      clinicId: clinic1.id,
      patientId: patient1.id,
      performedBy: therapist1.id,
    }
  })

  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 15, 30),
      type: 'INITIAL_EVALUATION',
      subjective: 'Dor no ombro há 1 mês',
      objective: 'Limitação de movimento acima de 90°',
      assessment: 'Tendinite de supraespinhal',
      plan: 'Protocolo de fortalecimento e mobilização',
      clinicId: clinic1.id,
      patientId: patient3.id,
      performedBy: therapist3.id,
    }
  })

  // 2 dias atrás
  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 9, 30),
      type: 'TREATMENT_SESSION',
      subjective: 'Paciente relata melhora de 40%',
      objective: 'Teste de Lachman negativo',
      assessment: 'Estabilidade do joelho melhorada',
      plan: 'Avançar para exercícios funcionais',
      clinicId: clinic1.id,
      patientId: patient2.id,
      performedBy: therapist2.id,
    }
  })

  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 16, 0),
      type: 'TREATMENT_SESSION',
      subjective: 'Sem dor em repouso',
      objective: 'Melhora da postura',
      assessment: 'Evolução positiva',
      plan: 'Continuar tratamento',
      clinicId: clinic1.id,
      patientId: patient1.id,
      performedBy: therapist4.id,
    }
  })

  // 3 dias atrás
  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 11, 0),
      type: 'TREATMENT_SESSION',
      subjective: 'Dor ao movimento',
      objective: 'Edema reduzido 50%',
      assessment: 'Fase inflamatória controlada',
      plan: 'Iniciar mobilização ativa',
      clinicId: clinic1.id,
      patientId: patient2.id,
      performedBy: therapist2.id,
    }
  })

  // 4 dias atrás
  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4, 10, 30),
      type: 'INITIAL_EVALUATION',
      subjective: 'Dor lombar há 6 meses, piora ao final do dia',
      objective: 'Limitação de movimento em flexão (50%), teste de elevação da perna positivo',
      assessment: 'Lombalgia mecânica com possível compressão radicular',
      plan: 'Iniciar protocolo de fortalecimento e alongamento. 2x semana por 6 semanas',
      exercises: 'Prancha, ponte, alongamento de isquiotibiais',
      nextVisit: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 10, 30),
      clinicId: clinic1.id,
      patientId: patient1.id,
      performedBy: therapist1.id,
    }
  })

  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4, 14, 0),
      type: 'TREATMENT_SESSION',
      subjective: 'Paciente motivado',
      objective: 'Boa execução dos exercícios',
      assessment: 'Progressão adequada',
      plan: 'Aumentar complexidade',
      clinicId: clinic1.id,
      patientId: patient3.id,
      performedBy: therapist3.id,
    }
  })

  // 5 dias atrás
  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 9, 0),
      type: 'INITIAL_EVALUATION',
      subjective: 'Lesão de LCA há 2 meses, realizou cirurgia',
      objective: 'Edema +/4+, amplitude de movimento 0-90°',
      assessment: 'Pós-operatório de reconstrução de LCA - fase inicial',
      plan: 'Controle de edema, ganho de ADM, fortalecimento de quadríceps',
      nextVisit: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 9, 0),
      clinicId: clinic1.id,
      patientId: patient2.id,
      performedBy: therapist2.id,
    }
  })

  // 6 dias atrás
  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 15, 0),
      type: 'TREATMENT_SESSION',
      subjective: 'Dor controlada com medicação',
      objective: 'Força muscular grau 3',
      assessment: 'Fase de fortalecimento',
      plan: 'Progressão de carga',
      clinicId: clinic1.id,
      patientId: patient1.id,
      performedBy: therapist1.id,
    }
  })

  console.log('✅ Consultas criadas')

  // Contar totais
  const clinicCount = await prisma.clinic.count()
  const userCount = await prisma.user.count()
  const patientCount = await prisma.patient.count()
  const consultationCount = await prisma.consultation.count()

  console.log('🎉 Seed concluído com sucesso!')
  console.log('\n📊 Resumo:')
  console.log(`   - ${clinicCount} clínicas`)
  console.log(`   - ${userCount} usuários`)
  console.log(`   - ${patientCount} pacientes`)
  console.log(`   - ${consultationCount} consultas`)
  console.log('\n🔐 Credenciais de acesso:')
  console.log('\n   FisioVida Clínica:')
  console.log('   Admin: admin@fisiovida.com.br / admin123')
  console.log('   Gestor: gestao@fisiovida.com.br / gestao123')
  console.log('   Fisio 1: maria@fisiovida.com.br / fisio123')
  console.log('   Fisio 2: carlos@fisiovida.com.br / fisio123')
  console.log('   Fisio 3: fernanda@fisiovida.com.br / fisio123')
  console.log('   Fisio 4: rodrigo@fisiovida.com.br / fisio123')
  console.log('   Recepção 1: recepcao@fisiovida.com.br / recepcao123')
  console.log('   Recepção 2: atendimento@fisiovida.com.br / recepcao123')
  console.log('\n   Centro Movimento:')
  console.log('   Admin: admin@movimento.com.br / admin123')
  console.log('   Gestor: gestao@movimento.com.br / gestao123')
  console.log('   Fisio 1: beatriz@movimento.com.br / fisio123')
  console.log('   Fisio 2: ricardo@movimento.com.br / fisio123')
  console.log('   Fisio 3: juliana@movimento.com.br / fisio123')
  console.log('   Recepção: recepcao@movimento.com.br / recepcao123')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
