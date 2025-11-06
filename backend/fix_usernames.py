#!/usr/bin/env python
"""
Script para verificar e corrigir usernames dos usuários
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User

print("\n" + "="*70)
print("🔍 VERIFICANDO CAMPO USERNAME DOS USUÁRIOS")
print("="*70)

usuarios = User.objects.all()

print(f"\n📊 Total de usuários: {usuarios.count()}\n")

for user in usuarios:
    print(f"Email: {user.email}")
    print(f"Username: '{user.username}'")
    print(f"Nome completo: {user.get_full_name()}")
    print("-" * 70)

print("\n" + "="*70)
print("🔧 CORRIGINDO USERNAMES (usando email como username)")
print("="*70)

for user in usuarios:
    if user.username != user.email:
        old_username = user.username
        user.username = user.email
        user.save()
        print(f"✅ {user.email}")
        print(f"   Username anterior: {old_username}")
        print(f"   Novo username: {user.username}")
    else:
        print(f"✅ {user.email} - Username já está correto")

print("\n" + "="*70)
print("✅ CORREÇÃO CONCLUÍDA!")
print("="*70)
print("\n💡 Agora faça login usando:")
print("   Username: carlos@fisiovida.com.br")
print("   Senha: senha123")
print()
