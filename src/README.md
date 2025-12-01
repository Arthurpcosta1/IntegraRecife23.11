#  Integra Recife

> Plataforma digital para conectar cidadãos aos eventos culturais e roteiros turísticos do Recife

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](https://tailwindcss.com/)

---

##  Sobre o Projeto

**Integra Recife** é uma plataforma web desenvolvida para promover a cultura e o turismo do Recife, conectando cidadãos a eventos culturais, roteiros turísticos e projetos colaborativos. A aplicação permite que usuários descubram eventos, avaliem experiências, criem roteiros personalizados e participem de fóruns comunitários.

###  Principais Funcionalidades

- **🎫 Gestão de Eventos**: Cadastro, busca e avaliação de eventos culturais
- **🗺️ Roteiros Turísticos**: Criação e compartilhamento de roteiros temáticos
- **⭐ Sistema de Avaliações**: Avaliações com notas e comentários
- **🔔 Notificações Personalizadas**: Alertas baseados em interesses do usuário
- **📅 Calendário de Eventos**: Visualização temporal de eventos
- **💬 Chat/Fórum Comunitário**: Espaço para discussões e trocas
- **🤝 Projetos Colaborativos**: Gestão de projetos com sistema de papéis
- **📊 Relatórios Gerenciais**: Dashboards e estatísticas (Admin)

---

##  Stack Tecnológica

### Frontend
- **React 18.3** - Biblioteca UI
- **TypeScript 5.5** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS 4.0** - Framework CSS utility-first
- **Shadcn UI** - Componentes UI acessíveis

### Backend & Infraestrutura
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL - Banco de dados relacional
  - Authentication - Sistema de autenticação
  - Real-time - Subscriptions em tempo real
  - Storage - Armazenamento de arquivos

### Bibliotecas Principais
- **React Hook Form** - Gerenciamento de formulários
- **Sonner** - Sistema de notificações toast
- **Lucide React** - Ícones
- **Recharts** - Gráficos e visualizações
- **React Slick** - Carrosséis

---

##  Estrutura do Projeto

```
integra-recife/
├── src/
│   ├── components/           # Componentes React
│   │   ├── common/          # Componentes reutilizáveis
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── PasswordRequirements.tsx
│   │   ├── ui/              # Componentes Shadcn UI
│   │   ├── AdminDashboard.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── ChatForum.tsx
│   │   ├── EventDetailScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MainScreen.tsx
│   │   ├── NotificationSystem.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ProjectsModuleEnhanced.tsx
│   │   └── ToursScreen.tsx
│   │
│   ├── hooks/               # Custom React Hooks
│   │   ├── useAuth.ts       # Gerenciamento de autenticação
│   │   ├── useEvents.ts     # Operações com eventos
│   │   └── useTours.ts      # Operações com roteiros
│   │
│   ├── types/               # Definições TypeScript
│   │   └── index.ts         # Tipos centralizados
│   │
│   ├── utils/               # Funções utilitárias
│   │   ├── supabase/        # Configuração Supabase
│   │   │   ├── client.ts    # Cliente Supabase
│   │   │   └── info.ts      # Credenciais
│   │   ├── formatters.ts    # Formatação de dados
│   │   ├── validation.ts    # Validações
│   │   └── uuid.ts          # Gerador de UUID
│   │
│   ├── styles/              # Estilos globais
│   │   └── globals.css      # CSS global + Tailwind
│   │
│   ├── App.tsx              # Componente raiz
│   └── main.tsx             # Entry point
│
├── public/                  # Arquivos estáticos
├── .env                     # Variáveis de ambiente (não commitado)
├── .env.example             # Exemplo de variáveis
├── package.json             # Dependências
├── tsconfig.json            # Config TypeScript
├── vite.config.ts           # Config Vite
└── README.md               # Este arquivo
```

---

##  Guia de Instalação

### Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** ou **yarn**
- Conta no **Supabase** (gratuita)

### Passo 1: Clone o Repositório

```bash
git clone https://github.com/seu-usuario/integra-recife.git
cd integra-recife
```

### Passo 2: Instale as Dependências

```bash
npm install
# ou
yarn install
```

### Passo 3: Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env` no Git!

Para obter suas credenciais:
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Settings > API**
4. Copie a **URL** e a **anon/public key**

### Passo 4: Configure o Banco de Dados

Execute os scripts SQL no Supabase SQL Editor (Settings > SQL Editor):

```sql
-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabelas (ver /database/schema.sql para script completo)
-- Execute os scripts de criação de tabelas do projeto
```

### Passo 5: Inicie o Servidor de Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ✅ Sim |
| `VITE_SUPABASE_ANON_KEY` | Chave pública do Supabase | ✅ Sim |

---

##  Arquitetura e Decisões Técnicas

### 1. Componentização

- **Componentes Pequenos e Focados**: Cada componente tem uma responsabilidade única
- **Reutilização**: Componentes comuns em `/components/common/`
- **Tipagem Forte**: Todas as props são tipadas com TypeScript

### 2. Custom Hooks

Lógica de negócio separada em hooks customizados:

- `useAuth`: Gerencia autenticação e sessão
- `useEvents`: Operações CRUD de eventos
- `useTours`: Gerenciamento de roteiros turísticos

**Benefícios**:
- Código mais testável
- Reutilização de lógica
- Separação de responsabilidades

### 3. Gerenciamento de Estado

- **Estado Local**: Usando `useState` para UI state
- **Estado Global**: Context API para autenticação
- **Cache de Dados**: Supabase faz cache automático de queries

### 4. Tipagem TypeScript

Tipos centralizados em `/types/index.ts`:

```typescript
export interface Event {
  id: number;
  title: string;
  date: string;
  // ...
}

export interface User {
  id: string;
  email: string;
  // ...
}
```

**Benefícios**:
- Type-safety em toda aplicação
- Autocompletar no editor
- Refatoração mais segura
- Documentação viva do código

### 5. Tratamento de Erros

- **Toast Notifications**: Feedback visual para usuário (usando Sonner)
- **Error Boundaries**: Captura erros de componentes
- **Try/Catch**: Em todas operações assíncronas
- **Loading States**: Skeleton screens durante carregamento

### 6. Autenticação Persistente

```typescript
// Verifica sessão ao carregar app
useEffect(() => {
  checkSession();
}, []);

const checkSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  // Restaura usuário se sessão válida
};
```

**Benefício**: Usuário permanece logado após F5

### 7. Validação de Dados

Validações centralizadas em `/utils/validation.ts`:

```typescript
export const validatePassword = (password: string): string => {
  // Regras de validação
};
```

### 8. Formatação de Dados

Helpers em `/utils/formatters.ts`:

```typescript
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};
```

---

## 📱 Responsividade

A aplicação é **totalmente responsiva** com breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Estratégias:
- Grid responsivo com Tailwind
- Media queries no CSS customizado
- Componentes que se adaptam ao viewport

---

## 🧪 Testes

```bash
# Rodar testes (quando implementados)
npm run test

# Coverage
npm run test:coverage
```

---

## 🚢 Deploy

### Build de Produção

```bash
npm run build
# ou
yarn build
```

Os arquivos otimizados estarão em `/dist`

### Deploy Recomendado

- **Vercel** (recomendado para React + Vite)
- **Netlify**
- **Supabase Hosting**

#### Deploy na Vercel

```bash
npm install -g vercel
vercel
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Código

- **ESLint** para linting
- **Prettier** para formatação
- **Conventional Commits** para mensagens de commit

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

Desenvolvido com ❤️ pela equipe Integra Recife

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/integra-recife/issues)
- **Email**: contato@integrarecife.com.br
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/integra-recife/wiki)

---

## 🗺️ Roadmap

- [ ] Implementação de PWA (Progressive Web App)
- [ ] App mobile nativo (React Native)
- [ ] Integração com redes sociais
- [ ] Sistema de gamificação
- [ ] API pública para desenvolvedores
- [ ] Internacionalização (i18n)

---

**Feito com ❤️ para a cidade do Recife** 🌴
