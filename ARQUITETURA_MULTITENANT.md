# 🏗️ Arquitetura Multi-Tenant - PhysioCapture

## 📋 Visão Geral

O PhysioCapture utiliza uma arquitetura **Multi-Tenant** onde cada **Clínica** é um tenant independente com dados completamente isolados.

### Modelo de "Caixas"

```
┌─────────────────────────────────────────────┐
│           CLÍNICA (Tenant)                  │  ← Caixa Grande
│  ┌───────────────────────────────────────┐  │
│  │       GESTOR DA CLÍNICA               │  │  ← Caixa Média
│  │  (Admin do Tenant)                    │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │       FISIOTERAPEUTAS                 │  │  ← Caixas Menores
│  │  ┌─────────────────────────────────┐  │  │
│  │  │    PACIENTES (Registros)        │  │  │  ← Caixas Internas
│  │  │  (não fazem login)              │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 🎯 Conceito B2B (Business-to-Business)

### Quem contrata o sistema?
**Clínicas de Fisioterapia** contratam o PhysioCapture como um SaaS (Software as a Service).

### Quem NÃO contrata?
❌ Pacientes **não** contratam o serviço  
❌ Pacientes **não** são clientes do PhysioCapture  
❌ Pacientes **não** têm contas no sistema  

---

## 👥 Papéis de Usuário (Quem pode fazer LOGIN)

### 1. Gestor da Clínica (Admin do Tenant)

**Função:** Gerencia a clínica contratante e a equipe de fisioterapeutas

**Permissões:**
- ✅ Criar, editar e desativar contas de Fisioterapeutas
- ✅ Visualizar dados administrativos da clínica
- ✅ Visualizar faturamento e relatórios
- ✅ Acessar todos os pacientes da clínica (opcional)
- ❌ **NÃO** pode ver dados de outras clínicas

**Características:**
- Pertence a **uma única** clínica
- Pode haver múltiplos gestores por clínica
- Cadastrado durante a contratação do serviço

---

### 2. Fisioterapeuta (Usuário Profissional)

**Função:** Usuário principal do dia-a-dia que gerencia tratamento de pacientes

**Permissões:**
- ✅ Criar, visualizar, editar registros de pacientes
- ✅ Gerenciar agendamentos e sessões
- ✅ Atualizar prontuários e evoluções
- ✅ Digitalizar documentos
- ❌ **NÃO** pode ver pacientes de outros fisioterapeutas (por padrão)
- ❌ **NÃO** pode ver dados de outras clínicas
- ❌ **NÃO** pode criar/editar outros usuários

**Características:**
- Pertence a **uma única** clínica
- Cadastrado pelo Gestor da clínica
- Precisa de CREFITO válido
- Tem especialidade registrada

---

## 📊 Modelo de Dados (Quem NÃO pode fazer LOGIN)

### 3. Paciente (Registro de Dados)

**Natureza:** O Paciente **NÃO é um usuário**. É apenas um **registro no banco de dados**.

**Características:**
- ❌ **NÃO** tem conta no sistema
- ❌ **NÃO** faz login
- ❌ **NÃO** tem senha
- ❌ **NÃO** tem username/email de acesso
- ✅ É uma "ficha" ou "prontuário" digital
- ✅ Criado pelo Fisioterapeuta
- ✅ Pertence a uma Clínica
- ✅ Pertence a um Fisioterapeuta responsável

**Propriedade:**
```
Paciente → pertence ao Fisioterapeuta → pertence à Clínica
```

---

## 🔐 Isolamento de Dados (Multi-Tenancy)

### Regra de Ouro:
**Cada clínica vê APENAS seus próprios dados**

### Implementação:

#### 1. Nível de Banco de Dados
```python
# Todos os queries filtram automaticamente por clínica
pacientes = Patient.objects.filter(clinica=request.user.clinica)
```

#### 2. Nível de API
```python
# Middleware garante que user.clinica seja sempre aplicado
def get_queryset(self):
    return super().get_queryset().filter(clinica=self.request.user.clinica)
```

#### 3. Nível de Permissão
```python
# Gestor pode criar fisioterapeutas apenas da sua clínica
def can_create_fisioterapeuta(user, clinica_id):
    return user.is_gestor and user.clinica_id == clinica_id
```

---

## 🗄️ Estrutura de Dados

### Modelo Clinica
```python
class Clinica(models.Model):
    nome = CharField(max_length=255)
    cnpj = CharField(max_length=18, unique=True)
    razao_social = CharField(max_length=255)
    email = EmailField()
    telefone = CharField(max_length=20)
    # Endereço completo
    ativa = BooleanField(default=True)
    data_contratacao = DateField(auto_now_add=True)
    data_vencimento = DateField(null=True, blank=True)
    max_fisioterapeutas = IntegerField(default=5)
```

### Modelo User
```python
class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('GESTOR', 'Gestor da Clínica'),
        ('FISIOTERAPEUTA', 'Fisioterapeuta'),
    ]
    
    clinica = ForeignKey(Clinica, on_delete=CASCADE)  # ← TENANT
    user_type = CharField(max_length=20, choices=USER_TYPE_CHOICES)
    crefito = CharField(max_length=20)  # Apenas fisioterapeutas
    especialidade = CharField(max_length=100)
    cpf = CharField(max_length=14, unique=True)
```

### Modelo Patient
```python
class Patient(models.Model):
    clinica = ForeignKey(Clinica, on_delete=CASCADE)  # ← TENANT
    fisioterapeuta = ForeignKey(User, on_delete=PROTECT)  # ← DONO
    
    full_name = CharField(max_length=200)
    cpf = CharField(max_length=14)  # Único por clínica
    # ... outros campos
    
    class Meta:
        unique_together = [['clinica', 'cpf']]  # CPF único por clínica
```

---

## 🔄 Fluxo de Trabalho

### 1. Contratação do Serviço
```
1. Clínica contrata o PhysioCapture
2. Tenant (Clínica) é criado no sistema
3. Primeiro usuário GESTOR é criado
4. Gestor faz primeiro login
```

### 2. Configuração da Equipe
```
1. Gestor loga no sistema
2. Gestor cadastra Fisioterapeutas
3. Cada Fisioterapeuta recebe credenciais
4. Fisioterapeutas fazem login
```

### 3. Atendimento de Pacientes
```
1. Fisioterapeuta loga no sistema
2. Fisioterapeuta cria registro de Paciente
3. Fisioterapeuta gerencia prontuário
4. Fisioterapeuta registra evolução
```

---

## 🚀 Endpoints da API

### Autenticação
```
POST /api/auth/register/        # Criar usuário (apenas GESTOR pode)
POST /api/auth/login/           # Login (GESTOR ou FISIOTERAPEUTA)
POST /api/auth/logout/          # Logout
GET  /api/auth/me/              # Dados do usuário logado
```

### Gestão de Usuários (apenas GESTOR)
```
GET    /api/auth/users/         # Listar fisioterapeutas da clínica
POST   /api/auth/users/         # Criar fisioterapeuta
PUT    /api/auth/users/{id}/    # Editar fisioterapeuta
DELETE /api/auth/users/{id}/    # Desativar fisioterapeuta
```

### Pacientes
```
GET    /api/patients/           # Listar pacientes (filtrado por clínica)
POST   /api/patients/           # Criar paciente
GET    /api/patients/{id}/      # Detalhes do paciente
PUT    /api/patients/{id}/      # Atualizar paciente
DELETE /api/patients/{id}/      # Arquivar paciente
```

---

## 🛡️ Segurança e Permissões

### Níveis de Acesso

#### GESTOR
```python
✅ Ver todos os pacientes da clínica
✅ Ver todos os fisioterapeutas da clínica
✅ Criar/editar/desativar fisioterapeutas
✅ Ver relatórios administrativos
❌ Ver dados de outras clínicas
❌ Editar pacientes diretamente (opcional)
```

#### FISIOTERAPEUTA
```python
✅ Ver apenas SEUS pacientes
✅ Criar novos pacientes
✅ Editar SEUS pacientes
✅ Digitalizar documentos
❌ Ver pacientes de outros fisioterapeutas
❌ Ver dados de outras clínicas
❌ Criar outros usuários
```

### Validações Automáticas

```python
# Toda query é filtrada pela clínica do usuário logado
def get_queryset(self):
    user = self.request.user
    qs = super().get_queryset()
    
    # Filtro por clínica
    qs = qs.filter(clinica=user.clinica)
    
    # Fisioterapeuta vê apenas seus pacientes
    if user.is_fisioterapeuta:
        qs = qs.filter(fisioterapeuta=user)
    
    return qs
```

---

## 📊 Dados de Teste

### Clínica 1: FisioVida Centro de Reabilitação
```
Gestor: gestor.fisiovida / 123456
Fisioterapeutas:
  - dra.ana.fisiovida / 123456 (CREFITO-3/123456)
  - dr.carlos.fisiovida / 123456 (CREFITO-3/654321)

Pacientes (registros):
  - João Pedro Santos (Dra. Ana)
  - Maria Clara Costa (Dra. Ana)
  - Pedro Henrique Lima (Dr. Carlos)
```

### Clínica 2: ReabilitaMax Fisioterapia
```
Gestor: gestor.reabilitamax / 123456
Fisioterapeutas:
  - dra.julia.reabilitamax / 123456 (CREFITO-2/789012)

Pacientes (registros):
  - Lucas Fernandes (Dra. Julia)
  - Beatriz Souza (Dra. Julia)
```

---

## 🎨 Interface do Usuário

### Tela de Registro
- Apenas 2 opções: **GESTOR** ou **FISIOTERAPEUTA**
- Campo obrigatório: **Clínica** (select)
- CREFITO obrigatório para Fisioterapeutas

### Tela de Login
- Username + Password
- Redirecionamento único para dashboard
- Sem opção de "Paciente"

### Dashboard
- Mostra nome da clínica no header
- Dados filtrados automaticamente pela clínica
- Gestor vê estatísticas de toda a clínica
- Fisioterapeuta vê apenas seus pacientes

---

## 🔧 Próximos Passos

### Implementar
- [ ] Middleware de isolamento Multi-Tenant
- [ ] Filtros automáticos em todas as ViewSets
- [ ] Permissões customizadas por tipo de usuário
- [ ] Auditoria de acesso a pacientes
- [ ] Compartilhamento de pacientes entre fisioterapeutas
- [ ] Painel administrativo para gestores

### Melhorias Futuras
- [ ] Portal do paciente (somente leitura, sem login)
- [ ] Relatórios por fisioterapeuta
- [ ] Limite de pacientes por plano
- [ ] Sistema de cobrança por clínica
- [ ] Backup automático por tenant

---

## 📞 Contato

Desenvolvido por **Core Hive**

Sistema de Gestão Fisioterapêutica Multi-Tenant
