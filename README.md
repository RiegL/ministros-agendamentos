
# 📖 Sistema de Cadastro e Gerenciamento de Ministros

Este é um sistema web desenvolvido com **React + Vite**, usando **Supabase** como backend para:
- Cadastro de ministros
- Login e autenticação de usuários
- Associação de dados de usuários (`auth.users`) com tabelas personalizadas (`ministros`)
- Agendamento e gerenciamento de visitas (em desenvolvimento)

O projeto utiliza **Service Role Key** para operações administrativas (como exclusão de usuários do Supabase Auth).

---

## 🚀 Tecnologias Usadas

- **Vite** — Build Tool ultrarrápido
- **React** — Framework JavaScript
- **TypeScript** — Tipagem segura
- **Supabase** — Backend as a Service (Banco de dados + Autenticação)
- **Shadcn UI** — Biblioteca de componentes de interface
- **React Router** — Gerenciamento de rotas

---

## ⚙️ Instalação

Clone o projeto:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

Instale as dependências:

```bash
npm install
# ou
yarn install
```

---

## 🛠️ Configuração de Ambiente

Crie um arquivo `.env` na raiz do projeto e adicione:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-public-api-key>
VITE_SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>
```

- `VITE_SUPABASE_URL`: URL do seu projeto no Supabase.
- `VITE_SUPABASE_ANON_KEY`: Chave pública para interações comuns.
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço para ações administrativas (atenção: usar apenas em ambientes seguros).

---

## 📋 Scripts Disponíveis

- `npm run dev` — Inicia o projeto em modo de desenvolvimento.
- `npm run build` — Gera a versão de produção.
- `npm run preview` — Visualiza a build de produção localmente.

---

## ✨ Funcionalidades

- [x] Cadastro de ministros com autenticação por e-mail e senha
- [x] Confirmação de e-mail automática via Supabase
- [x] Associação de `auth.users` com tabela personalizada `ministros`
- [x] Login de usuários autenticados
- [x] Edição e exclusão de ministros
- [x] Excluir ministro tanto da tabela quanto do auth (opcional via Service Role)

---

## 🛡️ Segurança

> Atenção: Nunca exponha sua `Service Role Key` em ambientes públicos.  
> Para produção, prefira usar APIs backend para operações administrativas.

---

## 📄 Licença

Este projeto está sob a licença MIT.  
Sinta-se livre para utilizar, modificar e melhorar!



