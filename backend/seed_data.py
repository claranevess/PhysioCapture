"""
Script para popular dados iniciais do PhysioCapture
Execute com: python manage.py shell < seed_data.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from datetime import date, time, timedelta
from authentication.models import Clinica, User
from prontuario.models import Patient, MedicalRecord, TreatmentPlan, PhysioSession
from documentos.models import DocumentCategory
from estoque.models import InventoryCategory, InventoryItem

print("🌱 Iniciando seed de dados...")

# ============================
# 1. CRIAR CLÍNICA PRINCIPAL
# ============================
clinica, created = Clinica.objects.get_or_create(
    cnpj="00.000.000/0001-00",
    defaults={
        "nome": "Clínica FisioCapture Demo",
        "razao_social": "FisioCapture Demonstração LTDA",
        "email": "contato@fisiocapture.com.br",
        "telefone": "(11) 3555-1234",
        "endereco": "Av. Paulista",
        "numero": "1000",
        "complemento": "Conj. 101",
        "bairro": "Bela Vista",
        "cidade": "São Paulo",
        "estado": "SP",
        "cep": "01310-100",
        "ativa": True,
    }
)
print(f"{'✅ Criada' if created else '📌 Existente'} Clínica: {clinica.nome}")

# ============================
# 2. CRIAR USUÁRIOS
# ============================

# Gestor
gestor, created = User.objects.get_or_create(
    username="gestor",
    defaults={
        "email": "gestor@fisiocapture.com.br",
        "first_name": "Admin",
        "last_name": "Gestor",
        "cpf": "111.111.111-11",
        "clinica": clinica,
        "user_type": "GESTOR",
        "phone": "(11) 99999-0001",
    }
)
if created:
    gestor.set_password("demo123")
    gestor.save()
print(f"{'✅ Criado' if created else '📌 Existente'} Gestor: {gestor.username} (senha: demo123)")

# Fisioterapeutas
fisios_data = [
    {"username": "fisio1", "first_name": "Ana", "last_name": "Silva", "cpf": "222.222.222-22", "crefito": "CREFITO-3/12345", "especialidade": "Ortopedia"},
    {"username": "fisio2", "first_name": "Carlos", "last_name": "Santos", "cpf": "333.333.333-33", "crefito": "CREFITO-3/67890", "especialidade": "Neurologia"},
]

fisioterapeutas = []
for data in fisios_data:
    fisio, created = User.objects.get_or_create(
        username=data["username"],
        defaults={
            "email": f"{data['username']}@fisiocapture.com.br",
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "cpf": data["cpf"],
            "crefito": data["crefito"],
            "especialidade": data["especialidade"],
            "clinica": clinica,
            "user_type": "FISIOTERAPEUTA",
            "phone": f"(11) 99999-{1001 + len(fisioterapeutas):04d}",
        }
    )
    if created:
        fisio.set_password("demo123")
        fisio.save()
    fisioterapeutas.append(fisio)
    print(f"{'✅ Criado' if created else '📌 Existente'} Fisioterapeuta: {fisio.get_full_name()} (senha: demo123)")

# Atendente
atendente, created = User.objects.get_or_create(
    username="atendente",
    defaults={
        "email": "recepcao@fisiocapture.com.br",
        "first_name": "Maria",
        "last_name": "Recepcao",
        "cpf": "444.444.444-44",
        "clinica": clinica,
        "user_type": "ATENDENTE",
        "phone": "(11) 99999-0002",
    }
)
if created:
    atendente.set_password("demo123")
    atendente.save()
print(f"{'✅ Criado' if created else '📌 Existente'} Atendente: {atendente.username} (senha: demo123)")

# ============================
# 3. CRIAR PACIENTES
# ============================
pacientes_data = [
    {"full_name": "João Silva", "cpf": "501.501.501-01", "birth_date": date(1985, 3, 15), "gender": "M", "phone": "(11) 98765-4321", "fisio": fisioterapeutas[0]},
    {"full_name": "Maria Oliveira", "cpf": "502.502.502-02", "birth_date": date(1992, 7, 22), "gender": "F", "phone": "(11) 98765-4322", "fisio": fisioterapeutas[0]},
    {"full_name": "Pedro Costa", "cpf": "503.503.503-03", "birth_date": date(1978, 11, 8), "gender": "M", "phone": "(11) 98765-4323", "fisio": fisioterapeutas[1]},
    {"full_name": "Ana Santos", "cpf": "504.504.504-04", "birth_date": date(1995, 1, 30), "gender": "F", "phone": "(11) 98765-4324", "fisio": fisioterapeutas[1]},
]

pacientes = []
for data in pacientes_data:
    paciente, created = Patient.objects.get_or_create(
        clinica=clinica,
        cpf=data["cpf"],
        defaults={
            "full_name": data["full_name"],
            "birth_date": data["birth_date"],
            "gender": data["gender"],
            "phone": data["phone"],
            "fisioterapeuta": data["fisio"],
        }
    )
    pacientes.append(paciente)
    print(f"{'✅ Criado' if created else '📌 Existente'} Paciente: {paciente.full_name}")

# ============================
# 4. CRIAR CATEGORIAS DE DOCUMENTOS
# ============================
doc_categories = [
    {"name": "Exame", "description": "Exames de imagem e laboratoriais", "color": "#3B82F6"},
    {"name": "Laudo Médico", "description": "Laudos e pareceres médicos", "color": "#10B981"},
    {"name": "Foto Clínica", "description": "Fotos de evolução e avaliação", "color": "#8B5CF6"},
    {"name": "Ficha de Avaliação", "description": "Fichas e formulários preenchidos", "color": "#F59E0B"},
    {"name": "Documento Administrativo", "description": "Contratos, autorizações e documentos gerais", "color": "#6B7280"},
]

for data in doc_categories:
    cat, created = DocumentCategory.objects.get_or_create(
        name=data["name"],
        defaults={"description": data["description"], "color": data["color"]}
    )
    print(f"{'✅ Criada' if created else '📌 Existente'} Categoria Doc: {cat.name}")

# ============================
# 5. CRIAR CATEGORIAS DE ESTOQUE
# ============================
inv_categories = [
    {"name": "Materiais de Curativo", "description": "Bandagens, gazes, esparadrapos"},
    {"name": "Eletrodos e Gel", "description": "Eletrodos para eletroterapia e gel condutor"},
    {"name": "Fitas e Bandagens Elásticas", "description": "Kinesio tape, faixas elásticas"},
    {"name": "Descartáveis", "description": "Luvas, máscaras, toucas"},
    {"name": "Crioterapia", "description": "Gelo instantâneo, compressas geladas"},
]

for data in inv_categories:
    cat, created = InventoryCategory.objects.get_or_create(
        clinica=clinica,
        name=data["name"],
        defaults={"description": data["description"]}
    )
    print(f"{'✅ Criada' if created else '📌 Existente'} Categoria Estoque: {cat.name}")

# ============================
# 6. CRIAR ITENS DE ESTOQUE
# ============================
inv_items = [
    {"name": "Bandagem Elástica 10cm", "category_name": "Materiais de Curativo", "quantity": 50, "min_quantity": 10, "unit": "unidade"},
    {"name": "Eletrodo Adesivo (par)", "category_name": "Eletrodos e Gel", "quantity": 100, "min_quantity": 20, "unit": "par"},
    {"name": "Kinesio Tape 5cm x 5m", "category_name": "Fitas e Bandagens Elásticas", "quantity": 15, "min_quantity": 5, "unit": "rolo"},
    {"name": "Luvas Procedimento M (cx 100)", "category_name": "Descartáveis", "quantity": 10, "min_quantity": 3, "unit": "caixa"},
    {"name": "Gelo Instantâneo", "category_name": "Crioterapia", "quantity": 30, "min_quantity": 10, "unit": "unidade"},
]

for data in inv_items:
    cat = InventoryCategory.objects.get(clinica=clinica, name=data["category_name"])
    item, created = InventoryItem.objects.get_or_create(
        clinica=clinica,
        name=data["name"],
        defaults={
            "category": cat,
            "quantity": data["quantity"],
            "min_quantity": data["min_quantity"],
            "unit": data["unit"],
            "item_type": "MATERIAL",
            "created_by": gestor,
        }
    )
    print(f"{'✅ Criado' if created else '📌 Existente'} Item Estoque: {item.name} ({item.quantity} {item.get_unit_display()})")

# ============================
# 7. CRIAR PLANOS DE TRATAMENTO
# ============================
for i, paciente in enumerate(pacientes[:2]):  # Apenas 2 primeiros pacientes
    plano, created = TreatmentPlan.objects.get_or_create(
        patient=paciente,
        fisioterapeuta=paciente.fisioterapeuta,
        title=f"Plano de Reabilitação - {paciente.full_name}",
        defaults={
            "clinica": clinica,
            "objectives": "Recuperar amplitude de movimento e reduzir dor",
            "total_sessions": 10,
            "frequency": "2x_semana",
            "start_date": date.today() - timedelta(days=14),
            "status": "ATIVO",
        }
    )
    
    # Criar algumas sessões para cada plano
    if created:
        for j in range(3):  # 3 sessões já realizadas
            PhysioSession.objects.create(
                patient=paciente,
                fisioterapeuta=paciente.fisioterapeuta,
                clinica=clinica,
                treatment_plan=plano,
                scheduled_date=date.today() - timedelta(days=14 - j*3),
                scheduled_time=time(9 + j, 0),
                session_number=j + 1,
                status="REALIZADA",
                procedures=f"Exercícios de mobilização, alongamento e fortalecimento.",
                evolution=f"Paciente apresentou melhora na sessão {j+1}.",
                created_by=paciente.fisioterapeuta,
            )
        
        # Sessão agendada para hoje
        PhysioSession.objects.create(
            patient=paciente,
            fisioterapeuta=paciente.fisioterapeuta,
            clinica=clinica,
            treatment_plan=plano,
            scheduled_date=date.today(),
            scheduled_time=time(14, 0),
            session_number=4,
            status="AGENDADA",
            created_by=atendente,
        )
    
    print(f"{'✅ Criado' if created else '📌 Existente'} Plano: {plano.title}")

print("\n" + "="*50)
print("🎉 Seed concluído com sucesso!")
print("="*50)
print("\n📋 Usuários criados para teste:")
print("   GESTOR:        gestor / demo123")
print("   FISIOTERAPEUTA: fisio1 / demo123")
print("   FISIOTERAPEUTA: fisio2 / demo123")
print("   ATENDENTE:     atendente / demo123")
print("\n")
