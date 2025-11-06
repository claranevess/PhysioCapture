"""
Script para criar usuários de teste no PhysioCapture
Execute: python manage.py shell < create_test_users.py
"""

from authentication.models import User

# Criar usuários de teste para cada tipo
usuarios = [
    {
        'username': 'admin',
        'password': '123456',
        'email': 'admin@physiocapture.com',
        'first_name': 'Admin',
        'last_name': 'Sistema',
        'user_type': 'ADMIN',
        'phone': '(81) 99999-0001',
        'cpf': '111.111.111-11',
    },
    {
        'username': 'dra.ana',
        'password': '123456',
        'email': 'ana@physiocapture.com',
        'first_name': 'Ana',
        'last_name': 'Silva',
        'user_type': 'FISIOTERAPEUTA',
        'phone': '(81) 99999-0002',
        'cpf': '222.222.222-22',
    },
    {
        'username': 'carlos.fisio',
        'password': '123456',
        'email': 'carlos@physiocapture.com',
        'first_name': 'Carlos',
        'last_name': 'Santos',
        'user_type': 'FISIOTERAPEUTA',
        'phone': '(81) 99999-0003',
        'cpf': '333.333.333-33',
    },
    {
        'username': 'maria.recepcao',
        'password': '123456',
        'email': 'maria@physiocapture.com',
        'first_name': 'Maria',
        'last_name': 'Oliveira',
        'user_type': 'RECEPCIONISTA',
        'phone': '(81) 99999-0004',
        'cpf': '444.444.444-44',
    },
    {
        'username': 'joao.paciente',
        'password': '123456',
        'email': 'joao@email.com',
        'first_name': 'João',
        'last_name': 'Ferreira',
        'user_type': 'PACIENTE',
        'phone': '(81) 99999-0005',
        'cpf': '555.555.555-55',
    },
    {
        'username': 'julia.paciente',
        'password': '123456',
        'email': 'julia@email.com',
        'first_name': 'Julia',
        'last_name': 'Costa',
        'user_type': 'PACIENTE',
        'phone': '(81) 99999-0006',
        'cpf': '666.666.666-66',
    },
]

print("Criando usuários de teste...\n")

for user_data in usuarios:
    username = user_data['username']
    
    # Verificar se já existe
    if User.objects.filter(username=username).exists():
        print(f"❌ Usuário '{username}' já existe")
        continue
    
    # Criar usuário
    password = user_data.pop('password')
    user = User(**user_data)
    user.set_password(password)
    user.save()
    
    print(f"✅ Criado: {username} ({user.get_user_type_display()})")

print("\n🎉 Processo concluído!")
print("\n📋 Credenciais de acesso:")
print("-" * 50)
print("ADMIN:")
print("  Usuário: admin")
print("  Senha: 123456")
print("\nFISIOTERAPEUTA:")
print("  Usuário: dra.ana ou carlos.fisio")
print("  Senha: 123456")
print("\nRECEPCIONISTA:")
print("  Usuário: maria.recepcao")
print("  Senha: 123456")
print("\nPACIENTE:")
print("  Usuário: joao.paciente ou julia.paciente")
print("  Senha: 123456")
print("-" * 50)
