"""
Script para popular dados completos do PhysioCapture
Inclui prontuários, documentos, e dados da clínica
Execute com: python seed_complete.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from datetime import date, time, timedelta, datetime
from authentication.models import Clinica, User
from prontuario.models import Patient, MedicalRecord, TreatmentPlan, PhysioSession
from documentos.models import DocumentCategory, Document
from estoque.models import InventoryCategory, InventoryItem
from django.utils import timezone
import random

print("🌱 Iniciando seed completo de dados...")

# ============================
# 1. ATUALIZAR CLÍNICA COM DADOS COMPLETOS
# ============================
clinica = Clinica.objects.first()
if clinica:
    clinica.nome = "Clínica FisioVida"
    clinica.razao_social = "FisioVida Fisioterapia LTDA"
    clinica.cnpj = "12.345.678/0001-90"
    clinica.email = "contato@fisiovida.com.br"
    clinica.telefone = "(11) 3555-1234"
    clinica.endereco = "Av. Paulista"
    clinica.numero = "1000"
    clinica.complemento = "Conj. 101, 10º andar"
    clinica.bairro = "Bela Vista"
    clinica.cidade = "São Paulo"
    clinica.estado = "SP"
    clinica.cep = "01310-100"
    clinica.ativa = True
    clinica.save()
    print(f"✅ Clínica atualizada: {clinica.nome} (CNPJ: {clinica.cnpj})")

# Buscar usuários
gestor = User.objects.filter(user_type='GESTOR').first()
fisio1 = User.objects.filter(username='fisio1').first()
fisio2 = User.objects.filter(username='fisio2').first()

# ============================
# 2. CRIAR PRONTUÁRIOS DE DIFERENTES TIPOS
# ============================
patients = Patient.objects.filter(clinica=clinica)
record_types = ['CONSULTA', 'AVALIACAO', 'EVOLUCAO', 'PROCEDIMENTO', 'EXAME']

created_records = 0
for patient in patients:
    # Criar prontuários para últimos 14 dias
    for i in range(14):
        record_date = timezone.now() - timedelta(days=i)
        
        # Chance de criar um prontuário neste dia (70%)
        if random.random() < 0.7:
            record_type = random.choice(record_types)
            
            MedicalRecord.objects.get_or_create(
                patient=patient,
                record_date=record_date,
                record_type=record_type,
                defaults={
                    'title': f'{record_type.capitalize()} - {patient.full_name}',
                    'chief_complaint': 'Dor e limitação funcional',
                    'history': 'Paciente relata melhora progressiva',
                    'physical_exam': 'Amplitude de movimento satisfatória',
                    'diagnosis': 'Em tratamento fisioterapêutico',
                    'treatment_plan': 'Continuar protocolo de exercícios',
                    'observations': f'Sessão do dia {record_date.strftime("%d/%m")}',
                    'created_by': patient.fisioterapeuta,
                }
            )
            created_records += 1

print(f"✅ {created_records} prontuários criados/verificados")

# ============================
# 3. RESUMO ESTATÍSTICO (sem criar documentos que precisam de arquivos reais)
# ============================
print(f"ℹ️  Documentos devem ser criados via upload na interface (requerem arquivos reais)")

created_docs = Document.objects.filter(patient__clinica=clinica).count()
print(f"   Documentos existentes: {created_docs}")

# ============================
# 4. CRIAR MAIS SESSÕES NO HISTÓRICO
# ============================
created_sessions = 0

for patient in patients:
    plano = TreatmentPlan.objects.filter(patient=patient).first()
    
    # Criar sessões nos últimos 7 dias
    for i in range(7):
        session_date = date.today() - timedelta(days=i)
        
        # 50% de chance de sessão neste dia
        if random.random() < 0.5:
            session, created = PhysioSession.objects.get_or_create(
                patient=patient,
                scheduled_date=session_date,
                defaults={
                    'fisioterapeuta': patient.fisioterapeuta,
                    'clinica': clinica,
                    'treatment_plan': plano,
                    'scheduled_time': time(9 + random.randint(0, 8), 0),
                    'duration_minutes': 50,
                    'session_number': random.randint(1, 10),
                    'status': 'REALIZADA' if i > 0 else 'AGENDADA',
                    'procedures': 'Exercícios terapêuticos, mobilização articular',
                    'evolution': 'Paciente evoluindo bem',
                    'pain_scale_before': random.randint(4, 8),
                    'pain_scale_after': random.randint(1, 4),
                    'created_by': gestor,
                }
            )
            if created:
                created_sessions += 1

print(f"✅ {created_sessions} sessões criadas")

# ============================
# 5. ATUALIZAR LAST_VISIT DOS PACIENTES
# ============================
for patient in patients:
    patient.last_visit = timezone.now() - timedelta(days=random.randint(0, 7))
    patient.save()

print(f"✅ Atualizado last_visit de {patients.count()} pacientes")

# ============================
# RESUMO
# ============================
print("\n" + "="*50)
print("🎉 Seed completo concluído!")
print("="*50)

# Estatísticas
total_records = MedicalRecord.objects.filter(patient__clinica=clinica).count()
total_docs = Document.objects.filter(patient__clinica=clinica).count()
total_sessions = PhysioSession.objects.filter(clinica=clinica).count()

print(f"\n📊 Estatísticas da Clínica: {clinica.nome}")
print(f"   CNPJ: {clinica.cnpj}")
print(f"   Endereço: {clinica.endereco}, {clinica.numero} - {clinica.cidade}/{clinica.estado}")
print(f"\n   Pacientes: {patients.count()}")
print(f"   Prontuários: {total_records}")
print(f"   Documentos: {total_docs}")
print(f"   Sessões: {total_sessions}")
print("\n")
