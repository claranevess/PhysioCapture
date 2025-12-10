"""
Script para popular dados iniciais do PhysioCapture
Rede FisioVida com 2 Filiais: Recife e Olinda

Execute com: python manage.py shell < seed_fisiovida.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from datetime import date, time, timedelta
from authentication.models import Clinica, Filial, User
from prontuario.models import Patient, MedicalRecord, TreatmentPlan, PhysioSession
from documentos.models import DocumentCategory
from estoque.models import InventoryCategory, InventoryItem

print("🌱 Iniciando seed de dados - Rede FisioVida...")

# ============================
# 1. CRIAR CLÍNICA PRINCIPAL (REDE)
# ============================
clinica, created = Clinica.objects.get_or_create(
    cnpj="12.345.678/0001-00",
    defaults={
        "nome": "Rede FisioVida",
        "razao_social": "FisioVida Saúde LTDA",
        "email": "contato@fisiovida.com.br",
        "telefone": "(81) 3333-0000",
        "endereco": "Av. Principal",
        "numero": "1000",
        "complemento": "Sede",
        "bairro": "Centro",
        "cidade": "Recife",
        "estado": "PE",
        "cep": "50000-000",
        "ativa": True,
    }
)
print(f"{'✅ Criada' if created else '📌 Existente'} Rede: {clinica.nome}")

# ============================
# 2. CRIAR FILIAIS
# ============================
filial_recife, created = Filial.objects.get_or_create(
    clinica=clinica,
    nome="FisioVida Recife",
    defaults={
        "endereco": "Av. Boa Viagem",
        "numero": "1500",
        "bairro": "Boa Viagem",
        "cidade": "Recife",
        "estado": "PE",
        "cep": "51020-000",
        "telefone": "(81) 3333-1001",
        "email": "recife@fisiovida.com.br",
        "ativa": True,
    }
)
print(f"{'✅ Criada' if created else '📌 Existente'} Filial: {filial_recife.nome}")

filial_olinda, created = Filial.objects.get_or_create(
    clinica=clinica,
    nome="FisioVida Olinda",
    defaults={
        "endereco": "Av. Beira Mar",
        "numero": "500",
        "bairro": "Carmo",
        "cidade": "Olinda",
        "estado": "PE",
        "cep": "53000-000",
        "telefone": "(81) 3333-2001",
        "email": "olinda@fisiovida.com.br",
        "ativa": True,
    }
)
print(f"{'✅ Criada' if created else '📌 Existente'} Filial: {filial_olinda.nome}")

# ============================
# 3. CRIAR GESTOR GERAL (REDE)
# ============================
gestor_geral, created = User.objects.get_or_create(
    username="gestor_geral",
    defaults={
        "email": "gestor.geral@fisiovida.com.br",
        "first_name": "Carlos",
        "last_name": "Administrador",
        "cpf": "000.000.000-01",
        "clinica": clinica,
        "filial": None,  # Gestor Geral não tem filial específica
        "user_type": "GESTOR_GERAL",
        "phone": "(81) 99999-0001",
    }
)
if created:
    gestor_geral.set_password("demo123")
    gestor_geral.save()
print(f"{'✅ Criado' if created else '📌 Existente'} Gestor Geral: {gestor_geral.username} (senha: demo123)")

# ============================
# 4. CRIAR GESTORES DE FILIAL
# ============================
gestor_recife, created = User.objects.get_or_create(
    username="gestor_recife",
    defaults={
        "email": "gestor.recife@fisiovida.com.br",
        "first_name": "Ana",
        "last_name": "Gestora Recife",
        "cpf": "100.100.100-01",
        "clinica": clinica,
        "filial": filial_recife,
        "user_type": "GESTOR_FILIAL",
        "phone": "(81) 99999-1001",
    }
)
if created:
    gestor_recife.set_password("demo123")
    gestor_recife.save()
print(f"{'✅ Criado' if created else '📌 Existente'} Gestor Recife: {gestor_recife.username} (senha: demo123)")

gestor_olinda, created = User.objects.get_or_create(
    username="gestor_olinda",
    defaults={
        "email": "gestor.olinda@fisiovida.com.br",
        "first_name": "Bruno",
        "last_name": "Gestor Olinda",
        "cpf": "200.200.200-01",
        "clinica": clinica,
        "filial": filial_olinda,
        "user_type": "GESTOR_FILIAL",
        "phone": "(81) 99999-2001",
    }
)
if created:
    gestor_olinda.set_password("demo123")
    gestor_olinda.save()
print(f"{'✅ Criado' if created else '📌 Existente'} Gestor Olinda: {gestor_olinda.username} (senha: demo123)")

# ============================
# 5. CRIAR FISIOTERAPEUTAS
# ============================
fisios_recife_data = [
    {"username": "fisio_recife_1", "first_name": "Maria", "last_name": "Silva", "cpf": "101.101.101-01", "crefito": "CREFITO-1/12001", "especialidade": "Ortopedia"},
    {"username": "fisio_recife_2", "first_name": "João", "last_name": "Santos", "cpf": "102.102.102-02", "crefito": "CREFITO-1/12002", "especialidade": "Neurologia"},
    {"username": "fisio_recife_3", "first_name": "Paula", "last_name": "Oliveira", "cpf": "103.103.103-03", "crefito": "CREFITO-1/12003", "especialidade": "Esportiva"},
]

fisios_olinda_data = [
    {"username": "fisio_olinda_1", "first_name": "Pedro", "last_name": "Costa", "cpf": "201.201.201-01", "crefito": "CREFITO-1/22001", "especialidade": "Ortopedia"},
    {"username": "fisio_olinda_2", "first_name": "Lucia", "last_name": "Ferreira", "cpf": "202.202.202-02", "crefito": "CREFITO-1/22002", "especialidade": "Geriátrica"},
    {"username": "fisio_olinda_3", "first_name": "Rafael", "last_name": "Lima", "cpf": "203.203.203-03", "crefito": "CREFITO-1/22003", "especialidade": "Respiratória"},
]

fisios_recife = []
for i, data in enumerate(fisios_recife_data):
    fisio, created = User.objects.get_or_create(
        username=data["username"],
        defaults={
            "email": f"{data['username']}@fisiovida.com.br",
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "cpf": data["cpf"],
            "crefito": data["crefito"],
            "especialidade": data["especialidade"],
            "clinica": clinica,
            "filial": filial_recife,
            "user_type": "FISIOTERAPEUTA",
            "phone": f"(81) 99999-1{i+1:03d}",
        }
    )
    if created:
        fisio.set_password("demo123")
        fisio.save()
    fisios_recife.append(fisio)
    print(f"{'✅ Criado' if created else '📌 Existente'} Fisioterapeuta Recife: {fisio.get_full_name()} (senha: demo123)")

fisios_olinda = []
for i, data in enumerate(fisios_olinda_data):
    fisio, created = User.objects.get_or_create(
        username=data["username"],
        defaults={
            "email": f"{data['username']}@fisiovida.com.br",
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "cpf": data["cpf"],
            "crefito": data["crefito"],
            "especialidade": data["especialidade"],
            "clinica": clinica,
            "filial": filial_olinda,
            "user_type": "FISIOTERAPEUTA",
            "phone": f"(81) 99999-2{i+1:03d}",
        }
    )
    if created:
        fisio.set_password("demo123")
        fisio.save()
    fisios_olinda.append(fisio)
    print(f"{'✅ Criado' if created else '📌 Existente'} Fisioterapeuta Olinda: {fisio.get_full_name()} (senha: demo123)")

# ============================
# 6. CRIAR PACIENTES (2 por fisioterapeuta)
# ============================
pacientes_recife_data = [
    # Fisio 1 - Recife
    {"full_name": "José Pereira", "cpf": "301.301.301-01", "birth_date": date(1980, 3, 15), "gender": "M", "phone": "(81) 98765-0001", "fisio_idx": 0},
    {"full_name": "Mariana Costa", "cpf": "301.301.301-02", "birth_date": date(1992, 7, 22), "gender": "F", "phone": "(81) 98765-0002", "fisio_idx": 0},
    # Fisio 2 - Recife
    {"full_name": "Roberto Alves", "cpf": "302.302.302-01", "birth_date": date(1975, 11, 8), "gender": "M", "phone": "(81) 98765-0003", "fisio_idx": 1},
    {"full_name": "Fernanda Lima", "cpf": "302.302.302-02", "birth_date": date(1988, 1, 30), "gender": "F", "phone": "(81) 98765-0004", "fisio_idx": 1},
    # Fisio 3 - Recife
    {"full_name": "Carlos Mendes", "cpf": "303.303.303-01", "birth_date": date(1995, 5, 12), "gender": "M", "phone": "(81) 98765-0005", "fisio_idx": 2},
    {"full_name": "Juliana Rocha", "cpf": "303.303.303-02", "birth_date": date(1983, 9, 25), "gender": "F", "phone": "(81) 98765-0006", "fisio_idx": 2},
]

pacientes_olinda_data = [
    # Fisio 1 - Olinda
    {"full_name": "Antonio Souza", "cpf": "401.401.401-01", "birth_date": date(1970, 4, 18), "gender": "M", "phone": "(81) 98765-1001", "fisio_idx": 0},
    {"full_name": "Patricia Nunes", "cpf": "401.401.401-02", "birth_date": date(1990, 8, 5), "gender": "F", "phone": "(81) 98765-1002", "fisio_idx": 0},
    # Fisio 2 - Olinda
    {"full_name": "Marcos Vieira", "cpf": "402.402.402-01", "birth_date": date(1965, 12, 20), "gender": "M", "phone": "(81) 98765-1003", "fisio_idx": 1},
    {"full_name": "Sandra Barbosa", "cpf": "402.402.402-02", "birth_date": date(1978, 2, 14), "gender": "F", "phone": "(81) 98765-1004", "fisio_idx": 1},
    # Fisio 3 - Olinda
    {"full_name": "Ricardo Gomes", "cpf": "403.403.403-01", "birth_date": date(1985, 6, 10), "gender": "M", "phone": "(81) 98765-1005", "fisio_idx": 2},
    {"full_name": "Camila Teixeira", "cpf": "403.403.403-02", "birth_date": date(1998, 10, 28), "gender": "F", "phone": "(81) 98765-1006", "fisio_idx": 2},
]

pacientes_recife = []
for data in pacientes_recife_data:
    paciente, created = Patient.objects.get_or_create(
        clinica=clinica,
        cpf=data["cpf"],
        defaults={
            "full_name": data["full_name"],
            "birth_date": data["birth_date"],
            "gender": data["gender"],
            "phone": data["phone"],
            "filial": filial_recife,
            "fisioterapeuta": fisios_recife[data["fisio_idx"]],
            "available_for_transfer": True,
        }
    )
    pacientes_recife.append(paciente)
    print(f"{'✅ Criado' if created else '📌 Existente'} Paciente Recife: {paciente.full_name}")

pacientes_olinda = []
for data in pacientes_olinda_data:
    paciente, created = Patient.objects.get_or_create(
        clinica=clinica,
        cpf=data["cpf"],
        defaults={
            "full_name": data["full_name"],
            "birth_date": data["birth_date"],
            "gender": data["gender"],
            "phone": data["phone"],
            "filial": filial_olinda,
            "fisioterapeuta": fisios_olinda[data["fisio_idx"]],
            "available_for_transfer": True,
        }
    )
    pacientes_olinda.append(paciente)
    print(f"{'✅ Criado' if created else '📌 Existente'} Paciente Olinda: {paciente.full_name}")

# ============================
# 7. CRIAR CATEGORIAS DE DOCUMENTOS
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
# 8. CRIAR CATEGORIAS DE ESTOQUE
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
# 9. CRIAR PLANOS DE TRATAMENTO (para os primeiros pacientes)
# ============================
for paciente in pacientes_recife[:2] + pacientes_olinda[:2]:
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
    
    if created:
        # Criar algumas sessões para cada plano
        for j in range(3):
            PhysioSession.objects.create(
                patient=paciente,
                fisioterapeuta=paciente.fisioterapeuta,
                clinica=clinica,
                treatment_plan=plano,
                scheduled_date=date.today() - timedelta(days=14 - j*3),
                scheduled_time=time(9 + j, 0),
                session_number=j + 1,
                status="REALIZADA",
                procedures="Exercícios de mobilização, alongamento e fortalecimento.",
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
            created_by=paciente.fisioterapeuta,
        )
    
    print(f"{'✅ Criado' if created else '📌 Existente'} Plano: {plano.title}")

print("\n" + "="*60)
print("🎉 Seed concluído com sucesso!")
print("="*60)
print("\n📋 Usuários criados para teste:")
print("")
print("   GESTOR GERAL (toda a rede):")
print("       gestor_geral / demo123")
print("")
print("   GESTORES DE FILIAL:")
print("       gestor_recife / demo123  (apenas Recife)")
print("       gestor_olinda / demo123  (apenas Olinda)")
print("")
print("   FISIOTERAPEUTAS RECIFE:")
print("       fisio_recife_1 / demo123  (2 pacientes)")
print("       fisio_recife_2 / demo123  (2 pacientes)")
print("       fisio_recife_3 / demo123  (2 pacientes)")
print("")
print("   FISIOTERAPEUTAS OLINDA:")
print("       fisio_olinda_1 / demo123  (2 pacientes)")
print("       fisio_olinda_2 / demo123  (2 pacientes)")
print("       fisio_olinda_3 / demo123  (2 pacientes)")
print("")
print("📊 Estrutura:")
print("   1 Rede: FisioVida")
print("   2 Filiais: Recife e Olinda")
print("   6 Fisioterapeutas (3 por filial)")
print("   12 Pacientes (2 por fisioterapeuta)")
print("")
