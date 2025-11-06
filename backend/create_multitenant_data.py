"""
Script para criar dados de teste Multi-Tenant
Estrutura: Clínicas → Gestores → Fisioterapeutas → Pacientes (registros)
"""
from authentication.models import Clinica, User
from prontuario.models import Patient
from datetime import date, timedelta
from django.utils import timezone

print("🏥 Criando estrutura Multi-Tenant...\n")

# ===== CLÍNICA 1: FisioVida =====
print("📍 CLÍNICA 1: FisioVida")
clinica1 = Clinica.objects.create(
    nome="FisioVida Centro de Reabilitação",
    cnpj="12.345.678/0001-90",
    razao_social="FisioVida Ltda",
    email="contato@fisiovida.com.br",
    telefone="(11) 3456-7890",
    endereco="Rua das Flores",
    numero="123",
    complemento="Sala 45",
    bairro="Centro",
    cidade="São Paulo",
    estado="SP",
    cep="01234-567",
    ativa=True,
    max_fisioterapeutas=10
)
print(f"✓ Criada: {clinica1.nome}")

# Gestor da FisioVida
gestor1 = User.objects.create_user(
    username="gestor.fisiovida",
    email="gestor@fisiovida.com.br",
    password="123456",
    first_name="Roberto",
    last_name="Silva",
    user_type="GESTOR",
    clinica=clinica1,
    cpf="123.456.789-00",
    phone="(11) 98765-4321"
)
print(f"  ✓ Gestor: {gestor1.get_full_name()} - {gestor1.username}")

# Fisioterapeutas da FisioVida
fisio1_clinica1 = User.objects.create_user(
    username="dra.ana.fisiovida",
    email="ana@fisiovida.com.br",
    password="123456",
    first_name="Ana",
    last_name="Oliveira",
    user_type="FISIOTERAPEUTA",
    clinica=clinica1,
    cpf="234.567.890-11",
    phone="(11) 91234-5678",
    crefito="CREFITO-3/123456",
    especialidade="Ortopedia e Traumatologia"
)
print(f"  ✓ Fisioterapeuta: {fisio1_clinica1.get_full_name()} - {fisio1_clinica1.crefito}")

fisio2_clinica1 = User.objects.create_user(
    username="dr.carlos.fisiovida",
    email="carlos@fisiovida.com.br",
    password="123456",
    first_name="Carlos",
    last_name="Mendes",
    user_type="FISIOTERAPEUTA",
    clinica=clinica1,
    cpf="345.678.901-22",
    phone="(11) 92345-6789",
    crefito="CREFITO-3/654321",
    especialidade="Neurologia"
)
print(f"  ✓ Fisioterapeuta: {fisio2_clinica1.get_full_name()} - {fisio2_clinica1.crefito}")

# Pacientes da FisioVida (Registros, não usuários!)
paciente1 = Patient.objects.create(
    clinica=clinica1,
    fisioterapeuta=fisio1_clinica1,
    full_name="João Pedro Santos",
    cpf="456.789.012-33",
    birth_date=date(1985, 3, 15),
    gender="M",
    phone="(11) 93456-7890",
    email="joao.santos@email.com",
    address="Av. Paulista",
    city="São Paulo",
    state="SP",
    zip_code="01310-100",
    chief_complaint="Dor lombar crônica",
    allergies="Nenhuma",
    medications="Paracetamol 500mg"
)
print(f"  ✓ Paciente: {paciente1.full_name} (Fisio: {fisio1_clinica1.first_name})")

paciente2 = Patient.objects.create(
    clinica=clinica1,
    fisioterapeuta=fisio1_clinica1,
    full_name="Maria Clara Costa",
    cpf="567.890.123-44",
    birth_date=date(1990, 7, 22),
    gender="F",
    phone="(11) 94567-8901",
    email="maria.costa@email.com",
    address="Rua Augusta",
    city="São Paulo",
    state="SP",
    zip_code="01304-000",
    chief_complaint="Tendinite no ombro direito",
    allergies="Dipirona",
    medications="Anti-inflamatório"
)
print(f"  ✓ Paciente: {paciente2.full_name} (Fisio: {fisio1_clinica1.first_name})")

paciente3 = Patient.objects.create(
    clinica=clinica1,
    fisioterapeuta=fisio2_clinica1,
    full_name="Pedro Henrique Lima",
    cpf="678.901.234-55",
    birth_date=date(1978, 11, 8),
    gender="M",
    phone="(11) 95678-9012",
    email="pedro.lima@email.com",
    address="Rua Consolação",
    city="São Paulo",
    state="SP",
    zip_code="01301-000",
    chief_complaint="Reabilitação pós-AVC",
    allergies="Nenhuma",
    medications="Varfarina, Atenolol"
)
print(f"  ✓ Paciente: {paciente3.full_name} (Fisio: {fisio2_clinica1.first_name})")

print()

# ===== CLÍNICA 2: ReabilitaMax =====
print("📍 CLÍNICA 2: ReabilitaMax")
clinica2 = Clinica.objects.create(
    nome="ReabilitaMax Fisioterapia",
    cnpj="98.765.432/0001-10",
    razao_social="ReabilitaMax Serviços de Saúde Ltda",
    email="contato@reabilitamax.com.br",
    telefone="(21) 2345-6789",
    endereco="Av. Atlântica",
    numero="500",
    complemento="Cobertura",
    bairro="Copacabana",
    cidade="Rio de Janeiro",
    estado="RJ",
    cep="22070-001",
    ativa=True,
    max_fisioterapeutas=5
)
print(f"✓ Criada: {clinica2.nome}")

# Gestor da ReabilitaMax
gestor2 = User.objects.create_user(
    username="gestor.reabilitamax",
    email="gestor@reabilitamax.com.br",
    password="123456",
    first_name="Fernanda",
    last_name="Almeida",
    user_type="GESTOR",
    clinica=clinica2,
    cpf="789.012.345-66",
    phone="(21) 99876-5432"
)
print(f"  ✓ Gestor: {gestor2.get_full_name()} - {gestor2.username}")

# Fisioterapeuta da ReabilitaMax
fisio1_clinica2 = User.objects.create_user(
    username="dra.julia.reabilitamax",
    email="julia@reabilitamax.com.br",
    password="123456",
    first_name="Julia",
    last_name="Martins",
    user_type="FISIOTERAPEUTA",
    clinica=clinica2,
    cpf="890.123.456-77",
    phone="(21) 98765-4321",
    crefito="CREFITO-2/789012",
    especialidade="Fisioterapia Desportiva"
)
print(f"  ✓ Fisioterapeuta: {fisio1_clinica2.get_full_name()} - {fisio1_clinica2.crefito}")

# Pacientes da ReabilitaMax
paciente4 = Patient.objects.create(
    clinica=clinica2,
    fisioterapeuta=fisio1_clinica2,
    full_name="Lucas Fernandes",
    cpf="901.234.567-88",
    birth_date=date(1995, 2, 14),
    gender="M",
    phone="(21) 97654-3210",
    email="lucas.fernandes@email.com",
    address="Rua Barata Ribeiro",
    city="Rio de Janeiro",
    state="RJ",
    zip_code="22040-001",
    chief_complaint="Lesão no ligamento cruzado",
    allergies="Nenhuma",
    medications="Nenhum"
)
print(f"  ✓ Paciente: {paciente4.full_name} (Fisio: {fisio1_clinica2.first_name})")

paciente5 = Patient.objects.create(
    clinica=clinica2,
    fisioterapeuta=fisio1_clinica2,
    full_name="Beatriz Souza",
    cpf="012.345.678-99",
    birth_date=date(1988, 9, 30),
    gender="F",
    phone="(21) 96543-2109",
    email="beatriz.souza@email.com",
    address="Av. Nossa Senhora de Copacabana",
    city="Rio de Janeiro",
    state="RJ",
    zip_code="22050-002",
    chief_complaint="Hérnia de disco lombar",
    allergies="Penicilina",
    medications="Relaxante muscular"
)
print(f"  ✓ Paciente: {paciente5.full_name} (Fisio: {fisio1_clinica2.first_name})")

print("\n" + "="*60)
print("✅ ESTRUTURA MULTI-TENANT CRIADA COM SUCESSO!")
print("="*60)
print("\n📊 RESUMO:")
print(f"  • 2 Clínicas criadas")
print(f"  • 2 Gestores (1 por clínica)")
print(f"  • 3 Fisioterapeutas (2 na FisioVida, 1 na ReabilitaMax)")
print(f"  • 5 Pacientes (3 na FisioVida, 2 na ReabilitaMax)")
print(f"\n🔐 Todos os usuários têm senha: 123456")
print("\n👥 USUÁRIOS PARA LOGIN:")
print("\n  CLÍNICA 1 - FisioVida:")
print("    • gestor.fisiovida (Gestor)")
print("    • dra.ana.fisiovida (Fisioterapeuta)")
print("    • dr.carlos.fisiovida (Fisioterapeuta)")
print("\n  CLÍNICA 2 - ReabilitaMax:")
print("    • gestor.reabilitamax (Gestor)")
print("    • dra.julia.reabilitamax (Fisioterapeuta)")
print("\n📝 PACIENTES (Registros apenas, NÃO fazem login):")
print("    • João Pedro Santos (FisioVida - Dra. Ana)")
print("    • Maria Clara Costa (FisioVida - Dra. Ana)")
print("    • Pedro Henrique Lima (FisioVida - Dr. Carlos)")
print("    • Lucas Fernandes (ReabilitaMax - Dra. Julia)")
print("    • Beatriz Souza (ReabilitaMax - Dra. Julia)")
print("\n" + "="*60)
