#!/usr/bin/env python
"""
Script para resetar senhas de todos os usuários para uma senha padrão de teste
⚠️ USE APENAS EM AMBIENTE DE DESENVOLVIMENTO!
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User, Clinica

print("\n" + "="*70)
print("🔐 RESETANDO SENHAS - PhysioCapture")
print("="*70)

# Senha padrão para testes
SENHA_PADRAO = "senha123"

usuarios = User.objects.all()

if not usuarios.exists():
    print("\n❌ Nenhum usuário encontrado no banco de dados!")
    print("\n💡 Execute primeiro: python create_test_users.py")
    sys.exit(1)

print(f"\n📊 Total de usuários: {usuarios.count()}")
print(f"🔑 Senha padrão que será definida: {SENHA_PADRAO}")
print("\n⚠️ ATENÇÃO: Todas as senhas serão resetadas!")

resposta = input("\n❓ Deseja continuar? (s/n): ")

if resposta.lower() != 's':
    print("\n❌ Operação cancelada.")
    sys.exit(0)

print("\n" + "="*70)
print("🔄 Resetando senhas...")
print("="*70)

for user in usuarios:
    user.set_password(SENHA_PADRAO)
    user.save()
    print(f"\n✅ {user.email}")
    print(f"   Nome: {user.get_full_name()}")
    print(f"   Clínica: {user.clinica.nome if user.clinica else 'Sem clínica'}")
    print(f"   Nova senha: {SENHA_PADRAO}")

print("\n" + "="*70)
print("✅ TODAS AS SENHAS FORAM RESETADAS COM SUCESSO!")
print("="*70)

print("\n📋 CREDENCIAIS PARA LOGIN:")
print("-" * 70)

# Agrupar por clínica
clinicas = Clinica.objects.all()
for clinica in clinicas:
    usuarios_clinica = User.objects.filter(clinica=clinica)
    if usuarios_clinica.exists():
        print(f"\n🏥 {clinica.nome}")
        for user in usuarios_clinica:
            print(f"   📧 {user.email} | 🔑 {SENHA_PADRAO}")

# Usuários sem clínica
usuarios_sem_clinica = User.objects.filter(clinica__isnull=True)
if usuarios_sem_clinica.exists():
    print(f"\n👤 Usuários sem clínica:")
    for user in usuarios_sem_clinica:
        print(f"   📧 {user.email} | 🔑 {SENHA_PADRAO}")

print("\n" + "="*70)
print("🚀 AGORA VOCÊ PODE FAZER LOGIN!")
print("="*70)
print("\n💡 Acesse: http://localhost:3000/login")
print(f"   Use qualquer email acima com a senha: {SENHA_PADRAO}")
print()
