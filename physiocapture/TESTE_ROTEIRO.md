# 🧪 Roteiro de Teste - Funcionalidade PATCH de Documentos

## 📋 Pré-requisitos
- ✅ Servidor rodando (`npm run dev`)
- ✅ Banco de dados configurado
- ✅ Usuário logado no sistema

---

## 🚀 Passo a Passo para Teste

### 1. **Iniciar o Servidor**
```bash
cd physiocapture
npm run dev
```
- ✅ Servidor deve rodar em `http://localhost:3000`
- ✅ Verificar se não há erros no terminal

### 2. **Fazer Login no Sistema**
1. Acesse `http://localhost:3000`
2. Clique em "Entrar" ou "Sign In"
3. Use credenciais de um usuário com permissão de edição:
   - **ADMIN** (acesso total)
   - **MANAGER** (acesso total)
   - **PHYSIOTHERAPIST** (seus pacientes)

### 3. **Navegar para Pacientes**
1. No menu lateral, clique em "Pacientes"
2. Selecione um paciente existente
3. Clique no nome do paciente para acessar o perfil

### 4. **Acessar Documentos do Paciente**
1. Na página do paciente, clique na aba "Documentos"
2. Verifique se existem documentos carregados
3. Se não houver documentos, faça upload de um documento primeiro

### 5. **Testar Edição de Documento**

#### **Cenário 1: Editar Título**
1. Clique no botão "Editar" (ícone de lápis) de um documento
2. Modifique apenas o título:
   ```
   Título antigo → "Novo título do documento"
   ```
3. Clique em "Salvar"
4. ✅ **Verificar**: Título deve ser atualizado na lista

#### **Cenário 2: Editar Descrição**
1. Clique em "Editar" em outro documento
2. Modifique apenas a descrição:
   ```
   Descrição antiga → "Nova descrição detalhada do documento"
   ```
3. Clique em "Salvar"
4. ✅ **Verificar**: Descrição deve ser atualizada

#### **Cenário 3: Editar Categoria**
1. Clique em "Editar" em um documento
2. Mude a categoria (ex: de "OUTROS" para "EXAME_IMAGEM")
3. Clique em "Salvar"
4. ✅ **Verificar**: Categoria deve ser atualizada e filtros devem refletir a mudança

#### **Cenário 4: Editar Múltiplos Campos**
1. Clique em "Editar" em um documento
2. Modifique título, descrição e categoria simultaneamente
3. Clique em "Salvar"
4. ✅ **Verificar**: Todos os campos devem ser atualizados

### 6. **Testar Validações**

#### **Cenário 5: Título Vazio (Deve Falhar)**
1. Clique em "Editar"
2. Deixe o título vazio
3. Clique em "Salvar"
4. ❌ **Verificar**: Deve mostrar erro "Título é obrigatório"

#### **Cenário 6: Descrição Muito Longa (Deve Falhar)**
1. Clique em "Editar"
2. Digite uma descrição com mais de 1000 caracteres
3. Clique em "Salvar"
4. ❌ **Verificar**: Deve mostrar erro "Descrição muito longa"

#### **Cenário 7: Nenhum Campo Modificado (Deve Falhar)**
1. Clique em "Editar"
2. Não modifique nenhum campo
3. Clique em "Salvar"
4. ❌ **Verificar**: Deve mostrar erro "Pelo menos um campo deve ser fornecido"

### 7. **Testar Permissões**

#### **Cenário 8: Usuário sem Permissão**
1. Faça logout
2. Faça login com usuário **RECEPTIONIST**
3. Tente editar um documento
4. ❌ **Verificar**: Deve mostrar erro de permissão

### 8. **Verificar Logs do Servidor**
- ✅ Abra o terminal onde o servidor está rodando
- ✅ Verifique se aparecem logs de sucesso para cada atualização
- ✅ Verifique se não há erros 500 ou outros problemas

---

## 🔍 **Checklist de Verificação**

### ✅ **Funcionalidades que DEVEM funcionar:**
- [ ] Edição de título
- [ ] Edição de descrição  
- [ ] Edição de categoria
- [ ] Edição de múltiplos campos
- [ ] Validação de campos obrigatórios
- [ ] Validação de limites de caracteres
- [ ] Verificação de permissões
- [ ] Atualização em tempo real na interface
- [ ] Persistência no banco de dados

### ❌ **Cenários que DEVEM falhar:**
- [ ] Título vazio
- [ ] Descrição > 1000 caracteres
- [ ] Nenhum campo modificado
- [ ] Usuário sem permissão (RECEPTIONIST)

---

## 🐛 **Possíveis Problemas e Soluções**

### **Problema**: Erro 401 (Não autorizado)
**Solução**: Verificar se está logado e se a sessão não expirou

### **Problema**: Erro 403 (Sem permissão)
**Solução**: Fazer login com usuário ADMIN, MANAGER ou PHYSIOTHERAPIST

### **Problema**: Erro 404 (Documento não encontrado)
**Solução**: Verificar se o documento existe e se o ID está correto

### **Problema**: Erro 500 (Erro interno)
**Solução**: Verificar logs do servidor e se o banco de dados está funcionando

### **Problema**: Interface não atualiza
**Solução**: Recarregar a página ou verificar se há erro no console do navegador

---

## 📊 **Relatório de Teste**

Após executar todos os cenários, documente:

1. **✅ Testes que passaram**
2. **❌ Testes que falharam**
3. **🐛 Bugs encontrados**
4. **💡 Sugestões de melhoria**
5. **📸 Screenshots** (se necessário)

---

## 🎯 **Resultado Esperado**

Se todos os testes passarem, significa que:
- ✅ Backend está funcionando corretamente
- ✅ Validações estão ativas
- ✅ Permissões estão configuradas
- ✅ Interface está integrada
- ✅ Banco de dados está persistindo as alterações

**A funcionalidade PATCH está 100% funcional!** 🎉
