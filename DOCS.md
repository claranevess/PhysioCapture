# PhysioCapture - Documentação do Sistema

## Visão Geral

PhysioCapture é um sistema de gestão para clínicas de fisioterapia, focado em:
- **Prontuário Digital**: Gerenciamento de pacientes e registros médicos
- **Agenda de Sessões**: Agendamento e controle de sessões de fisioterapia
- **Gestão de Estoque**: Controle de materiais e insumos
- **Documentos**: Digitalização e organização de documentos clínicos

---

## Papéis de Usuário

O sistema possui **3 tipos de usuário** com diferentes níveis de acesso:

### 1. Gestor
- Acesso total ao sistema
- Gerencia usuários (fisioterapeutas e atendentes)
- Visualiza todos os pacientes e relatórios
- Único papel com acesso ao módulo de **Estoque**
- Pode ver toda a agenda da clínica

### 2. Fisioterapeuta
- Acessa apenas seus próprios pacientes
- Cria e edita prontuários e evoluções
- Registra sessões de fisioterapia
- Visualiza sua própria agenda
- Faz upload de documentos clínicos

### 3. Atendente (Recepção)
- Acesso a dados básicos de pacientes (sem dados clínicos)
- Gerencia a agenda de sessões
- Cadastra novos pacientes
- Confirma presença e registra faltas
- **NÃO** acessa prontuários clínicos ou estoque

---

## Criação de Usuários

### Via Script de Seed (Desenvolvimento)

```bash
cd backend
python seed_data.py
```

Isso cria os seguintes usuários de teste:

| Papel | Usuário | Senha | Email |
|-------|---------|-------|-------|
| Gestor | `gestor` | `demo123` | gestor@fisiocapture.com.br |
| Fisioterapeuta | `fisio1` | `demo123` | fisio1@fisiocapture.com.br |
| Fisioterapeuta | `fisio2` | `demo123` | fisio2@fisiocapture.com.br |
| Atendente | `atendente` | `demo123` | recepcao@fisiocapture.com.br |

### Via Django Admin

1. Acesse `http://localhost:8000/admin/`
2. Faça login com um superusuário
3. Vá em "Users" > "Add User"
4. Preencha os campos obrigatórios:
   - Username, Password
   - Clínica (selecione a clínica existente)
   - User Type: GESTOR, FISIOTERAPEUTA ou ATENDENTE
5. Salve o usuário

### Via API (para integrações)

```bash
POST /api/auth/register/
Content-Type: application/json

{
  "username": "novo_usuario",
  "password": "senha123",
  "email": "email@exemplo.com",
  "first_name": "Nome",
  "last_name": "Sobrenome",
  "user_type": "FISIOTERAPEUTA",
  "clinica_id": 1
}
```

---

## Fluxo Completo do Sistema

### 1. Cadastro de Paciente

1. **Atendente** ou **Fisioterapeuta** acessa `/patients/new`
2. Preenche dados básicos: nome, CPF, telefone, data de nascimento
3. Se for fisioterapeuta, o paciente é automaticamente vinculado a ele
4. Se for gestor/atendente, deve selecionar o fisioterapeuta responsável

### 2. Agendamento de Sessão

1. Acesse a **Agenda** (`/agenda`)
2. Clique em "Nova Sessão"
3. Selecione:
   - Paciente
   - Fisioterapeuta (se gestor/atendente)
   - Data e horário
   - Plano de tratamento (opcional)
4. A sessão fica com status "AGENDADA"

### 3. Confirmação e Atendimento

1. **Atendente** confirma presença do paciente (botão "Confirmar")
2. A sessão muda para status "CONFIRMADA"
3. **Fisioterapeuta** registra o atendimento:
   - Procedimentos realizados
   - Evolução do paciente
   - Escala de dor (antes/depois)
4. Fisioterapeuta finaliza a sessão (botão "Finalizar")
5. Status muda para "REALIZADA"

### 4. Plano de Tratamento

1. **Fisioterapeuta** cria um plano de tratamento para o paciente
2. Define: objetivos, frequência, total de sessões
3. Sessões podem ser vinculadas ao plano
4. Sistema calcula automaticamente o progresso (sessões realizadas / total)

### 5. Alta do Paciente

1. Ao final do tratamento, **Fisioterapeuta** registra a alta
2. Seleciona o motivo: melhora, abandono, encaminhamento
3. Documenta avaliação final e recomendações
4. Plano de tratamento é marcado como "CONCLUÍDO"

---

## Módulo de Estoque (Apenas Gestor)

### Acessar
- Menu lateral > **Estoque** (visível apenas para Gestor)
- URL: `/estoque`

### Funcionalidades

1. **Visualizar Itens**
   - Lista com nome, categoria, quantidade atual, status
   - Filtros por categoria e status (normal, baixo, esgotado)

2. **Entrada de Material**
   - Clique no ícone ↓ (seta para baixo) no item
   - Informe a quantidade recebida
   - Sistema registra a transação e atualiza estoque

3. **Saída de Material**
   - Clique no ícone ↑ (seta para cima) no item
   - Informe a quantidade utilizada
   - Sistema valida se há estoque suficiente

4. **Alertas de Estoque Baixo**
   - Card amarelo mostra itens abaixo do mínimo
   - Card vermelho mostra itens esgotados
   - Clique nos cards para filtrar a lista

---

## Estrutura de URLs da API

### Autenticação
```
POST /api/auth/login/          - Login
POST /api/auth/logout/         - Logout
GET  /api/auth/profile/        - Perfil do usuário
PUT  /api/auth/profile/        - Atualizar perfil
```

### Prontuário
```
GET/POST   /api/prontuario/patients/           - Pacientes
GET/POST   /api/prontuario/medical-records/    - Prontuários
GET/POST   /api/prontuario/treatment-plans/    - Planos de tratamento
GET/POST   /api/prontuario/sessions/           - Sessões
GET/POST   /api/prontuario/discharges/         - Altas
```

### Sessões - Ações Especiais
```
GET  /api/prontuario/sessions/today/           - Sessões de hoje
GET  /api/prontuario/sessions/my_schedule/     - Minha agenda
POST /api/prontuario/sessions/{id}/confirm/    - Confirmar
POST /api/prontuario/sessions/{id}/complete/   - Finalizar
POST /api/prontuario/sessions/{id}/cancel/     - Cancelar
POST /api/prontuario/sessions/{id}/no_show/    - Marcar falta
```

### Estoque
```
GET/POST /api/estoque/categories/              - Categorias
GET/POST /api/estoque/items/                   - Itens
GET      /api/estoque/items/stats/             - Estatísticas
GET      /api/estoque/items/low_stock/         - Estoque baixo
GET      /api/estoque/items/out_of_stock/      - Esgotados
POST     /api/estoque/transactions/            - Nova transação
```

### Documentos
```
GET/POST /api/documentos/documents/            - Documentos
GET/POST /api/documentos/categories/           - Categorias
```

---

## Executando o Sistema

### Requisitos
- Python 3.10+
- Node.js 18+
- pip / npm

### Backend

```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Aplicar migrações
python manage.py migrate

# Popular dados de teste
python seed_data.py

# Executar servidor
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

### Acessar

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/

---

## Testes Automatizados

```bash
cd backend

# Executar todos os testes
python manage.py test

# Executar apenas testes do prontuário
python manage.py test prontuario.tests

# Com verbosidade
python manage.py test prontuario.tests --verbosity=2
```

### Cobertura dos Testes
- Permissões de papel (Gestor, Fisioterapeuta, Atendente)
- Acesso a pacientes por papel
- Fluxo de sessões (criação, status, progresso)
- Registro de alta

---

## Tecnologias Utilizadas

### Backend
- **Django 5.x** - Framework web
- **Django REST Framework** - API REST
- **SimpleJWT** - Autenticação JWT
- **SQLite** - Banco de dados (desenvolvimento)

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide Icons** - Ícones

---

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

**Desenvolvido por Core Hive** © 2025
