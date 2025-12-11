# 📚 PhysioCapture - Documentação Completa do MVP

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos do Sistema](#requisitos-do-sistema)
3. [Instalação e Configuração](#instalação-e-configuração)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Usuários e Permissões](#usuários-e-permissões)
6. [Funcionalidades do MVP](#funcionalidades-do-mvp)
7. [APIs Disponíveis](#apis-disponíveis)
8. [Guia de Uso](#guia-de-uso)

---

## 🎯 Visão Geral

O **PhysioCapture** é um sistema completo de gestão para clínicas de fisioterapia, desenvolvido com arquitetura **multi-tenant** que permite gerenciar múltiplas filiais de uma rede de clínicas.

### Tecnologias Utilizadas

| Componente | Tecnologia |
|------------|------------|
| **Backend** | Django 4.x + Django REST Framework |
| **Frontend** | Next.js 14 + TypeScript |
| **Banco de Dados** | SQLite (desenvolvimento) |
| **Estilização** | Tailwind CSS + Argon Dashboard Theme |
| **Autenticação** | Header-based (X-User-Id) |

---

## 💻 Requisitos do Sistema

### Software Necessário

- **Python** 3.10 ou superior
- **Node.js** 18.x ou superior
- **npm** ou **yarn**
- **Git** (opcional)

### Verificar Instalações

```powershell
# Verificar Python
python --version

# Verificar Node.js
node --version

# Verificar npm
npm --version
```

---

## 🚀 Instalação e Configuração

### 1. Clonar/Baixar o Projeto

```powershell
# Se usando Git
git clone <url-do-repositorio>
cd PhysioCapture
```

### 2. Configurar o Backend (Django)

#### 2.1. Criar Ambiente Virtual Python

```powershell
# Navegar para a pasta do backend
cd backend

# Criar ambiente virtual
python -m venv .venv

# Ativar ambiente virtual (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Ou no CMD
.\.venv\Scripts\activate.bat
```

#### 2.2. Instalar Dependências do Backend

```powershell
# Com o ambiente virtual ativado
pip install -r requirements.txt
```

#### 2.3. Configurar Banco de Dados

```powershell
# Aplicar migrações
python manage.py migrate

# Popular banco com dados de teste
python manage.py shell -c "exec(open('seed_complete.py').read())"
```

#### 2.4. Iniciar Servidor Backend

```powershell
# Iniciar servidor Django (porta 8000)
python manage.py runserver
```

O backend estará disponível em: `http://localhost:8000`

### 3. Configurar o Frontend (Next.js)

#### 3.1. Instalar Dependências do Frontend

```powershell
# Em outro terminal, navegar para a pasta do frontend
cd frontend

# Instalar dependências
npm install
```

#### 3.2. Iniciar Servidor Frontend

```powershell
# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

### 4. Acessar o Sistema

Abra o navegador e acesse: **http://localhost:3000**

---

## 📁 Estrutura do Projeto

```
PhysioCapture/
├── backend/                    # Servidor Django
│   ├── authentication/         # App de autenticação e usuários
│   │   ├── models.py          # Modelos: User, Clinica, Filial
│   │   ├── views.py           # Views de autenticação
│   │   └── serializers.py     # Serializers da API
│   ├── prontuario/            # App de prontuários e pacientes
│   │   ├── models.py          # Modelos: Patient, MedicalRecord, Session
│   │   ├── views.py           # Views do prontuário
│   │   └── serializers.py     # Serializers da API
│   ├── documentos/            # App de documentos
│   │   ├── models.py          # Modelos: Document, Category
│   │   └── views.py           # Views de documentos
│   ├── estoque/               # App de estoque
│   │   ├── models.py          # Modelos: Product, StockMovement
│   │   └── views.py           # Views de estoque
│   ├── backend/               # Configurações do Django
│   │   ├── settings.py        # Configurações gerais
│   │   └── urls.py            # URLs principais
│   ├── manage.py              # CLI do Django
│   ├── requirements.txt       # Dependências Python
│   └── db.sqlite3             # Banco de dados SQLite
│
├── frontend/                   # Cliente Next.js
│   ├── app/                   # Páginas (App Router)
│   │   ├── page.tsx           # Página inicial
│   │   ├── login/             # Página de login
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── patients/          # Gestão de pacientes
│   │   ├── documents/         # Gestão de documentos
│   │   ├── agenda/            # Agendamento de sessões
│   │   ├── estoque/           # Gestão de estoque
│   │   └── profile/           # Perfil do usuário
│   ├── components/            # Componentes React
│   │   ├── Argon/             # Componentes do tema Argon
│   │   └── UI/                # Componentes de UI customizados
│   ├── lib/                   # Utilitários
│   │   ├── api.ts             # Cliente Axios e rotas da API
│   │   └── types.ts           # Tipos TypeScript
│   └── package.json           # Dependências Node.js
│
└── DOCUMENTACAO.md            # Este arquivo
```

---

## 👥 Usuários e Permissões

### Credenciais de Acesso

> **Senha padrão para todos os usuários:** `demo123`

### Hierarquia de Usuários

| Tipo | Login | Permissões |
|------|-------|------------|
| **👑 Gestor Geral** | `gestor_geral` | Acesso total a todas as filiais da rede |
| **🏢 Gestor de Filial (Recife)** | `gestor_recife` | Gerencia apenas a filial de Recife |
| **🏢 Gestor de Filial (Olinda)** | `gestor_olinda` | Gerencia apenas a filial de Olinda |
| **👨‍⚕️ Fisioterapeuta (Recife)** | `fisio_recife_1`, `fisio_recife_2`, `fisio_recife_3` | Acesso aos seus pacientes na filial de Recife |
| **👨‍⚕️ Fisioterapeuta (Olinda)** | `fisio_olinda_1`, `fisio_olinda_2`, `fisio_olinda_3` | Acesso aos seus pacientes na filial de Olinda |
| **📋 Atendente** | `atendente_recife`, `atendente_olinda` | Cadastro de pacientes e gestão da agenda da filial |

### Matriz de Permissões por Funcionalidade

| Funcionalidade | Gestor Geral | Gestor Filial | Fisioterapeuta | Atendente |
|----------------|:------------:|:-------------:|:--------------:|:---------:|
| Ver todas as filiais | ✅ | ❌ | ❌ | ❌ |
| Ver pacientes de toda rede | ✅ | ❌ | ❌ | ❌ |
| Ver pacientes da filial | ✅ | ✅ | ❌ | ✅ |
| Ver próprios pacientes | ✅ | ✅ | ✅ | ✅ |
| Cadastrar pacientes | ❌ | ❌ | ❌ | ✅ |
| Editar pacientes | ✅ | ✅ | ✅ | ✅ |
| Criar prontuários/evoluções | ❌ | ❌ | ✅ | ❌ |
| Gerenciar agenda | ✅ | ✅ | ✅ | ✅ |
| Ver estatísticas da rede | ✅ | ❌ | ❌ | ❌ |
| Ver estatísticas da filial | ✅ | ✅ | ❌ | ✅ |
| Gerenciar documentos | ✅ | ✅ | ✅ | ✅ |
| Gerenciar estoque | ✅ | ✅ | ❌ | ❌ |
| Solicitar transferência | ❌ | ❌ | ✅ | ✅ |
| Aprovar transferências | ✅ | ✅ | ❌ | ❌ |

---

## 🎨 Funcionalidades do MVP

### 1. 🔐 Autenticação e Login

**Caminho:** `/login`

- Login com username e senha
- Persistência de sessão via localStorage
- Identificação automática do tipo de usuário
- Redirecionamento para dashboard apropriado

**Como testar:**
1. Acesse `http://localhost:3000/login`
2. Digite o username (ex: `gestor_geral`)
3. Digite a senha: `demo123`
4. Clique em "Entrar"

---

### 2. 📊 Dashboard

**Caminho:** `/dashboard`

O dashboard é **personalizado** de acordo com o tipo de usuário:

#### Dashboard do Gestor Geral
- Estatísticas de toda a rede
- Total de pacientes, sessões e documentos
- Visão consolidada de todas as filiais

#### Dashboard do Gestor de Filial
- Estatísticas da filial
- Listagem de fisioterapeutas da filial
- Indicadores de desempenho

#### Dashboard do Fisioterapeuta
- Agenda do dia
- Próximas sessões
- Pacientes recentes
- Atalhos rápidos

#### Dashboard do Atendente
- Agenda da filial
- Pacientes da filial
- Solicitações de transferência pendentes
- Cadastro rápido de pacientes

---

### 3. 👤 Gestão de Pacientes

**Caminho:** `/patients`

#### Funcionalidades:
- **Listagem de pacientes** com busca por nome, CPF, telefone ou email
- **Cadastro de paciente** (apenas atendentes)
  - Foto do paciente (câmera ou upload)
  - Dados pessoais completos
  - Atribuição de fisioterapeuta responsável
- **Edição de paciente** (`/patients/[id]/edit`)
  - Todos os dados podem ser editados
  - Alteração de fisioterapeuta responsável
  - Ativar/desativar paciente
- **Prontuário do paciente** (`/patients/[id]/records`)
  - Resumo do paciente
  - Histórico de sessões
  - Documentos anexados
  - Evoluções/prontuários médicos

#### Filtros por tipo de usuário:
- **Gestor Geral:** Todos os pacientes da rede
- **Gestor de Filial:** Pacientes da sua filial
- **Fisioterapeuta:** Apenas seus pacientes
- **Atendente:** Pacientes da filial

---

### 4. 📅 Agenda e Sessões

**Caminho:** `/agenda`

#### Funcionalidades:
- Visualização de sessões agendadas
- Filtro por data
- Status das sessões:
  - 🟡 **Agendada** - Sessão marcada
  - 🔵 **Confirmada** - Paciente confirmou presença
  - 🟢 **Realizada** - Sessão concluída
  - 🔴 **Cancelada** - Sessão cancelada
  - ⚫ **Falta** - Paciente não compareceu
- Criação de novas sessões
- Atualização de status

---

### 5. 📄 Gestão de Documentos

**Caminho:** `/documents`

#### Funcionalidades:
- **Listagem de documentos** com filtros por categoria
- **Digitalização de documentos** (`/documents/digitize`)
  - Captura via câmera (mobile-first)
  - Upload de arquivos
  - OCR automático (extração de texto)
- **Visualização de documentos**
  - Modal de visualização inline
  - Suporte a PDF e imagens
- **Download de documentos**
- **Exclusão de documentos**
- **Categorização** por tipo (exames, laudos, receitas, etc.)

#### Categorias padrão:
- Exames Laboratoriais
- Exames de Imagem
- Laudos Médicos
- Receitas
- Atestados
- Outros

---

### 6. 🔄 Transferência de Pacientes

**Caminho:** Disponível no dashboard do atendente e prontuário

#### Funcionalidades:
- **Solicitar transferência** de paciente para outro fisioterapeuta
- **Aprovar/Rejeitar** solicitações (gestores)
- **Histórico de transferências** por paciente
- Motivo da transferência registrado

---

### 7. 👤 Perfil do Usuário

**Caminho:** `/profile`

#### Funcionalidades:
- Visualização dos dados do perfil
- Edição de informações pessoais
- Alteração de senha
- Foto de perfil

---

### 8. 🏢 Gestão de Filiais

**Caminho:** `/filiais` (Gestor Geral)

#### Funcionalidades:
- Listagem de todas as filiais da rede
- Informações de cada filial
- Estatísticas por filial

---

### 9. 👨‍⚕️ Gestão de Equipe

**Caminho:** `/equipe` ou `/fisioterapeutas`

#### Funcionalidades:
- Listagem de fisioterapeutas
- Cadastro de novos fisioterapeutas (gestores)
- Visualização de pacientes por fisioterapeuta

---

## 🔌 APIs Disponíveis

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login/` | Autenticação |
| GET | `/api/auth/me/` | Dados do usuário logado |
| GET | `/api/auth/fisioterapeutas/` | Listar fisioterapeutas |
| GET | `/api/auth/filiais/` | Listar filiais |
| GET | `/api/prontuario/patients/` | Listar pacientes |
| POST | `/api/prontuario/patients/` | Criar paciente |
| GET | `/api/prontuario/patients/{id}/` | Detalhes do paciente |
| PATCH | `/api/prontuario/patients/{id}/` | Atualizar paciente |
| DELETE | `/api/prontuario/patients/{id}/` | Excluir paciente |
| GET | `/api/prontuario/medical-records/` | Listar prontuários |
| POST | `/api/prontuario/medical-records/` | Criar prontuário |
| GET | `/api/prontuario/sessions/` | Listar sessões |
| POST | `/api/prontuario/sessions/` | Criar sessão |
| GET | `/api/prontuario/dashboard-stats/` | Estatísticas do dashboard |
| GET | `/api/documentos/documents/` | Listar documentos |
| POST | `/api/documentos/documents/` | Upload de documento |
| GET | `/api/documentos/documents/{id}/download/` | Download de documento |
| DELETE | `/api/documentos/documents/{id}/` | Excluir documento |
| GET | `/api/documentos/categories/` | Listar categorias |
| GET | `/api/estoque/products/` | Listar produtos |
| POST | `/api/estoque/movements/` | Registrar movimentação |

---

## 📖 Guia de Uso

### Fluxo Completo: Cadastrar e Atender um Paciente

#### 1. Login como Atendente
```
Username: atendente_recife
Senha: demo123
```

#### 2. Cadastrar Novo Paciente
1. No dashboard, clique em "Novo Paciente"
2. Preencha os dados pessoais
3. Tire uma foto ou faça upload
4. Selecione o fisioterapeuta responsável
5. Clique em "Cadastrar Paciente"

#### 3. Agendar Sessão
1. Vá para "Agenda"
2. Clique em "Nova Sessão"
3. Selecione o paciente
4. Escolha data e horário
5. Confirme o agendamento

#### 4. Login como Fisioterapeuta
```
Username: fisio_recife_1
Senha: demo123
```

#### 5. Atender Paciente
1. No dashboard, veja as sessões do dia
2. Clique no paciente para abrir o prontuário
3. Registre a evolução da sessão
4. Anexe documentos se necessário

#### 6. Registrar Evolução
1. No prontuário do paciente, aba "Evolução"
2. Clique em "Nova Evolução"
3. Preencha os campos:
   - Queixa principal
   - Exame físico
   - Diagnóstico
   - Plano de tratamento
4. Salve a evolução

---

### Fluxo: Digitalizar Documento

1. Acesse `/documents/digitize`
2. Selecione o paciente
3. Escolha a categoria do documento
4. Capture com a câmera ou faça upload
5. O sistema extrairá o texto automaticamente (OCR)
6. Confirme e salve o documento

---

### Fluxo: Transferir Paciente

#### Como Atendente/Fisioterapeuta:
1. Acesse o prontuário do paciente
2. Clique em "Solicitar Transferência"
3. Selecione o novo fisioterapeuta
4. Informe o motivo
5. Envie a solicitação

#### Como Gestor:
1. No dashboard, veja "Transferências Pendentes"
2. Revise a solicitação
3. Aprove ou rejeite

---

## 🐛 Solução de Problemas

### Backend não inicia

```powershell
# Verificar se o ambiente virtual está ativado
.\.venv\Scripts\Activate.ps1

# Reinstalar dependências
pip install -r requirements.txt

# Verificar erros
python manage.py check
```

### Frontend não inicia

```powershell
# Limpar cache e reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

### Erro de CORS

Verifique se o backend está rodando na porta 8000 e o frontend na porta 3000.

### Banco de dados corrompido

```powershell
# Recriar banco de dados
Remove-Item db.sqlite3
python manage.py migrate
python manage.py shell -c "exec(open('seed_complete.py').read())"
```

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Os logs do terminal do backend
2. O console do navegador (F12)
3. Os logs do terminal do frontend

---

**PhysioCapture MVP** - Sistema de Gestão para Clínicas de Fisioterapia
