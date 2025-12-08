# Guia de Inicialização - PhysioCapture

Este guia fornece instruções passo a passo para configurar, executar e testar o sistema PhysioCapture.

---

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Executar](#como-executar)
- [Contas de Teste](#contas-de-teste)
- [Como Testar o Sistema](#como-testar-o-sistema)
- [Problemas Comuns](#problemas-comuns)

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em seu sistema:

- **Python 3.13 ou superior** - [Download](https://www.python.org/downloads/)
- **Node.js 18 ou superior** - [Download](https://nodejs.org/)
- **npm ou yarn** - Gerenciador de pacotes JavaScript
- **Git** - Sistema de controle de versão

Para verificar se estão instalados:

```bash
python --version
node --version
npm --version
git --version
```

---

## Instalação

### Passo 1: Clone o Repositório

```bash
git clone https://github.com/seu-usuario/PhysioCapture.git
cd PhysioCapture
```

### Passo 2: Configurar o Backend (Django)

#### 2.1. Navegue para o diretório do backend

```bash
cd backend
```

#### 2.2. Crie e ative um ambiente virtual

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2.3. Instale as dependências Python

```bash
pip install -r requirements.txt
```

#### 2.4. Execute as migrações do banco de dados

```bash
python manage.py migrate
```

#### 2.5. (Opcional) Crie um superusuário para o Django Admin

```bash
python manage.py createsuperuser
```

### Passo 3: Configurar o Frontend (Next.js)

#### 3.1. Em um novo terminal, navegue para o diretório do frontend

```bash
cd frontend
```

#### 3.2. Instale as dependências JavaScript

```bash
npm install
```

ou usando yarn:

```bash
yarn install
```

### Passo 4: Configurar Variáveis de Ambiente

#### Backend

Crie um arquivo `.env` na pasta `backend/` com o seguinte conteúdo:

```env
HUGGINGFACE_API_TOKEN=
link da chave: https://drive.google.com/file/d/1px_OzA9P575izVB8lsBXEtE18e57q3-Y/view?usp=sharing
```

#### Frontend

Crie um arquivo `.env.local` na pasta `frontend/` com o seguinte conteúdo:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## Como Executar

### Executar o Backend (Django)

1. Certifique-se de que o ambiente virtual está ativo
2. No diretório `backend/`, execute:

```bash
python manage.py runserver
```

O servidor Django estará disponível em: **http://127.0.0.1:8000**

### Executar o Frontend (Next.js)

1. Em um terminal separado
2. No diretório `frontend/`, execute:

```bash
npm run dev
```

ou com yarn:

```bash
yarn dev
```

O servidor Next.js estará disponível em: **http://localhost:3000**

### Acessar o Sistema

Após iniciar ambos os servidores:

- **Landing Page:** http://localhost:3000
- **Tela de Login:** http://localhost:3000/login
- **Django Admin:** http://127.0.0.1:8000/admin

---

## Contas de Teste

O sistema possui contas pré-configuradas para testes. Todas usam a mesma senha.

**Senha padrão para todas as contas:** `senha123`

### CLINICA 1: FisioVida Centro de Reabilitação

#### Gestor
- **Username:** `gestor.clinica1`
- **Senha:** `senha123`
- **Nome:** Roberto Silva
- **Email:** gestor@fisiovida.com.br
- **Papel:** Gestor (Administrador da clínica)

#### Fisioterapeuta
- **Username:** `fisio.clinica1`
- **Senha:** `senha123`
- **Nome:** Ana Costa
- **Email:** ana.costa@fisiosaude.com.br
- **CREFITO:** CREFITO-3/123456
- **Especialidade:** Ortopedia e Traumatologia
- **Papel:** Fisioterapeuta

**Dados da Clínica 1:**
- Total de fisioterapeutas: 3
- Total de pacientes: 5

---

### CLINICA 2: ReabilitaMax Fisioterapia

#### Gestor
- **Username:** `gestor.clinica2`
- **Senha:** `senha123`
- **Nome:** Mariana Santos
- **Email:** gestor@vidaativa.com.br
- **Papel:** Gestor (Administrador da clínica)

#### Fisioterapeuta
- **Username:** `fisio.clinica2`
- **Senha:** `senha123`
- **Nome:** Pedro Alves
- **Email:** pedro.alves@vidaativa.com.br
- **CREFITO:** CREFITO-3/789012
- **Especialidade:** Neurologia
- **Papel:** Fisioterapeuta

**Dados da Clínica 2:**
- Total de fisioterapeutas: 2
- Total de pacientes: 4

---

## Como Testar o Sistema

Para fazer login no sistema, use qualquer um dos usernames acima com a senha `senha123`.

### Testar RBAC (Isolamento de Dados)

O sistema implementa Controle de Acesso Baseado em Papéis (RBAC) com isolamento completo de dados entre clínicas.

#### Teste 1: Gestor da Clínica 1

1. Faça login como `gestor.clinica1`
2. **Resultado esperado:**
   - Verá todos os **5 pacientes** da Clínica 1
   - Verá os **3 fisioterapeutas** da Clínica 1 (menu "Fisioterapeutas" visível)
   - Dashboard exibirá métricas da clínica inteira
   - NÃO verá dados da Clínica 2 (isolamento multi-tenant)

#### Teste 2: Fisioterapeuta da Clínica 1

1. Faça login como `fisio.clinica1`
2. **Resultado esperado:**
   - Verá apenas os pacientes **associados à Ana Costa**
   - Dashboard exibirá métricas pessoais
   - Menu "Fisioterapeutas" NÃO estará visível (permissão restrita)
   - NÃO verá pacientes de outros fisioterapeutas

#### Teste 3: Gestor da Clínica 2

1. Faça login como `gestor.clinica2`
2. **Resultado esperado:**
   - Verá todos os **4 pacientes** da Clínica 2 (isolamento multi-tenant)
   - Verá os **2 fisioterapeutas** da Clínica 2
   - Dashboard exibirá métricas da clínica inteira
   - NÃO verá dados da Clínica 1

#### Teste 4: Fisioterapeuta da Clínica 2

1. Faça login como `fisio.clinica2`
2. **Resultado esperado:**
   - Verá apenas os pacientes **associados ao Pedro Alves**
   - Dashboard exibirá métricas pessoais
   - Menu "Fisioterapeutas" NÃO estará visível
   - NÃO verá pacientes de outros fisioterapeutas

### Testar Dashboards

O sistema possui dashboards personalizados de acordo com o papel do usuário.

#### Dashboard do Gestor

**Contas para teste:** `gestor.clinica1` ou `gestor.clinica2`

**Métricas exibidas:**
- Total de pacientes da clínica
- Novos pacientes por período
- Total de documentos digitalizados
- Gráfico de evolução de pacientes
- Métricas de atividade por fisioterapeuta
- Distribuição de pacientes por fisioterapeuta

**Como testar:**
1. Faça login com uma conta de gestor
2. Acesse o Dashboard (página inicial após login)
3. Verifique se as métricas mostram dados de toda a clínica
4. Observe os gráficos e estatísticas globais

#### Dashboard do Fisioterapeuta

**Contas para teste:** `fisio.clinica1` ou `fisio.clinica2`

**Métricas exibidas:**
- Total de pacientes próprios (apenas do fisioterapeuta logado)
- Documentos digitalizados pelo usuário hoje
- Últimos pacientes próprios atendidos
- Atividades recentes próprias
- Gráficos de produtividade pessoal

**Como testar:**
1. Faça login com uma conta de fisioterapeuta
2. Acesse o Dashboard (página inicial após login)
3. Verifique se as métricas mostram apenas dados pessoais
4. Observe que NÃO há informações de outros fisioterapeutas

### Testar Funcionalidades Adicionais

#### Gestão de Pacientes

1. **Listar Pacientes**
   - Acesse o menu "Pacientes"
   - Verifique se a lista exibe apenas pacientes permitidos (baseado no papel)
   
2. **Criar Novo Paciente**
   - Clique em "Novo Paciente"
   - Preencha os dados obrigatórios
   - O paciente será associado automaticamente à clínica do usuário

3. **Buscar Paciente**
   - Use a barra de busca
   - Pesquise por nome, CPF ou email

#### Gestão de Fisioterapeutas (Apenas Gestores)

1. Faça login como gestor
2. Acesse o menu "Fisioterapeutas"
3. Visualize a lista de fisioterapeutas da sua clínica
4. Observe informações como:
   - CREFITO
   - Especialidade
   - Quantidade de pacientes
   - Status (Ativo/Inativo)
5. Use a busca para filtrar fisioterapeutas

#### Documentos

1. Acesse o menu "Documentos"
2. Visualize a lista de documentos (filtrados por permissão)
3. Clique em um documento para ver detalhes

#### Digitalização

1. Acesse o menu "Digitalizar"
2. Selecione um paciente (campo obrigatório)
3. Faça upload de um documento
4. O documento será associado ao paciente selecionado

---

## Problemas Comuns

### Backend não inicia

**Erro:** `ModuleNotFoundError`

**Solução:** 
```bash
cd backend
pip install -r requirements.txt
```

### Frontend não inicia

**Erro:** `Cannot find module`

**Solução:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS

**Erro:** `Access-Control-Allow-Origin`

**Solução:** 
- Verifique se o backend está rodando em `http://127.0.0.1:8000`
- Verifique se o frontend está rodando em `http://localhost:3000`
- Confirme que as variáveis de ambiente estão configuradas corretamente

### Banco de dados vazio

Se o banco de dados SQLite não existir ou estiver vazio:

```bash
cd backend
python manage.py migrate
```

**Nota:** O sistema usa SQLite (`db.sqlite3`) como banco de dados. As contas de teste já estão incluídas no banco de dados do projeto. Se precisar resetar o banco de dados, delete o arquivo `db.sqlite3` e execute as migrações novamente.

### Erro 403 ao acessar endpoints

**Causa:** Problema com autenticação de sessão

**Solução:**
- Limpe os cookies do navegador
- Faça logout e login novamente
- Verifique se `withCredentials: true` está configurado no Axios

---

## Notas Importantes

### Modo Desenvolvimento

O sistema está configurado para desenvolvimento:
- DEBUG=True no Django
- Autenticação simplificada em alguns endpoints
- SQLite como banco de dados (arquivo `db.sqlite3` no diretório backend)
- CORS configurado para localhost

### Segurança

**Importante:** As configurações atuais são apenas para desenvolvimento. 

Antes de colocar em produção:
- Troque DEBUG para False no arquivo `.env`
- Configure SECRET_KEY segura (gere uma nova chave aleatória)
- Considere migrar para um banco de dados mais robusto se necessário (PostgreSQL, MySQL)
- Ative HTTPS
- Reabilite todas as verificações de autenticação
- Configure CORS adequadamente para seu domínio
- Use variáveis de ambiente para todos os dados sensíveis
- Configure backup automático do banco de dados

---

## Próximos Passos

Após configurar e testar o sistema:

1. Explore o Django Admin: http://127.0.0.1:8000/admin
2. Crie novos pacientes e documentos
3. Teste todas as permissões de acesso
4. Verifique o isolamento entre clínicas
5. Experimente os diferentes dashboards

---

## Informações do Banco de Dados

O PhysioCapture utiliza **SQLite** como banco de dados:

- **Arquivo:** `backend/db.sqlite3`
- **Tipo:** SQLite3
- **Localização:** Diretório `backend/`
- **Contas pré-configuradas:** Incluídas no banco de dados



