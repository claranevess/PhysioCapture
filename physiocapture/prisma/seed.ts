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

  console.log('✅ Usuários criados')

  // Criar pacientes de exemplo para Clínica 1
  console.log('🏃 Criando pacientes...')
  
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
    }
  })

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
      currentIllness: 'Lesão de LCA após prática esportiva',
      clinicId: clinic1.id,
      assignedTherapistId: therapist2.id,
    }
  })

  const patient3 = await prisma.patient.create({
    data: {
      fullName: 'Roberto Carlos Silva',
      cpf: '333.444.555-66',
      dateOfBirth: new Date('1978-12-10'),
      age: 46,
      phone: '(11) 97654-3210',
      email: 'roberto.silva@email.com',
      status: 'EVALUATION',
      chiefComplaint: 'Dor no ombro esquerdo',
      clinicId: clinic1.id,
      assignedTherapistId: therapist1.id,
    }
  })

  console.log('✅ Pacientes criados')

  // Criar consultas de exemplo
  console.log('📋 Criando consultas...')
  
  await prisma.consultation.create({
    data: {
      date: new Date('2024-10-01T09:00:00'),
      type: 'INITIAL_EVALUATION',
      subjective: 'Paciente relata dor lombar há 6 meses, piora ao final do dia',
      objective: 'Limitação de movimento em flexão (50%), teste de elevação da perna positivo',
      assessment: 'Lombalgia mecânica com possível compressão radicular',
      plan: 'Iniciar protocolo de fortalecimento e alongamento. 2x semana por 6 semanas',
      exercises: 'Prancha, ponte, alongamento de isquiotibiais',
      nextVisit: new Date('2024-10-03T09:00:00'),
      clinicId: clinic1.id,
      patientId: patient1.id,
      performedBy: therapist1.id,
    }
  })

  await prisma.consultation.create({
    data: {
      date: new Date('2024-10-03T09:00:00'),
      type: 'TREATMENT_SESSION',
      subjective: 'Paciente relata melhora de 30% na dor',
      objective: 'Aumento da amplitude de movimento, melhora na execução dos exercícios',
      assessment: 'Evolução positiva do quadro',
      plan: 'Continuar protocolo atual, aumentar carga dos exercícios',
      exercises: 'Prancha 3x30s, ponte 3x15, agachamento 3x10',
      nextVisit: new Date('2024-10-05T09:00:00'),
      clinicId: clinic1.id,
      patientId: patient1.id,
      performedBy: therapist1.id,
    }
  })

  await prisma.consultation.create({
    data: {
      date: new Date('2024-09-28T14:00:00'),
      type: 'INITIAL_EVALUATION',
      subjective: 'Lesão de LCA há 2 meses, realizou cirurgia',
      objective: 'Edema +/4+, amplitude de movimento 0-90°',
      assessment: 'Pós-operatório de reconstrução de LCA - fase inicial',
      plan: 'Controle de edema, ganho de ADM, fortalecimento de quadríceps',
      nextVisit: new Date('2024-09-30T14:00:00'),
      clinicId: clinic1.id,
      patientId: patient2.id,
      performedBy: therapist2.id,
    }
  })

  console.log('✅ Consultas criadas')

  console.log('🎉 Seed concluído com sucesso!')
  console.log('\n📊 Resumo:')
  console.log(`   - ${await prisma.clinic.count()} clínicas`)
  console.log(`   - ${await prisma.user.count()} usuários`)
  console.log(`   - ${await prisma.patient.count()} pacientes`)
  console.log(`   - ${await prisma.consultation.count()} consultas`)
  console.log('\n🔐 Credenciais de acesso:')
  console.log('\n   FisioVida Clínica:')
  console.log('   Admin: admin@fisiovida.com.br / admin123')
  console.log('   Gestor: gestao@fisiovida.com.br / gestao123')
  console.log('   Fisio 1: maria@fisiovida.com.br / fisio123')
  console.log('   Fisio 2: carlos@fisiovida.com.br / fisio123')
  console.log('   Recepção: recepcao@fisiovida.com.br / recepcao123')
  console.log('\n   Centro Movimento:')
  console.log('   Admin: admin@movimento.com.br / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
