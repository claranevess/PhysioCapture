"""
Script para criar dados de teste no banco de dados
Execute com: python manage.py shell < populate_test_data.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from prontuario.models import Patient, MedicalRecord
from documentos.models import DocumentCategory
from datetime import date, datetime, timedelta

print("🚀 Iniciando população do banco de dados...")

# Pegar o usuário admin
admin = User.objects.get(username='admin')

# Criar categorias de documentos
print("\n📁 Criando categorias de documentos...")
categories = [
    {'name': 'Exames', 'description': 'Resultados de exames médicos', 'icon': 'lab', 'color': '#3B82F6'},
    {'name': 'Receitas', 'description': 'Receitas médicas', 'icon': 'prescription', 'color': '#10B981'},
    {'name': 'Laudos', 'description': 'Laudos médicos', 'icon': 'document', 'color': '#F59E0B'},
    {'name': 'Imagens', 'description': 'Radiografias, tomografias, etc', 'icon': 'image', 'color': '#8B5CF6'},
]

for cat_data in categories:
    category, created = DocumentCategory.objects.get_or_create(
        name=cat_data['name'],
        defaults=cat_data
    )
    if created:
        print(f"  ✓ Categoria criada: {category.name}")

# Criar pacientes de teste
print("\n👥 Criando pacientes de teste...")
patients_data = [
    {
        'full_name': 'Maria Silva Santos',
        'cpf': '123.456.789-00',
        'birth_date': date(1985, 5, 15),
        'gender': 'F',
        'phone': '(11) 98765-4321',
        'email': 'maria.silva@email.com',
        'address': 'Rua das Flores, 123',
        'city': 'São Paulo',
        'state': 'SP',
        'zip_code': '01234-567',
        'blood_type': 'O+',
        'allergies': 'Dipirona',
    },
    {
        'full_name': 'João Pedro Oliveira',
        'cpf': '987.654.321-00',
        'birth_date': date(1992, 8, 20),
        'gender': 'M',
        'phone': '(11) 91234-5678',
        'email': 'joao.oliveira@email.com',
        'address': 'Av. Paulista, 1000',
        'city': 'São Paulo',
        'state': 'SP',
        'zip_code': '01310-100',
        'blood_type': 'A+',
    },
    {
        'full_name': 'Ana Carolina Ferreira',
        'cpf': '456.789.123-00',
        'birth_date': date(1978, 12, 10),
        'gender': 'F',
        'phone': '(21) 97777-8888',
        'email': 'ana.ferreira@email.com',
        'address': 'Rua do Catete, 456',
        'city': 'Rio de Janeiro',
        'state': 'RJ',
        'zip_code': '22220-000',
        'blood_type': 'B+',
        'medications': 'Losartana 50mg',
    },
]

patients = []
for patient_data in patients_data:
    patient, created = Patient.objects.get_or_create(
        cpf=patient_data['cpf'],
        defaults={**patient_data, 'created_by': admin}
    )
    patients.append(patient)
    if created:
        print(f"  ✓ Paciente criado: {patient.full_name}")

# Criar prontuários de teste
print("\n📋 Criando prontuários de teste...")
records_data = [
    {
        'patient': patients[0],
        'record_type': 'CONSULTA',
        'title': 'Consulta Inicial - Fisioterapia',
        'chief_complaint': 'Dor lombar há 2 semanas',
        'history': 'Paciente relata dor lombar iniciada após levantar peso. Dor em fisgada, piora ao movimentar.',
        'physical_exam': 'Postura anteriorizada. Tensão muscular em paravertebrais lombares. Teste de Lasègue negativo.',
        'diagnosis': 'Lombalgia mecânica aguda',
        'treatment_plan': 'Sessões de fisioterapia 3x/semana. TENS, alongamentos e fortalecimento de core.',
        'record_date': datetime.now() - timedelta(days=7),
    },
    {
        'patient': patients[0],
        'record_type': 'EVOLUCAO',
        'title': 'Evolução - 5ª Sessão',
        'chief_complaint': 'Melhora da dor lombar',
        'observations': 'Paciente apresenta melhora de 70% da dor. Consegue realizar AVDs sem limitações.',
        'treatment_plan': 'Manter protocolo. Adicionar exercícios de propriocepção.',
        'record_date': datetime.now() - timedelta(days=2),
    },
    {
        'patient': patients[1],
        'record_type': 'AVALIACAO',
        'title': 'Avaliação Fisioterapêutica - Ombro',
        'chief_complaint': 'Dor no ombro direito',
        'history': 'Dor no ombro direito há 3 meses. Piora ao elevar o braço acima de 90 graus.',
        'physical_exam': 'ROM ombro D: Flexão 120°, Abdução 110° (com dor). Teste de Neer positivo.',
        'diagnosis': 'Síndrome do impacto subacromial',
        'treatment_plan': 'Protocolo de fortalecimento de manguito rotador. Mobilização glenoumeral.',
        'record_date': datetime.now() - timedelta(days=5),
    },
    {
        'patient': patients[2],
        'record_type': 'CONSULTA',
        'title': 'Consulta - Reabilitação Pós-Cirúrgica',
        'chief_complaint': 'Pós-operatório de prótese de joelho',
        'history': 'Paciente submetida a artroplastia total de joelho esquerdo há 30 dias.',
        'physical_exam': 'Cicatriz cirúrgica em bom estado. Edema leve. ROM: 0-85°.',
        'diagnosis': 'Pós-operatório de artroplastia total de joelho',
        'treatment_plan': 'Ganho de ADM, fortalecimento de quadríceps, treino de marcha.',
        'record_date': datetime.now() - timedelta(days=3),
    },
]

for record_data in records_data:
    record = MedicalRecord.objects.create(
        **record_data,
        created_by=admin
    )
    print(f"  ✓ Prontuário criado: {record.title} - {record.patient.full_name}")

print("\n✅ Dados de teste criados com sucesso!")
print(f"\n📊 Resumo:")
print(f"   - {Patient.objects.count()} pacientes")
print(f"   - {MedicalRecord.objects.count()} prontuários")
print(f"   - {DocumentCategory.objects.count()} categorias de documentos")
print(f"\n🔐 Acesso ao admin:")
print(f"   URL: http://127.0.0.1:8000/admin/")
print(f"   Usuário: admin")
print(f"   Senha: admin123")
