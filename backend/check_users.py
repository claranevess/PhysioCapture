#!/usr/bin/env python
"""
Script para verificar usuários e clínicas cadastrados no banco de dados
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User, Clinica

print("\n" + "="*70)
print("🔍 VERIFICANDO DADOS NO BANCO DE DADOS - PhysioCapture")
print("="*70)

# Verificar clínicas
clinicas = Clinica.objects.all()
print(f"\n📊 RESUMO:")
print(f"   Clínicas cadastradas: {clinicas.count()}")
print(f"   Usuários cadastrados: {User.objects.count()}")
print(f"   Superusuários (Django Admin): {User.objects.filter(is_superuser=True).count()}")

# Listar clínicas
if clinicas.exists():
    print("\n" + "="*70)
    print("🏥 CLÍNICAS CADASTRADAS:")
    print("="*70)
    for clinica in clinicas:
        print(f"\n   Nome: {clinica.nome}")
        print(f"   CNPJ: {clinica.cnpj}")
        print(f"   Email: {clinica.email}")
        print(f"   Telefone: {clinica.telefone}")
        print(f"   Status: {'✅ Ativa' if clinica.ativa else '❌ Inativa'}")
        
        # Contar usuários da clínica
        usuarios_clinica = User.objects.filter(clinica=clinica)
        print(f"   Usuários: {usuarios_clinica.count()}")
        print("-" * 70)
else:
    print("\n❌ Nenhuma clínica cadastrada no banco de dados")

# Listar usuários
usuarios = User.objects.all()
if usuarios.exists():
    print("\n" + "="*70)
    print("👥 USUÁRIOS CADASTRADOS:")
    print("="*70)
    for user in usuarios:
        print(f"\n   📧 Email: {user.email}")
        print(f"   👤 Nome: {user.get_full_name() or '(Sem nome)'}")
        print(f"   🏥 Clínica: {user.clinica.nome if user.clinica else '❌ Sem clínica'}")
        print(f"   🎭 Tipo: {user.tipo_usuario if hasattr(user, 'tipo_usuario') else 'N/A'}")
        print(f"   🔐 Superusuário: {'✅ Sim' if user.is_superuser else '❌ Não'}")
        print(f"   ✅ Ativo: {'✅ Sim' if user.is_active else '❌ Não'}")
        print("-" * 70)
else:
    print("\n❌ Nenhum usuário cadastrado no banco de dados")

# Verificar superusuários
superusers = User.objects.filter(is_superuser=True)
if superusers.exists():
    print("\n" + "="*70)
    print("🔐 ACESSO AO DJANGO ADMIN:")
    print("="*70)
    print("\n   Para acessar o Django Admin, use qualquer um destes superusuários:")
    for user in superusers:
        print(f"\n   ✅ Email: {user.email}")
        print(f"      Nome: {user.get_full_name()}")
        print(f"      (Senha: você precisa saber ou resetar)")
    print("\n   URL: http://127.0.0.1:8000/admin/")
else:
    print("\n" + "="*70)
    print("⚠️ NENHUM SUPERUSUÁRIO ENCONTRADO!")
    print("="*70)
    print("\n   Você precisa criar um superusuário para acessar o Django Admin.")
    print("\n   Execute o comando:")
    print("   python manage.py createsuperuser")

print("\n" + "="*70)
print("✅ VERIFICAÇÃO CONCLUÍDA")
print("="*70)

# Instruções adicionais
if not usuarios.exists():
    print("\n💡 DICA: Para criar usuários de teste, execute:")
    print("   python create_test_users.py")
elif not superusers.exists():
    print("\n💡 DICA: Para criar um superusuário, execute:")
    print("   python manage.py createsuperuser")

print()
