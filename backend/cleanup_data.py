"""
Script para limpar e reorganizar dados de demo
Execute com: python cleanup_data.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import Clinica, User
from prontuario.models import Patient, MedicalRecord, PhysioSession

print("🧹 Iniciando limpeza de dados...")

# Buscar clínica e fisioterapeutas
clinica = Clinica.objects.first()
fisio1 = User.objects.filter(username='fisio1').first()
fisio2 = User.objects.filter(username='fisio2').first()

if not fisio1 or not fisio2:
    print("❌ Fisioterapeutas não encontrados")
    exit(1)

# Limpar todos os prontuários de teste (criados pelo seed)
deleted_records = MedicalRecord.objects.all().delete()
print(f"🗑️  Deletados {deleted_records[0]} prontuários")

# Limpar todas as sessões
deleted_sessions = PhysioSession.objects.all().delete()
print(f"🗑️  Deletadas {deleted_sessions[0]} sessões")

# Redistribuir pacientes entre os fisioterapeutas
patients = Patient.objects.filter(clinica=clinica)
print(f"\n📋 Total de pacientes: {patients.count()}")

# Metade para fisio1, metade para fisio2
for i, patient in enumerate(patients):
    if i % 2 == 0:
        patient.fisioterapeuta = fisio1
        print(f"   {patient.full_name} → {fisio1.first_name}")
    else:
        patient.fisioterapeuta = fisio2
        print(f"   {patient.full_name} → {fisio2.first_name}")
    patient.save()

print("\n✅ Dados limpos e reorganizados!")
print(f"   Pacientes de {fisio1.first_name}: {Patient.objects.filter(fisioterapeuta=fisio1).count()}")
print(f"   Pacientes de {fisio2.first_name}: {Patient.objects.filter(fisioterapeuta=fisio2).count()}")
