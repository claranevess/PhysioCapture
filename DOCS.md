# PhysioCapture - Documentação Completa

## Visão Geral

PhysioCapture é uma plataforma inteligente de gestão clínica desenvolvida especialmente para fisioterapia e reabilitação. O sistema centraliza dados clínicos, simplifica processos e promove uma rede colaborativa de cuidado.

### Funcionalidades Principais

- **Prontuário Digital**: Gerenciamento de pacientes, evoluções e registros médicos
- **Agenda de Sessões**: Agendamento e controle de sessões de fisioterapia
- **Digitalização de Documentos**: Upload e organização de documentos clínicos com OCR
- **Assistente de IA**: Chatbot para ajudar usuários com dúvidas sobre o sistema
- **Dashboard Personalizado**: Métricas e estatísticas por papel de usuário

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Requisito | Versão | Download |
|-----------|--------|----------|
| Python | 3.12 | [python.org](https://www.python.org/downloads/release/python-3120/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm ou yarn | - | Incluído com Node.js |
| Git | - | [git-scm.com](https://git-scm.com/) |

**Verificar instalação:**
```bash
python --version   # Python 3.12.x
node --version     # v18.x ou superior
npm --version      # 9.x ou superior
git --version
```

---

## Instalação Passo a Passo

### 1. Clonar o Repositório

```bash
git clone https://github.com/claranevess/PhysioCapture.git
cd PhysioCapture
```

### 2. Configurar o Backend (Django)

```bash
# Navegar para o diretório do backend
cd backend

# Criar ambiente virtual
python -m venv .venv

# Ativar ambiente virtual
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar migrações
python manage.py migrate
```

### 3. Configurar o Frontend (Next.js)

```bash
# Em um novo terminal, navegar para o frontend
cd frontend

# Instalar dependências
npm install
```

### 4. Configurar Variáveis de Ambiente

**Backend** - Criar arquivo `backend/.env`:
```env
HUGGINGFACE_API_TOKEN=sua_chave_aqui
```

**Frontend** - Criar arquivo `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## Como Executar

### Iniciar Backend

```bash
cd backend
.venv\Scripts\activate  # Windows
python manage.py runserver
```
**URL:** http://127.0.0.1:8000

### Iniciar Frontend

```bash
cd frontend
npm run dev
```
**URL:** http://localhost:3000

### URLs do Sistema

| Serviço | URL |
|---------|-----|
| Aplicação Web | http://localhost:3000 |
| API Backend | http://127.0.0.1:8000/api/ |
| Django Admin | http://127.0.0.1:8000/admin/ |

---

## Contas de Teste

O banco de dados já inclui contas pré-configuradas. **Senha padrão:** `senha123`

### Clínica 1: FisioVida Centro de Reabilitação

| Papel | Usuário | Nome | Email |
|-------|---------|------|-------|
| Gestor | `gestor.clinica1` | Roberto Silva | gestor@fisiovida.com.br |
| Fisioterapeuta | `fisio.clinica1` | Ana Costa | ana.costa@fisiosaude.com.br |

**Dados da clínica:** 3 fisioterapeutas, 5 pacientes

### Clínica 2: ReabilitaMax Fisioterapia

| Papel | Usuário | Nome | Email |
|-------|---------|------|-------|
| Gestor | `gestor.clinica2` | Mariana Santos | gestor@vidaativa.com.br |
| Fisioterapeuta | `fisio.clinica2` | Pedro Alves | pedro.alves@vidaativa.com.br |

**Dados da clínica:** 2 fisioterapeutas, 4 pacientes

---

## Papéis de Usuário

### 1. Gestor
- ✅ Acesso total ao sistema
- ✅ Gerencia usuários (fisioterapeutas)
- ✅ Visualiza todos os pacientes da clínica
- ✅ Acessa relatórios e métricas globais
- ✅ Gerencia configurações da clínica

### 2. Fisioterapeuta
- ✅ Acessa apenas seus próprios pacientes
- ✅ Cria e edita prontuários e evoluções
- ✅ Registra sessões de fisioterapia
- ✅ Visualiza sua própria agenda
- ✅ Faz upload de documentos clínicos
- ❌ Não vê pacientes de outros fisioterapeutas

### 3. Atendente (Recepção)
- ✅ Acesso a dados básicos de pacientes
- ✅ Gerencia a agenda de sessões
- ✅ Cadastra novos pacientes
- ✅ Confirma presença e registra faltas
- ❌ Não acessa prontuários clínicos

---

## Fluxo do Sistema

### 1. Cadastro de Paciente

1. Acesse **Pacientes** > **Novo Paciente**
2. Preencha dados: nome, CPF, telefone, data de nascimento
3. Se fisioterapeuta: paciente vinculado automaticamente
4. Se gestor: selecione o fisioterapeuta responsável

### 2. Registro de Evoluções

1. Acesse o prontuário do paciente
2. Vá para a aba **Evolução**
3. Clique em **Nova Evolução**
4. Preencha os campos:
   - Título da evolução
   - Tipo de registro
   - Queixa / Relato do paciente
   - Exame físico
   - Diagnóstico
   - Condutas / Procedimentos
   - Observações
5. Clique em **Salvar Evolução**

### 3. Digitalização de Documentos

1. Acesse **Digitalizar**
2. Selecione o paciente
3. Faça upload do documento
4. O sistema aplica OCR automaticamente
5. Documento é associado ao paciente

---

## Testando o Sistema

### Teste 1: Isolamento de Dados (RBAC)

**Login como Gestor (`gestor.clinica1`):**
- ✅ Verá todos os 5 pacientes da Clínica 1
- ✅ Verá 3 fisioterapeutas da clínica
- ❌ NÃO verá dados da Clínica 2

**Login como Fisioterapeuta (`fisio.clinica1`):**
- ✅ Verá apenas seus próprios pacientes
- ❌ Menu "Fisioterapeutas" não aparece
- ❌ NÃO verá pacientes de outros fisioterapeutas

### Teste 2: Dashboard

**Gestor:** Vê métricas de toda a clínica
**Fisioterapeuta:** Vê apenas métricas pessoais

### Teste 3: Evoluções

1. Login como fisioterapeuta
2. Acesse um paciente > aba Evolução
3. Crie uma nova evolução
4. Verifique se aparece na lista com todos os campos

---

## Estrutura da API

### Autenticação
```
POST /api/auth/login/          - Login
POST /api/auth/logout/         - Logout
GET  /api/auth/me/             - Perfil do usuário
```

### Prontuário
```
GET/POST  /api/prontuario/patients/          - Pacientes
GET/POST  /api/prontuario/medical-records/   - Prontuários/Evoluções
GET/POST  /api/prontuario/sessions/          - Sessões
GET       /api/prontuario/dashboard-stats/   - Estatísticas
```

### Documentos
```
GET/POST  /api/documentos/documents/         - Documentos
GET/POST  /api/documentos/categories/        - Categorias
POST      /api/documentos/digitalize/        - Digitalizar com OCR
```

### Assistente IA
```
POST /api/assistant/                         - Chat com assistente
```

---

## Problemas Comuns

### Backend não inicia

**Erro:** `ModuleNotFoundError`
```bash
cd backend
pip install -r requirements.txt
```

### Frontend não inicia

**Erro:** `Cannot find module`
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS

**Erro:** `Access-Control-Allow-Origin`
- Verifique se backend está em `http://127.0.0.1:8000`
- Verifique se frontend está em `http://localhost:3000`
- Confirme as variáveis de ambiente

### Banco de dados vazio

```bash
cd backend
python manage.py migrate
```

### Erro 403 ao acessar endpoints

- Limpe os cookies do navegador
- Faça logout e login novamente

---

## Tecnologias Utilizadas

### Backend
| Tecnologia | Descrição |
|------------|-----------|
| Django 5.x | Framework web |
| Django REST Framework | API REST |
| SimpleJWT | Autenticação JWT |
| SQLite | Banco de dados |
| Pillow | Processamento de imagens |
| pytesseract | OCR |

### Frontend
| Tecnologia | Descrição |
|------------|-----------|
| Next.js 14 | Framework React |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| Lucide Icons | Ícones |

---

## Notas para Produção

> ⚠️ As configurações atuais são para **desenvolvimento**. Para produção:

- [ ] Altere `DEBUG=False` no Django
- [ ] Configure uma `SECRET_KEY` segura
- [ ] Migre para PostgreSQL ou MySQL
- [ ] Ative HTTPS
- [ ] Configure CORS para seu domínio
- [ ] Use variáveis de ambiente para dados sensíveis
- [ ] Configure backup automático do banco

---

## Equipe

- **Maria Clara Neves** - mcsan@cesar.school
- **Matheus Veríssimo** - mmv@cesar.school
- **Vinícius Bernardo** - vbs4@cesar.school
- **Vinícius Marques** - vjmm@cesar.school

---

**PhysioCapture** © 2025
