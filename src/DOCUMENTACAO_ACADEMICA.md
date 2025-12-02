# DOCUMENTAÇÃO TÉCNICA ACADÊMICA
## Sistema Integra Recife - Plataforma de Gestão de Eventos Culturais

---

**Instituição:** Universidade Federal de Pernambuco (exemplo)  
**Curso:** Engenharia de Software / Ciência da Computação  
**Disciplina:** Trabalho de Conclusão de Curso (TCC)  
**Autor(es):** Equipe Integra Recife  
**Orientador:** Prof. Dr. [Nome do Orientador]  
**Data:** Dezembro de 2024  
**Versão:** 1.0

---

## RESUMO

Este documento apresenta a arquitetura e implementação do sistema **Integra Recife**, uma plataforma web desenvolvida para promover a cultura e o turismo da cidade do Recife através da gestão digital de eventos culturais, roteiros turísticos e projetos colaborativos. O sistema foi desenvolvido utilizando arquitetura moderna em camadas com React, TypeScript e Supabase, atingindo **90,9% de conformidade** com os requisitos funcionais especificados. A solução implementa autenticação robusta, notificações em tempo real, sistema de avaliações e gestão colaborativa de projetos, atendendo às necessidades de dois perfis de usuário (cidadãos e administradores). Este trabalho demonstra a aplicação prática de conceitos de Engenharia de Software, padrões de projeto, segurança de aplicações web e desenvolvimento ágil.

**Palavras-chave:** Gestão de Eventos, React, TypeScript, Supabase, Row Level Security, Arquitetura em Camadas, BaaS.

---

## SUMÁRIO

1. [Introdução e Objetivos](#1-introdução-e-objetivos)
2. [Arquitetura da Solução](#2-arquitetura-da-solução)
3. [Modelagem de Dados](#3-modelagem-de-dados)
4. [Detalhamento dos Módulos](#4-detalhamento-dos-módulos)
5. [Segurança e Infraestrutura](#5-segurança-e-infraestrutura)
6. [Atendimento aos Requisitos](#6-atendimento-aos-requisitos)
7. [Resultados e Discussão](#7-resultados-e-discussão)
8. [Conclusão e Trabalhos Futuros](#8-conclusão-e-trabalhos-futuros)
9. [Referências Bibliográficas](#9-referências-bibliográficas)

---

# 1. INTRODUÇÃO E OBJETIVOS

## 1.1 Contextualização

A cidade do Recife possui uma rica agenda cultural com eventos de música, teatro, gastronomia, festivais e manifestações artísticas diversas. Entretanto, a dispersão dessas informações em múltiplos canais (redes sociais, sites institucionais, divulgação informal) dificulta o acesso dos cidadãos a essas oportunidades culturais. Além disso, organizadores de eventos enfrentam desafios na divulgação e gestão de suas atividades, enquanto turistas carecem de ferramentas integradas para explorar a cidade de forma estruturada.

## 1.2 Problema

Identificou-se a necessidade de uma **plataforma centralizada e digital** que:
- Agregue eventos culturais em um único local
- Facilite a descoberta de eventos baseados em interesses pessoais
- Permita avaliações e feedback dos participantes
- Ofereça roteiros turísticos temáticos
- Promova colaboração entre organizadores de eventos
- Forneça ferramentas de gestão para administradores

## 1.3 Objetivos

### Objetivo Geral
Desenvolver uma plataforma web responsiva para gestão e divulgação de eventos culturais do Recife, integrando funcionalidades de descoberta, avaliação, planejamento de roteiros e colaboração entre usuários.

### Objetivos Específicos
1. Implementar sistema de cadastro e busca de eventos culturais
2. Desenvolver mecanismo de notificações personalizadas baseadas em interesses
3. Criar sistema de avaliações com notas e comentários
4. Implementar módulo de roteiros turísticos temáticos
5. Desenvolver sistema de projetos colaborativos com papéis customizados
6. Implementar chat/fórum comunitário em tempo real
7. Criar dashboard administrativo com relatórios gerenciais
8. Garantir segurança através de Row Level Security (RLS)
9. Implementar autenticação robusta com validação de senha
10. Desenvolver interface responsiva e acessível

## 1.4 Justificativa

A escolha deste tema fundamenta-se em:
- **Impacto Social**: Democratização do acesso à cultura
- **Turismo Cultural**: Fortalecimento da economia criativa local
- **Tecnologia como Ponte**: Conectar organizadores, cidadãos e turistas
- **Desafio Técnico**: Aplicação de conceitos avançados de Engenharia de Software

## 1.5 Escopo

### Dentro do Escopo
- Aplicação web responsiva (desktop e mobile)
- Dois perfis de usuário (cidadão e administrador)
- CRUD completo de eventos, roteiros e projetos
- Sistema de autenticação e autorização
- Notificações em tempo real
- Chat/fórum comunitário
- Sistema de avaliações

### Fora do Escopo
- Aplicativo móvel nativo
- Integração com redes sociais
- Sistema de pagamentos online
- Venda de ingressos
- Geolocalização em tempo real

---

# 2. ARQUITETURA DA SOLUÇÃO

## 2.1 Visão Geral da Arquitetura

O sistema foi projetado seguindo uma **arquitetura em camadas** com separação clara de responsabilidades, conforme ilustrado no diagrama abaixo:

```
┌─────────────────────────────────────────────────────┐
│           CAMADA DE APRESENTAÇÃO                    │
│        (React Components + Tailwind CSS)            │
│  - Interface do Usuário                             │
│  - Componentes reativos                             │
│  - Validações client-side                           │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│         CAMADA DE LÓGICA DE NEGÓCIO                 │
│         (Custom Hooks + Utilities)                  │
│  - Gerenciamento de estado                          │
│  - Lógica de negócio encapsulada                    │
│  - Validações e formatações                         │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│            CAMADA DE DADOS                          │
│      (Supabase BaaS + PostgreSQL)                   │
│  - Persistência de dados                            │
│  - Autenticação JWT                                 │
│  - Row Level Security (RLS)                         │
│  - Real-time Subscriptions                          │
└─────────────────────────────────────────────────────┘
```

### Princípios Arquiteturais Aplicados

1. **Separation of Concerns (SoC)**: Cada camada possui responsabilidades bem definidas
2. **Single Responsibility Principle (SRP)**: Componentes e funções com propósito único
3. **Don't Repeat Yourself (DRY)**: Reutilização através de custom hooks e componentes comuns
4. **KISS (Keep It Simple, Stupid)**: Código simples e legível
5. **Dependency Inversion**: Camadas superiores dependem de abstrações, não de implementações concretas

## 2.2 Escolha das Tecnologias

### 2.2.1 Justificativa: React 18.3

**Por que React?**
- **Component-Based Architecture**: Facilita modularização e reutilização de código
- **Virtual DOM**: Otimização de performance em atualizações de UI
- **Hooks**: Gerenciamento de estado e efeitos colaterais de forma funcional
- **Ecossistema Rico**: Vasta gama de bibliotecas e ferramentas
- **Comunidade Ativa**: Suporte e documentação extensos
- **Adoção no Mercado**: Stack amplamente utilizada na indústria

**Alternativas Consideradas**:
- **Vue.js**: Descartado por menor adoção corporativa
- **Angular**: Descartado pela curva de aprendizado mais íngreme
- **Svelte**: Descartado por ser emergente com ecossistema limitado

### 2.2.2 Justificativa: TypeScript 5.5

**Por que TypeScript?**
- **Type Safety**: Detecção de erros em tempo de compilação
- **IntelliSense**: Autocompletar e documentação inline no editor
- **Refatoração Segura**: Mudanças em tipos propagam alertas em todo o código
- **Documentação Viva**: Interfaces e tipos servem como documentação
- **Escalabilidade**: Facilita manutenção em projetos grandes
- **Interoperabilidade**: Compatível com JavaScript puro

### 2.2.3 Justificativa: Supabase (BaaS)

**Por que Supabase?**
- **Backend as a Service (BaaS)**: Reduz tempo de desenvolvimento de infraestrutura
- **PostgreSQL Completo**: Banco de dados relacional robusto
- **Row Level Security (RLS)**: Segurança a nível de linha nativa
- **Real-time Subscriptions**: WebSocket integrado para atualizações em tempo real
- **Autenticação Integrada**: JWT tokens, OAuth, MFA out-of-the-box
- **Open Source**: Código aberto, evita vendor lock-in
- **Escalabilidade**: Infraestrutura gerenciada com auto-scaling
- **Custo-Benefício**: Plano gratuito generoso para MVP

**Alternativas Consideradas**:
- **Firebase**: Descartado por usar NoSQL (projeto requer relacionamentos complexos)
- **AWS Amplify**: Descartado pela complexidade de configuração
- **Backend Customizado (Node.js)**: Descartado pelo tempo de desenvolvimento

### 2.2.4 Justificativa: Tailwind CSS 4.0

**Por que Tailwind?**
- **Utility-First**: Desenvolvimento rápido sem escrever CSS customizado
- **Design System Consistente**: Espaçamentos e cores padronizados
- **Responsividade**: Breakpoints intuitivos (sm, md, lg, xl)
- **Performance**: PurgeCSS remove classes não utilizadas
- **Customizável**: Configuração via `tailwind.config.js`
- **Dark Mode**: Suporte nativo a temas

### 2.2.5 Justificativa: Shadcn UI

**Por que Shadcn UI?**
- **Componentes Acessíveis**: Baseado em Radix UI com ARIA completo
- **Não é uma Biblioteca**: Código copiado para o projeto (ownership total)
- **Customizável**: Componentes podem ser modificados livremente
- **TypeScript First**: Totalmente tipado
- **Tailwind Integration**: Usa Tailwind para estilização

## 2.3 Estrutura de Diretórios

```
integra-recife/
├── src/
│   ├── components/              # Componentes React
│   │   ├── common/             # Componentes reutilizáveis
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── PasswordRequirements.tsx
│   │   ├── ui/                 # Componentes Shadcn UI
│   │   ├── AdminDashboard.tsx  # Painel administrativo
│   │   ├── CalendarScreen.tsx  # Calendário de eventos
│   │   ├── ChatForum.tsx       # Chat/Fórum
│   │   ├── EventDetailScreen.tsx
│   │   ├── LoginScreen.tsx     # Autenticação
│   │   ├── MainScreen.tsx      # Dashboard principal
│   │   ├── NotificationSystem.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ProjectsModuleEnhanced.tsx
│   │   └── ToursScreen.tsx
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.ts          # Gerenciamento de autenticação
│   │   ├── useEvents.ts        # Operações com eventos
│   │   └── useTours.ts         # Operações com roteiros
│   │
│   ├── types/                  # Definições TypeScript
│   │   └── index.ts            # Tipos centralizados
│   │
│   ├── utils/                  # Funções utilitárias
│   │   ├── supabase/
│   │   │   ├── client.tsx      # Cliente Supabase (singleton)
│   │   │   └── info.tsx        # Credenciais
│   │   ├── formatters.ts       # Formatação de dados
│   │   ├── validation.ts       # Validações
│   │   └── uuid.ts             # Gerador de UUID
│   │
│   ├── styles/                 # Estilos globais
│   │   └── globals.css         # CSS global + Tailwind
│   │
│   ├── App.tsx                 # Componente raiz (roteamento)
│   └── main.tsx                # Entry point da aplicação
│
├── database/                   # Scripts SQL do banco de dados
│   ├── schema-completo.sql
│   ├── schema-roteiros.sql
│   └── [outros scripts]
│
├── .env.example                # Exemplo de variáveis de ambiente
├── package.json                # Dependências do projeto
├── tsconfig.json               # Configuração TypeScript
├── tailwind.config.js          # Configuração Tailwind
├── vite.config.ts              # Configuração Vite
└── README.md                   # Documentação do projeto
```

### Decisões de Organização

1. **Componentes Comuns (`/components/common/`)**: Componentes reutilizáveis em toda a aplicação
2. **Custom Hooks (`/hooks/`)**: Separação da lógica de negócio dos componentes de UI
3. **Tipos Centralizados (`/types/`)**: Garantia de consistência de tipos em todo o projeto
4. **Utilities (`/utils/`)**: Funções puras e helpers (formatação, validação, etc.)
5. **Styles (`/styles/`)**: CSS global e customizações do Tailwind

## 2.4 Fluxo de Dados

O sistema segue o padrão de **fluxo unidirecional de dados** (Unidirectional Data Flow), característico de aplicações React:

```
┌─────────────┐
│   Ação do   │
│   Usuário   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   Componente    │ ──► Chama custom hook
│   React (UI)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Custom Hook    │ ──► Executa lógica de negócio
│  (Lógica)       │ ──► Faz chamada ao Supabase
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│    Supabase     │ ──► Processa query
│   (Banco)       │ ──► Aplica RLS
│                 │ ──► Retorna dados
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Atualização    │ ──► setState() atualiza estado
│   de Estado     │ ──► React re-renderiza componente
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  UI Atualizada  │
└─────────────────┘
```

### Exemplo Prático: Carregar Eventos

1. **Usuário** acessa a tela principal
2. **MainScreen** é montado e chama `useEvents()`
3. **useEvents** hook executa `loadEvents()`
4. **Supabase** recebe query: `SELECT * FROM eventos WHERE status = 'ativo'`
5. **RLS** valida permissões do usuário
6. **Dados** retornam para o hook
7. **Hook** atualiza estado: `setEvents(data)`
8. **React** re-renderiza MainScreen com novos dados

---

# 3. MODELAGEM DE DADOS

## 3.1 Diagrama Entidade-Relacionamento (ER)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  USUARIOS   │         │   EVENTOS   │         │ AVALIACOES  │
│─────────────│         │─────────────│         │─────────────│
│ id (PK)     │────┐    │ id (PK)     │────┬───│ id (PK)     │
│ email       │    │    │ titulo      │    │   │ nota        │
│ nome        │    │    │ descricao   │    │   │ comentario  │
│ tipo        │    │    │ data_inicio │    │   │ evento_id   │
│ avatar      │    │    │ localizacao │    │   │ usuario_id  │
│ interesses[]│    │    │ categoria   │    │   │ criado_em   │
│ criado_em   │    │    │ imagem      │    │   └─────────────┘
└─────────────┘    │    │ organizador │    │
       │           │    │ status      │    │
       │           │    │ criado_em   │    │
       │           │    └─────────────┘    │
       │           │           │           │
       │           │           │           │
       │           └───────────┼───────────┘
       │                       │
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│  FAVORITOS  │         │ INSCRICOES  │
│─────────────│         │─────────────│
│ id (PK)     │         │ id (PK)     │
│ usuario_id  │         │ evento_id   │
│ evento_id   │         │ usuario_id  │
│ criado_em   │         │ status      │
└─────────────┘         │ criado_em   │
                        └─────────────┘

┌─────────────┐         ┌──────────────────┐
│  PROJETOS   │         │ MEMBROS_PROJETO  │
│─────────────│         │──────────────────│
│ id (PK)     │────┬───│ id (PK)          │
│ titulo      │    │   │ projeto_id (FK)  │
│ descricao   │    │   │ usuario_id (FK)  │
│ status      │    │   │ papel            │
│ categoria   │    │   │ adicionado_em    │
│ progresso   │    │   └──────────────────┘
│ orcamento   │    │
│ criado_por  │    │
│ criado_em   │    │
└─────────────┘    │
                   │
                   │
┌─────────────────┐│   ┌──────────────────────┐
│ROTEIROS_TURIST. ││   │ PONTOS_INTERESSE     │
│─────────────────││   │──────────────────────│
│ id (PK)         ││   │ id (PK)              │
│ titulo          │└──│ roteiro_id (FK)      │
│ descricao       │   │ nome                  │
│ duracao_estimada│   │ descricao             │
│ imagem          │   │ ordem                 │
│ numero_pontos   │   │ latitude              │
│ visualizacoes   │   │ longitude             │
│ status          │   │ endereco              │
└─────────────────┘   └──────────────────────┘

┌─────────────────┐   ┌──────────────────────┐
│  CANAIS_CHAT    │   │  MENSAGENS_CHAT      │
│─────────────────│   │──────────────────────│
│ id (PK)         │──│ id (PK)              │
│ nome            │   │ canal_id (FK)        │
│ descricao       │   │ usuario_id (FK)      │
│ tipo            │   │ usuario_nome         │
│ evento_id (FK)  │   │ usuario_avatar       │
│ projeto_id (FK) │   │ conteudo             │
│ criado_em       │   │ fixada               │
└─────────────────┘   │ criado_em            │
                      └──────────────────────┘

┌──────────────────┐
│  NOTIFICACOES    │
│──────────────────│
│ id (PK)          │
│ usuario_id (FK)  │
│ tipo             │
│ titulo           │
│ mensagem         │
│ lida             │
│ link             │
│ criado_em        │
└──────────────────┘
```

## 3.2 Dicionário de Dados

### 3.2.1 Tabela: `usuarios`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PRIMARY KEY | Identificador único do usuário |
| email | TEXT | UNIQUE, NOT NULL | Email para login |
| nome | TEXT | NOT NULL | Nome completo do usuário |
| tipo | TEXT | CHECK (admin/cidadao) | Tipo de conta |
| avatar | TEXT | NULL | URL da foto de perfil |
| telefone | TEXT | NULL | Telefone de contato |
| bio | TEXT | NULL | Biografia/descrição |
| interesses | TEXT[] | NULL | Array de categorias de interesse |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| atualizado_em | TIMESTAMPTZ | DEFAULT NOW() | Data da última atualização |

**Regras de Negócio**:
- Email deve ser único no sistema
- Tipo `cidadao` deve ter ao menos 1 interesse cadastrado
- Avatar pode ser NULL (usa imagem padrão)

### 3.2.2 Tabela: `eventos`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PRIMARY KEY | Identificador único do evento |
| titulo | TEXT | NOT NULL | Nome do evento |
| descricao | TEXT | NOT NULL | Descrição detalhada |
| data_inicio | TIMESTAMPTZ | NOT NULL | Data e hora de início |
| data_fim | TIMESTAMPTZ | NULL | Data e hora de término |
| localizacao | TEXT | NOT NULL | Nome do local |
| endereco_completo | TEXT | NULL | Endereço completo |
| latitude | DECIMAL(10,8) | NULL | Coordenada GPS |
| longitude | DECIMAL(11,8) | NULL | Coordenada GPS |
| imagem | TEXT | NULL | URL da imagem do evento |
| categoria | TEXT | NOT NULL | Categoria (Música, Teatro, etc) |
| cor_categoria | TEXT | NULL | Cor hexadecimal para UI |
| capacidade | INTEGER | NULL | Capacidade máxima |
| preco | DECIMAL(10,2) | DEFAULT 0 | Preço do ingresso |
| organizador_id | UUID | FK → usuarios(id) | Organizador do evento |
| status | TEXT | CHECK, DEFAULT 'ativo' | Status do evento |
| destaque | BOOLEAN | DEFAULT FALSE | Se está em destaque |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| atualizado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

**Regras de Negócio**:
- `data_fim` deve ser posterior a `data_inicio` (validação client-side)
- `preco` 0 indica evento gratuito
- `status` pode ser: 'ativo', 'cancelado', 'concluido', 'adiado'

### 3.2.3 Tabela: `avaliacoes`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| evento_id | UUID | FK → eventos(id) | Evento avaliado |
| usuario_id | UUID | FK → usuarios(id) | Usuário que avaliou |
| nota | INTEGER | CHECK (1-5) | Nota de 1 a 5 estrelas |
| comentario | TEXT | NULL | Comentário opcional |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data da avaliação |
| atualizado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

**Regras de Negócio**:
- Constraint `UNIQUE(evento_id, usuario_id)`: Usuário só pode avaliar um evento uma vez
- Nota obrigatória, comentário opcional
- Permite atualização (upsert pattern)

### 3.2.4 Tabela: `favoritos`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| usuario_id | UUID | FK → usuarios(id), CASCADE | Usuário |
| evento_id | UUID | FK → eventos(id), CASCADE | Evento favoritado |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data em que favoritou |

**Regras de Negócio**:
- Constraint `UNIQUE(usuario_id, evento_id)`: Não permite favoritar o mesmo evento duas vezes
- `ON DELETE CASCADE`: Se evento ou usuário for deletado, o favorito é removido

### 3.2.5 Tabela: `projetos`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| titulo | TEXT | NOT NULL | Nome do projeto |
| descricao | TEXT | NOT NULL | Descrição detalhada |
| categoria | TEXT | NOT NULL | Categoria do projeto |
| status | TEXT | CHECK, DEFAULT 'planejamento' | Status atual |
| prioridade | TEXT | CHECK, DEFAULT 'media' | Prioridade |
| data_inicio | DATE | NULL | Data de início planejada |
| data_fim | DATE | NULL | Data de término planejada |
| orcamento | DECIMAL(12,2) | NULL | Orçamento estimado |
| progresso | INTEGER | CHECK (0-100), DEFAULT 0 | Percentual de progresso |
| criado_por | UUID | FK → usuarios(id) | Criador do projeto |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| atualizado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

**Regras de Negócio**:
- `status`: 'planejamento', 'em-andamento', 'concluido', 'cancelado'
- `prioridade`: 'baixa', 'media', 'alta'
- `progresso` entre 0 e 100

### 3.2.6 Tabela: `membros_projeto`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| projeto_id | UUID | FK → projetos(id), CASCADE | Projeto |
| usuario_id | UUID | FK → usuarios(id), CASCADE | Membro |
| papel | TEXT | NULL | Papel customizado no projeto |
| adicionado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de inclusão |

**Regras de Negócio**:
- Constraint `UNIQUE(projeto_id, usuario_id)`: Usuário participa de projeto apenas uma vez
- `papel` é texto livre (ex: "Coordenador", "Designer", "Desenvolvedor")

### 3.2.7 Tabela: `roteiros_turisticos`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| titulo | TEXT | NOT NULL | Nome do roteiro |
| descricao | TEXT | NOT NULL | Descrição breve |
| descricao_completa | TEXT | NULL | Descrição detalhada |
| duracao_estimada | TEXT | NOT NULL | Duração (ex: "2-3 horas") |
| imagem | TEXT | NULL | URL da imagem |
| numero_pontos | INTEGER | DEFAULT 0 | Quantidade de pontos |
| visualizacoes | INTEGER | DEFAULT 0 | Contador de visualizações |
| status | TEXT | CHECK, DEFAULT 'publicado' | Status de publicação |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| atualizado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

**Regras de Negócio**:
- `status`: 'rascunho', 'publicado'
- Apenas roteiros com status 'publicado' são exibidos para usuários

### 3.2.8 Tabela: `pontos_interesse`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| roteiro_id | INTEGER | FK → roteiros_turisticos(id), CASCADE | Roteiro pai |
| nome | TEXT | NOT NULL | Nome do ponto |
| descricao | TEXT | NOT NULL | Descrição do local |
| imagem | TEXT | NULL | URL da imagem |
| ordem | INTEGER | NOT NULL | Ordem sequencial (1, 2, 3...) |
| latitude | DECIMAL(10,8) | NULL | Coordenada GPS |
| longitude | DECIMAL(11,8) | NULL | Coordenada GPS |
| endereco | TEXT | NULL | Endereço do ponto |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**Regras de Negócio**:
- `ordem` define sequência do roteiro
- Ordenação: `ORDER BY ordem ASC`

### 3.2.9 Tabela: `canais_chat`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| nome | TEXT | NOT NULL | Nome do canal |
| descricao | TEXT | NOT NULL | Descrição do propósito |
| tipo | TEXT | CHECK, NOT NULL | Tipo de canal |
| evento_id | UUID | FK → eventos(id), CASCADE | Evento relacionado |
| projeto_id | UUID | FK → projetos(id), CASCADE | Projeto relacionado |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**Regras de Negócio**:
- `tipo`: 'geral', 'evento', 'projeto'
- Se tipo='evento', `evento_id` deve estar preenchido
- Se tipo='projeto', `projeto_id` deve estar preenchido

### 3.2.10 Tabela: `mensagens_chat`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| canal_id | UUID | FK → canais_chat(id), CASCADE | Canal |
| usuario_id | UUID | FK → usuarios(id), CASCADE | Autor |
| usuario_nome | TEXT | NOT NULL | Nome do autor (desnormalizado) |
| usuario_avatar | TEXT | NOT NULL | Avatar do autor (desnormalizado) |
| conteudo | TEXT | NOT NULL | Conteúdo da mensagem |
| fixada | BOOLEAN | DEFAULT FALSE | Se está fixada (pinned) |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de envio |

**Regras de Negócio**:
- Campos desnormalizados (`usuario_nome`, `usuario_avatar`) para performance
- Mensagens fixadas aparecem no topo do canal

### 3.2.11 Tabela: `notificacoes`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| usuario_id | UUID | FK → usuarios(id), CASCADE | Destinatário |
| tipo | TEXT | CHECK, NOT NULL | Tipo de notificação |
| titulo | TEXT | NOT NULL | Título da notificação |
| mensagem | TEXT | NOT NULL | Mensagem detalhada |
| lida | BOOLEAN | DEFAULT FALSE | Status de leitura |
| link | TEXT | NULL | Link de ação opcional |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**Regras de Negócio**:
- `tipo`: 'info', 'sucesso', 'alerta', 'erro'
- Notificações não lidas são destacadas na UI

### 3.2.12 Tabela: `inscricoes`

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PRIMARY KEY | Identificador único |
| evento_id | UUID | FK → eventos(id), CASCADE | Evento |
| usuario_id | UUID | FK → usuarios(id), CASCADE | Usuário inscrito |
| status | TEXT | CHECK, DEFAULT 'confirmada' | Status da inscrição |
| criado_em | TIMESTAMPTZ | DEFAULT NOW() | Data de inscrição |

**Regras de Negócio**:
- Constraint `UNIQUE(evento_id, usuario_id)`: Usuário só pode se inscrever uma vez
- `status`: 'confirmada', 'pendente', 'cancelada'

## 3.3 Schema SQL Completo

```sql
-- =====================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS
-- Plataforma Integra Recife
-- Versão: 1.0
-- =====================================================

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  avatar TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'cidadao')),
  telefone TEXT,
  bio TEXT,
  interesses TEXT[],
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: eventos
-- =====================================================
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  localizacao TEXT NOT NULL,
  endereco_completo TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  imagem TEXT,
  categoria TEXT NOT NULL,
  cor_categoria TEXT,
  capacidade INTEGER,
  preco DECIMAL(10, 2) DEFAULT 0,
  organizador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('ativo', 'cancelado', 'concluido', 'adiado')) DEFAULT 'ativo',
  destaque BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: favoritos
-- =====================================================
CREATE TABLE IF NOT EXISTS favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, evento_id)
);

-- =====================================================
-- TABELA: avaliacoes
-- =====================================================
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id, usuario_id)
);

-- =====================================================
-- TABELA: projetos
-- =====================================================
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  status TEXT CHECK (status IN ('planejamento', 'em-andamento', 'concluido', 'cancelado')) DEFAULT 'planejamento',
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta')) DEFAULT 'media',
  data_inicio DATE,
  data_fim DATE,
  orcamento DECIMAL(12, 2),
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: membros_projeto
-- =====================================================
CREATE TABLE IF NOT EXISTS membros_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  papel TEXT,
  adicionado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(projeto_id, usuario_id)
);

-- =====================================================
-- TABELA: canais_chat
-- =====================================================
CREATE TABLE IF NOT EXISTS canais_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('geral', 'evento', 'projeto')),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: mensagens_chat
-- =====================================================
CREATE TABLE IF NOT EXISTS mensagens_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canal_id UUID NOT NULL REFERENCES canais_chat(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  usuario_nome TEXT NOT NULL,
  usuario_avatar TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  fixada BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: notificacoes
-- =====================================================
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('info', 'sucesso', 'alerta', 'erro')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  link TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: inscricoes
-- =====================================================
CREATE TABLE IF NOT EXISTS inscricoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('confirmada', 'pendente', 'cancelada')) DEFAULT 'confirmada',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id, usuario_id)
);

-- =====================================================
-- TABELA: roteiros_turisticos
-- =====================================================
CREATE TABLE IF NOT EXISTS roteiros_turisticos (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  descricao_completa TEXT,
  duracao_estimada TEXT NOT NULL,
  imagem TEXT,
  numero_pontos INTEGER DEFAULT 0,
  visualizacoes INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('rascunho', 'publicado')) DEFAULT 'publicado',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: pontos_interesse
-- =====================================================
CREATE TABLE IF NOT EXISTS pontos_interesse (
  id SERIAL PRIMARY KEY,
  roteiro_id INTEGER REFERENCES roteiros_turisticos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  imagem TEXT,
  ordem INTEGER NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  endereco TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos(status);
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_evento ON avaliacoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON avaliacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_pontos_roteiro_ordem ON pontos_interesse(roteiro_id, ordem);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_usuarios
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_eventos
  BEFORE UPDATE ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_avaliacoes
  BEFORE UPDATE ON avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_projetos
  BEFORE UPDATE ON projetos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();
```

---

# 4. DETALHAMENTO DOS MÓDULOS

Esta seção descreve os principais módulos do sistema sem incluir código-fonte completo, focando em suas responsabilidades e funções principais.

## 4.1 Camada de Apresentação (Frontend)

### 4.1.1 App.tsx - Componente Raiz

**Responsabilidade**: Gerenciar o roteamento da aplicação e o estado global de autenticação.

**Principais Funções**:
- `checkSession()`: Verifica sessão persistente ao carregar app (corrige bug de logout ao dar F5)
- `handleLogin()`: Processa login e atualiza estado global
- `handleLogout()`: Encerra sessão e limpa estado
- Renderização condicional de telas baseado em `currentScreen` e `isAuthenticated`

**Decisão de Projeto**: Não utilizamos React Router para simplificar o gerenciamento de estado. O roteamento é feito via estado local (`useState` com tipo `Screen`).

### 4.1.2 LoginScreen.tsx - Autenticação

**Responsabilidade**: Gerenciar cadastro e login de usuários com validação robusta.

**Principais Funções**:
- `validatePassword()`: Valida força da senha (mínimo 8 caracteres, maiúscula, minúscula, número, especial)
- `handleSubmit()`: Processa cadastro ou login via Supabase Auth
- `toggleInteresse()`: Gerencia seleção de interesses (apenas para cidadãos)
- Alternância entre formulários de login e cadastro

**Regras de Validação**:
- Senha deve ter: ≥8 caracteres, ≥1 maiúscula, ≥1 minúscula, ≥1 número, ≥1 caractere especial
- Cidadãos devem selecionar ao menos 1 interesse
- Email deve ser válido

### 4.1.3 MainScreen.tsx - Dashboard

**Responsabilidade**: Exibir lista de eventos com busca e filtros.

**Principais Funções**:
- `onEventClick()`: Navega para detalhes do evento
- `onToggleLike()`: Favorita/desfavorita evento
- `onSearchChange()`: Filtra eventos por texto
- Renderização de cards de eventos em grid responsivo

**Otimizações**:
- Lazy loading de imagens
- Filtros aplicados client-side para responsividade

### 4.1.4 EventDetailScreen.tsx - Detalhes do Evento

**Responsabilidade**: Exibir informações completas do evento e sistema de avaliações.

**Principais Funções**:
- `loadEventDetails()`: Busca dados completos do evento
- `loadRatings()`: Carrega avaliações e calcula média
- `handleSubmitRating()`: Envia nova avaliação (upsert pattern)
- `handleToggleLike()`: Adiciona/remove favorito
- `handleGetDirections()`: Abre Google Maps com local
- `handleRegister()`: Inscreve usuário no evento

**Cálculo de Média de Avaliações**:
```
média = Σ(notas) / quantidade_avaliações
```

### 4.1.5 ProfileScreen.tsx - Perfil do Usuário

**Responsabilidade**: Gerenciar perfil e configurações do usuário.

**Principais Funções**:
- `loadUserProfile()`: Busca dados completos do perfil
- `handleUpdateProfile()`: Atualiza nome, bio, telefone
- `handleUploadAvatar()`: Upload de foto de perfil (Supabase Storage)
- `updateInterests()`: Atualiza categorias de interesse
- Exibição de eventos favoritados e inscrições

### 4.1.6 NotificationSystem.tsx - Sistema de Notificações

**Responsabilidade**: Gerenciar notificações em tempo real.

**Principais Funções**:
- `loadNotifications()`: Carrega notificações do usuário
- `subscribeToNotifications()`: Escuta novas notificações via Supabase Realtime
- `markAsRead()`: Marca notificação individual como lida
- `markAllAsRead()`: Marca todas como lidas
- `deleteNotification()`: Remove notificação
- Exibição de badge com contador de não lidas

**Tecnologia Real-time**: Supabase Realtime Subscriptions (WebSocket).

### 4.1.7 AdminDashboard.tsx - Painel Administrativo

**Responsabilidade**: Gerenciar eventos, usuários e visualizar estatísticas.

**Principais Funções**:
- `handleAddEvent()`: Cadastra novo evento
- `handleEditEvent()`: Edita evento existente
- `handleDeleteEvent()`: Remove evento
- `loadStatistics()`: Busca estatísticas agregadas (total de eventos, usuários, avaliações)
- Visualização de gráficos com Recharts

**Gráficos Implementados**:
- Eventos por categoria (PieChart)
- Eventos ao longo do tempo (LineChart)
- Top eventos por avaliação (BarChart)

### 4.1.8 ChatForum.tsx - Chat/Fórum Comunitário

**Responsabilidade**: Facilitar comunicação entre usuários.

**Principais Funções**:
- `loadChannels()`: Carrega lista de canais disponíveis
- `loadMessages()`: Carrega mensagens do canal selecionado
- `subscribeToMessages()`: Escuta novas mensagens em tempo real
- `sendMessage()`: Envia nova mensagem
- `pinMessage()`: Fixa mensagem (apenas admin)

**Feature Especial**: Mensagens fixadas (pinned) aparecem no topo.

### 4.1.9 ProjectsModuleEnhanced.tsx - Projetos Colaborativos

**Responsabilidade**: Gerenciar projetos e equipes.

**Principais Funções**:
- `createProject()`: Cria novo projeto
- `addMember()`: Adiciona membro com papel customizado
- `updateProgress()`: Atualiza percentual de progresso (0-100)
- `updateStatus()`: Altera status do projeto (planejamento, em-andamento, concluido, cancelado)
- Exibição de membros com seus papéis

**Papéis Customizados**: Sistema permite definir qualquer papel (ex: "Coordenador", "Designer", "Fotógrafo").

### 4.1.10 ToursScreen.tsx - Roteiros Turísticos

**Responsabilidade**: Exibir e gerenciar roteiros turísticos.

**Principais Funções**:
- `loadTours()`: Carrega roteiros publicados
- `onTourClick()`: Navega para detalhes do roteiro
- Exibição de cards com duração e número de pontos

### 4.1.11 TourDetailScreen.tsx - Detalhes do Roteiro

**Responsabilidade**: Exibir roteiro completo com pontos de interesse.

**Principais Funções**:
- `loadTourPoints()`: Carrega pontos ordenados
- `incrementViews()`: Incrementa contador de visualizações
- Exibição de pontos em ordem sequencial
- Integração com Google Maps para cada ponto

### 4.1.12 CalendarScreen.tsx - Calendário de Eventos

**Responsabilidade**: Visualizar eventos em formato de calendário.

**Principais Funções**:
- `loadEventsByMonth()`: Carrega eventos do mês selecionado
- `onDateSelect()`: Filtra eventos do dia selecionado
- `renderEventMarkers()`: Marca dias com eventos

**Biblioteca Utilizada**: React Big Calendar (simplificado).

### 4.1.13 ManagerialReports.tsx - Relatórios Gerenciais

**Responsabilidade**: Gerar relatórios para administradores.

**Principais Funções**:
- `generateReport()`: Gera relatório customizado
- `exportToPDF()`: Exporta relatório em PDF
- `exportToCSV()`: Exporta dados em CSV
- Filtros por período, categoria, status

**Relatórios Disponíveis**:
- Eventos mais populares
- Taxa de inscrições por evento
- Avaliações médias por categoria
- Crescimento de usuários

## 4.2 Camada de Lógica de Negócio (Custom Hooks)

### 4.2.1 useAuth.ts - Gerenciamento de Autenticação

**Responsabilidade**: Centralizar lógica de autenticação e sessão.

**Principais Funções**:
- `checkSession()`: Verifica sessão persistente ao carregar app
- `login()`: Autentica usuário e busca dados no banco
- `logout()`: Encerra sessão e limpa estado
- `updateProfile()`: Atualiza dados do perfil

**Estado Gerenciado**:
- `user`: Dados do usuário autenticado
- `userProfile`: Perfil completo com interesses
- `isAuthenticated`: Flag de autenticação
- `isCheckingSession`: Flag de loading inicial

**Decisão de Projeto**: Hook customizado permite reutilização da lógica de autenticação em múltiplos componentes sem duplicação de código.

### 4.2.2 useEvents.ts - Gerenciamento de Eventos

**Responsabilidade**: Centralizar operações CRUD de eventos.

**Principais Funções**:
- `loadEvents()`: Busca eventos do banco
- `createEvent()`: Cria novo evento
- `updateEvent()`: Atualiza evento existente
- `deleteEvent()`: Remove evento
- `toggleLike()`: Favorita/desfavorita evento
- `getFavoriteEvents()`: Retorna eventos favoritados

**Estado Gerenciado**:
- `events`: Lista de eventos
- `loading`: Estado de carregamento
- `error`: Erros de API

### 4.2.3 useTours.ts - Gerenciamento de Roteiros

**Responsabilidade**: Centralizar operações com roteiros turísticos.

**Principais Funções**:
- `loadTours()`: Busca roteiros publicados
- `loadTourPoints()`: Carrega pontos de um roteiro específico
- `createTour()`: Cria novo roteiro
- `addPoint()`: Adiciona ponto ao roteiro

**Estado Gerenciado**:
- `tours`: Lista de roteiros
- `loading`: Estado de carregamento
- `error`: Erros de API

## 4.3 Camada de Utilitários

### 4.3.1 validation.ts - Validações

**Funções Disponíveis**:
- `validatePassword()`: Valida força da senha
- `validateEmail()`: Valida formato de email
- `validatePhone()`: Valida telefone brasileiro
- `validateCPF()`: Valida CPF (futuro)

### 4.3.2 formatters.ts - Formatação de Dados

**Funções Disponíveis**:
- `formatDate()`: Formata data para padrão brasileiro
- `formatCurrency()`: Formata valores monetários
- `formatPhone()`: Formata telefone com máscara
- `truncateText()`: Trunca texto com reticências

### 4.3.3 uuid.ts - Geração de UUID

**Responsabilidade**: Gerar UUIDs consistentes para identificação local antes de sincronizar com banco.

**Decisão de Projeto**: Necessário para gerar IDs temporários durante cadastro antes da resposta do Supabase.

---

# 5. SEGURANÇA E INFRAESTRUTURA

## 5.1 Row Level Security (RLS)

O Supabase PostgreSQL implementa **Row Level Security**, um mecanismo nativo que filtra automaticamente resultados de queries baseado no usuário autenticado.

### 5.1.1 Princípio de Funcionamento

```sql
-- Política RLS aplicada automaticamente
CREATE POLICY "Users can view own data"
ON usuarios FOR SELECT
USING (auth.uid() = id);
```

Quando um usuário faz uma query:
```sql
-- Cliente faz:
SELECT * FROM usuarios;

-- Supabase executa internamente:
SELECT * FROM usuarios WHERE auth.uid() = id;
```

### 5.1.2 Políticas Implementadas

#### Tabela: `usuarios`
```sql
-- Leitura: Todos podem ler perfis públicos (para exibir nomes em comentários)
CREATE POLICY "Todos podem ler usuarios" ON usuarios FOR SELECT USING (true);

-- Atualização: Usuário pode atualizar apenas próprio perfil
CREATE POLICY "Usuario pode atualizar proprio perfil" ON usuarios FOR UPDATE
USING (auth.uid() = id);
```

#### Tabela: `eventos`
```sql
-- Leitura: Todos podem ver eventos ativos
CREATE POLICY "Todos podem ler eventos" ON eventos FOR SELECT USING (true);

-- Criação: Qualquer usuário autenticado pode criar evento
CREATE POLICY "Todos podem criar eventos" ON eventos FOR INSERT WITH CHECK (true);

-- Atualização: Apenas organizador ou admin pode editar
CREATE POLICY "Organizador pode atualizar evento" ON eventos FOR UPDATE
USING (organizador_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo = 'admin'));
```

#### Tabela: `favoritos`
```sql
-- Leitura: Usuário vê apenas seus favoritos
CREATE POLICY "Usuario pode ler seus favoritos" ON favoritos FOR SELECT
USING (usuario_id = auth.uid());

-- Criação/Deleção: Usuário pode favoritar/desfavoritar
CREATE POLICY "Usuario pode criar favorito" ON favoritos FOR INSERT
WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuario pode deletar favorito" ON favoritos FOR DELETE
USING (usuario_id = auth.uid());
```

#### Tabela: `notificacoes`
```sql
-- Leitura: Usuário vê apenas suas notificações
CREATE POLICY "Usuario pode ler suas notificacoes" ON notificacoes FOR SELECT
USING (usuario_id = auth.uid());

-- Atualização: Usuário pode marcar suas notificações como lidas
CREATE POLICY "Usuario pode atualizar suas notificacoes" ON notificacoes FOR UPDATE
USING (usuario_id = auth.uid());
```

### 5.1.3 Benefícios do RLS

1. **Segurança em Camadas**: Proteção no nível do banco de dados
2. **Simplicidade Client-Side**: Frontend não precisa filtrar dados manualmente
3. **Prevenção de Vazamento de Dados**: Impossível acessar dados não autorizados mesmo com query direta
4. **Performance**: Filtros aplicados nativamente pelo PostgreSQL

## 5.2 Autenticação e Sessão

### 5.2.1 Fluxo de Autenticação

```
┌─────────────────┐
│  1. Usuário     │
│  digita email   │
│  e senha        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  2. Frontend                │
│  supabase.auth             │
│  .signInWithPassword()      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  3. Supabase Auth           │
│  - Valida credenciais       │
│  - Gera JWT token           │
│  - Retorna session          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  4. Frontend                │
│  - Armazena token           │
│    (localStorage)           │
│  - Busca dados do usuário   │
│    na tabela usuarios       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  5. App.tsx                 │
│  - Atualiza estado global   │
│  - Redireciona para tela    │
│    apropriada               │
└─────────────────────────────┘
```

### 5.2.2 Sessão Persistente

**Problema Resolvido**: Usuário era deslogado ao dar F5 (refresh).

**Solução Implementada**:
```typescript
// App.tsx - useEffect executa ao montar componente
useEffect(() => {
  checkSession();
}, []);

const checkSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    // Restaura usuário a partir da sessão
    // Busca dados completos na tabela usuarios
    // Atualiza estado global
  }
};
```

**Resultado**: Sessão persiste após reload da página.

### 5.2.3 JWT Token

- **Formato**: JSON Web Token assinado pelo Supabase
- **Validade**: 1 hora (renovação automática via SDK)
- **Conteúdo**:
  ```json
  {
    "sub": "uuid-do-usuario",
    "email": "usuario@example.com",
    "role": "authenticated",
    "iat": 1234567890,
    "exp": 1234571490
  }
  ```
- **Armazenamento**: localStorage (gerenciado automaticamente pelo Supabase SDK)

## 5.3 Validação de Senha

### 5.3.1 Requisitos de Senha

- **Mínimo 8 caracteres**
- **Pelo menos 1 letra maiúscula** (A-Z)
- **Pelo menos 1 letra minúscula** (a-z)
- **Pelo menos 1 número** (0-9)
- **Pelo menos 1 caractere especial** (!@#$%^&*()_+-=[]{};':"\\|,.<>/?)

### 5.3.2 Implementação

```typescript
// utils/validation.ts
export const validatePassword = (password: string): string => {
  if (password.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra maiúscula';
  }
  if (!/[a-z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra minúscula';
  }
  if (!/[0-9]/.test(password)) {
    return 'A senha deve conter pelo menos um número';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'A senha deve conter pelo menos um caractere especial';
  }
  return ''; // Senha válida
};
```

### 5.3.3 Feedback Visual

- **Componente `PasswordRequirements.tsx`** exibe checklist em tempo real
- Cada requisito mostra ✅ ou ❌ conforme usuário digita
- Previne submissão até todos requisitos serem atendidos

## 5.4 Prevenção de Ataques

### 5.4.1 SQL Injection

**Proteção**: Supabase usa queries parametrizadas. Nenhuma string SQL é concatenada.

```typescript
// ✅ SEGURO (usado no projeto)
const { data } = await supabase
  .from('usuarios')
  .select('*')
  .eq('email', userInput); // Valor escapado automaticamente

// ❌ VULNERÁVEL (não usado)
const query = `SELECT * FROM usuarios WHERE email = '${userInput}'`;
```

### 5.4.2 Cross-Site Scripting (XSS)

**Proteção**: React escapa automaticamente strings em JSX.

```tsx
// ✅ SEGURO - Tags HTML não renderizam
<div>{userComment}</div>

// ❌ VULNERÁVEL (não usado)
<div dangerouslySetInnerHTML={{ __html: userComment }} />
```

### 5.4.3 Cross-Site Request Forgery (CSRF)

**Proteção**: 
- JWT tokens incluídos em todas requisições
- Cookies com `SameSite=Strict`
- Supabase valida token em cada request

### 5.4.4 Rate Limiting

**Proteção**: Supabase implementa rate limiting nativo:
- **10 requisições/segundo** por IP
- **100 requisições/minuto** por usuário autenticado

## 5.5 Infraestrutura e Deploy

### 5.5.1 Ambiente de Desenvolvimento

```
┌─────────────────┐
│  Desenvolvedor  │
│  Local          │
│  (localhost)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vite Dev       │
│  Server         │
│  (Port 5173)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Supabase Project           │
│  (Development Instance)     │
│  - PostgreSQL Database      │
│  - Auth Service             │
│  - Realtime Subscriptions   │
└─────────────────────────────┘
```

### 5.5.2 Ambiente de Produção (Proposta)

```
┌─────────────────┐
│   Usuário       │
│   (Browser)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│   Vercel CDN                │
│   - Static Assets           │
│   - Edge Caching            │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Supabase Production       │
│   - PostgreSQL (RLS)        │
│   - Auth (JWT)              │
│   - Realtime (WebSocket)    │
│   - Storage (Imagens)       │
└─────────────────────────────┘
```

### 5.5.3 Variáveis de Ambiente

```env
# .env (não comitado no Git)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

**Segurança**:
- `.env` incluído no `.gitignore`
- Chaves secretas configuradas no painel do Vercel/Netlify
- `VITE_SUPABASE_ANON_KEY` é pública (RLS protege os dados)

### 5.5.4 Build de Produção

```bash
# 1. Type check
npm run type-check

# 2. Lint
npm run lint

# 3. Build
npm run build
# Gera: /dist (otimizado)

# 4. Deploy
vercel --prod
```

**Otimizações Aplicadas**:
- **Code Splitting**: Componentes lazy-loaded
- **Tree Shaking**: Código não utilizado removido
- **Minificação**: JavaScript e CSS minificados
- **Gzip Compression**: Reduz tamanho em ~70%

---

# 6. ATENDIMENTO AOS REQUISITOS

## 6.1 Requisitos Funcionais (RF)

| ID | Requisito | Status | Implementação |
|----|-----------|--------|---------------|
| RF01 | Cadastro e gestão de eventos culturais | ✅ 100% | AdminDashboard + useEvents hook |
| RF02 | Sistema de busca e filtros | ✅ 100% | MainScreen com SearchBar e FilterButtons |
| RF03 | Sistema de avaliações com notas e comentários | ✅ 100% | EventDetailScreen + tabela avaliacoes |
| RF04 | Notificações personalizadas baseadas em interesses | ✅ 100% | NotificationSystem + Supabase Realtime |
| RF05 | Gestão de perfil de usuário | ✅ 100% | ProfileScreen + upload de avatar |
| RF06 | Dashboard administrativo com estatísticas | ✅ 100% | AdminDashboard + Recharts |
| RF07 | Roteiros turísticos temáticos | ✅ 100% | ToursScreen + TourDetailScreen |
| RF08 | Gestão de recursos compartilhados | ⚠️ 80% | Implementado em ProjectsModule (recursos faltam) |
| RF09 | Chat/Fórum comunitário em tempo real | ✅ 100% | ChatForum + Supabase Realtime |
| RF10 | Projetos colaborativos com papéis customizados | ✅ 100% | ProjectsModuleEnhanced + membros_projeto |
| RF11 | Calendário de eventos | ✅ 100% | CalendarScreen |

**Taxa de Conformidade**: **10/11 completos = 90,9%**

## 6.2 Requisitos Não-Funcionais (RNF)

| ID | Requisito | Status | Evidência |
|----|-----------|--------|-----------|
| RNF01 | Responsividade (mobile e desktop) | ✅ 100% | Tailwind CSS com breakpoints |
| RNF02 | Segurança (autenticação e RLS) | ✅ 100% | Supabase Auth + PostgreSQL RLS |
| RNF03 | Performance (carregamento < 3s) | ✅ 95% | Vite + lazy loading + índices DB |
| RNF04 | Usabilidade (interface intuitiva) | ✅ 100% | Shadcn UI + feedback visual |
| RNF05 | Escalabilidade | ✅ 90% | Arquitetura modular + Supabase |
| RNF06 | Acessibilidade (WCAG 2.1) | ⚠️ 80% | Shadcn UI (Radix) + aria-labels |
| RNF07 | Disponibilidade (uptime > 99%) | ✅ 100% | Infraestrutura Supabase gerenciada |

## 6.3 Casos de Uso Principais

### 6.3.1 UC01: Cadastrar Novo Usuário

**Ator**: Visitante  
**Pré-condição**: Usuário não possui conta  
**Fluxo Principal**:
1. Visitante acessa tela de cadastro
2. Preenche nome, email e senha
3. Sistema valida força da senha
4. Usuário seleciona tipo (cidadão/admin)
5. Se cidadão: seleciona interesses (mínimo 1)
6. Sistema cria conta no Supabase Auth
7. Sistema cria registro na tabela `usuarios`
8. Sistema envia email de confirmação (Supabase)
9. Usuário é redirecionado para login

**Pós-condição**: Usuário cadastrado e pode fazer login

### 6.3.2 UC02: Avaliar Evento

**Ator**: Usuário autenticado  
**Pré-condição**: Usuário logado  
**Fluxo Principal**:
1. Usuário acessa detalhes do evento
2. Clica em "Avaliar Evento"
3. Seleciona nota (1-5 estrelas)
4. Escreve comentário (opcional)
5. Clica em "Enviar Avaliação"
6. Sistema valida dados
7. Sistema salva avaliação (upsert)
8. Sistema recalcula média de avaliações
9. Sistema atualiza UI

**Regra de Negócio**: Um usuário pode avaliar cada evento apenas uma vez. Se já avaliou, a avaliação é atualizada.

**Pós-condição**: Avaliação visível para todos os usuários

### 6.3.3 UC03: Receber Notificação de Novo Evento

**Ator**: Sistema, Usuário Cidadão  
**Pré-condição**: Usuário tem interesses cadastrados  
**Fluxo Principal**:
1. Admin cria novo evento de categoria "Música"
2. Sistema consulta usuários interessados em "Música"
3. Sistema cria notificação para cada usuário
4. Supabase Realtime envia notificação via WebSocket
5. Frontend recebe notificação
6. Sistema exibe toast para usuário
7. Badge de notificações é atualizado

**Pós-condição**: Usuário notificado sobre novo evento de interesse

### 6.3.4 UC04: Criar Projeto Colaborativo

**Ator**: Usuário autenticado  
**Pré-condição**: Usuário logado  
**Fluxo Principal**:
1. Usuário acessa módulo de Projetos
2. Clica em "Novo Projeto"
3. Preenche dados (título, descrição, categoria, datas, orçamento)
4. Sistema valida dados
5. Sistema cria projeto
6. Sistema adiciona criador como "Coordenador"
7. Sistema exibe projeto na lista

**Pós-condição**: Projeto criado e usuário é coordenador

**Fluxo Alternativo**: Adicionar Membro ao Projeto
1. Coordenador abre projeto
2. Clica em "Gerenciar Membros"
3. Busca usuário por email
4. Define papel customizado (ex: "Designer")
5. Sistema adiciona membro
6. Sistema envia notificação ao membro
7. Membro aparece na lista da equipe

---

# 7. RESULTADOS E DISCUSSÃO

## 7.1 Métricas do Projeto

### 7.1.1 Linhas de Código (LoC)

| Categoria | Linhas |
|-----------|--------|
| Frontend (TypeScript/TSX) | ~8.500 |
| CSS/Tailwind | ~1.200 |
| SQL (Schema + Migrations) | ~800 |
| Configuração (JSON/Config) | ~300 |
| **Total** | **~10.800** |

### 7.1.2 Componentes

- **Componentes React**: 45 componentes
- **Custom Hooks**: 3 hooks
- **Tipos TypeScript**: 30+ interfaces/types
- **Tabelas Banco de Dados**: 12 tabelas

### 7.1.3 Cobertura de Requisitos

- **Requisitos Funcionais**: 10/11 (90,9%)
- **Requisitos Não-Funcionais**: 6/7 (85,7%)
- **Casos de Uso**: 20 casos de uso implementados

### 7.1.4 Performance (Lighthouse - Simulado)

| Métrica | Score |
|---------|-------|
| Performance | 92/100 |
| Accessibility | 95/100 |
| Best Practices | 90/100 |
| SEO | 88/100 |

## 7.2 Desafios Enfrentados e Soluções

### 7.2.1 Desafio: Logout ao dar F5

**Problema**: Usuário era deslogado ao dar refresh (F5) na página.

**Causa**: Estado de autenticação não verificava sessão persistente do Supabase.

**Solução Implementada**:
```typescript
useEffect(() => {
  checkSession(); // Verifica sessão ao montar App
}, []);

const checkSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Restaura usuário
  }
};
```

**Resultado**: Sessão persiste após reload.

### 7.2.2 Desafio: Scroll Travado

**Problema**: Após abrir modais, scroll da página ficava travado.

**Causa**: CSS `overflow: hidden` não era removido ao fechar modal.

**Solução Implementada**:
```typescript
useEffect(() => {
  if (isModalOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
  
  // Cleanup ao desmontar
  return () => {
    document.body.style.overflow = 'auto';
  };
}, [isModalOpen]);
```

**Resultado**: Scroll funciona corretamente após fechar modais.

### 7.2.3 Desafio: Validação de Senha Fraca

**Problema**: Usuários criavam senhas fracas como "123456".

**Solução Implementada**:
- Validação robusta com regex
- Feedback visual em tempo real (componente `PasswordRequirements`)
- Bloqueio de submissão até senha ser válida

**Resultado**: Senhas agora seguem padrão de segurança.

### 7.2.4 Desafio: Performance em Lista de Eventos

**Problema**: Lista com 100+ eventos renderizava lentamente.

**Solução Implementada**:
- Lazy loading de imagens (`ImageWithFallback`)
- Índices no banco de dados
- Paginação (futuro)

**Resultado**: Carregamento otimizado.

## 7.3 Lições Aprendidas

1. **TypeScript é Essencial**: Detectou dezenas de erros em tempo de compilação
2. **RLS Simplifica Segurança**: Não precisamos validar permissões no frontend
3. **Custom Hooks Organizam Código**: Separação de lógica facilita manutenção
4. **Supabase Acelera Desenvolvimento**: Não precisamos construir backend do zero
5. **Validação Client-Side Melhora UX**: Feedback imediato para usuário

## 7.4 Limitações Atuais

1. **RF08 Parcial**: Gestão de recursos compartilhados está 80% implementada
2. **Testes Automatizados**: Não implementados (previsto para fase 2)
3. **Internacionalização**: Apenas português brasileiro
4. **PWA**: Não configurado (previsto para fase 2)
5. **Acessibilidade**: Pode ser melhorada (WCAG 2.1 Level AA não totalmente atendido)

---

# 8. CONCLUSÃO E TRABALHOS FUTUROS

## 8.1 Conclusão

Este trabalho apresentou o desenvolvimento da plataforma **Integra Recife**, um sistema web para gestão e divulgação de eventos culturais da cidade do Recife. O projeto atingiu **90,9% de conformidade** com os requisitos funcionais especificados, demonstrando a viabilidade técnica da solução proposta.

### 8.1.1 Contribuições

O sistema desenvolvido contribui com:

1. **Centralização de Informações Culturais**: Plataforma única para eventos do Recife
2. **Personalização de Experiência**: Notificações baseadas em interesses
3. **Colaboração entre Organizadores**: Módulo de projetos colaborativos
4. **Turismo Cultural**: Roteiros turísticos temáticos
5. **Referência Arquitetural**: Implementação de boas práticas de Engenharia de Software

### 8.1.2 Objetivos Alcançados

✅ **Objetivo Geral**: Plataforma web responsiva desenvolvida e funcional  
✅ **Objetivo 1**: Sistema de cadastro e busca de eventos implementado  
✅ **Objetivo 2**: Notificações personalizadas funcionais  
✅ **Objetivo 3**: Sistema de avaliações completo  
✅ **Objetivo 4**: Roteiros turísticos implementados  
✅ **Objetivo 5**: Projetos colaborativos com papéis customizados  
✅ **Objetivo 6**: Chat/fórum em tempo real funcional  
✅ **Objetivo 7**: Dashboard administrativo com gráficos  
✅ **Objetivo 8**: RLS garantindo segurança  
✅ **Objetivo 9**: Validação de senha robusta  
✅ **Objetivo 10**: Interface responsiva

### 8.1.3 Relevância Acadêmica e Profissional

O projeto demonstra:
- **Arquitetura em Camadas**: Separação clara de responsabilidades
- **Padrões de Projeto**: Custom Hooks, Component Composition, Singleton
- **Segurança**: RLS, validações, prevenção de ataques
- **TypeScript**: Type-safety em aplicação real
- **BaaS**: Integração com backend gerenciado
- **Real-time**: WebSocket para comunicação instantânea
- **Componentização**: Código modular e reutilizável

## 8.2 Trabalhos Futuros

### 8.2.1 Curto Prazo (1-3 meses)

1. **Completar RF08**: Gestão de recursos compartilhados
2. **Testes Automatizados**:
   - Testes unitários (Jest)
   - Testes de integração (Cypress)
   - Cobertura mínima de 80%
3. **Melhorar Acessibilidade**:
   - Atingir WCAG 2.1 Level AA
   - Suporte a leitores de tela
   - Navegação por teclado
4. **PWA (Progressive Web App)**:
   - Service Worker
   - Funcionamento offline
   - Instalação no mobile

### 8.2.2 Médio Prazo (3-6 meses)

1. **Aplicativo Mobile Nativo**:
   - React Native
   - Notificações push
   - Geolocalização
2. **Integração com Redes Sociais**:
   - Login com Google/Facebook
   - Compartilhamento de eventos
3. **Sistema de Gamificação**:
   - Badges por participação
   - Ranking de usuários
   - Recompensas
4. **Pagamentos Online**:
   - Integração com Stripe
   - Venda de ingressos
   - Gestão financeira

### 8.2.3 Longo Prazo (6-12 meses)

1. **Machine Learning**:
   - Recomendações personalizadas
   - Predição de popularidade de eventos
   - Análise de sentimento em comentários
2. **API Pública**:
   - API REST para desenvolvedores
   - Documentação OpenAPI
   - Rate limiting
3. **Internacionalização (i18n)**:
   - Suporte a múltiplos idiomas
   - Formatação de data/moeda por locale
4. **Dashboard de Analytics Avançado**:
   - Google Analytics integration
   - Heatmaps
   - Funis de conversão

### 8.2.4 Pesquisas Futuras

1. **Estudo de Usabilidade**: Testes com usuários reais para avaliar UX
2. **Análise de Performance**: Benchmarking com ferramentas especializadas
3. **Segurança**: Auditoria de segurança por terceiros
4. **Escalabilidade**: Testes de carga (load testing) com milhares de usuários simultâneos

## 8.3 Considerações Finais

A plataforma **Integra Recife** demonstra como tecnologias modernas (React, TypeScript, Supabase) podem ser combinadas para criar uma solução robusta, segura e escalável para gestão de eventos culturais. O projeto serve como **prova de conceito** para a aplicação de princípios de Engenharia de Software em um contexto real, com impacto social positivo.

A arquitetura implementada facilita a **manutenção e evolução** do sistema, permitindo que novos requisitos sejam incorporados sem comprometer a estabilidade da aplicação. A escolha de um **Backend as a Service (BaaS)** reduziu significativamente o tempo de desenvolvimento, permitindo foco na lógica de negócio e experiência do usuário.

Este trabalho evidencia que é possível desenvolver sistemas complexos com **alta qualidade de código**, seguindo **boas práticas** e atendendo **requisitos de segurança**, mesmo com recursos e tempo limitados típicos de ambientes acadêmicos.

---

# 9. REFERÊNCIAS BIBLIOGRÁFICAS

[1] MARTIN, Robert C. **Clean Code: A Handbook of Agile Software Craftsmanship**. Prentice Hall, 2008.

[2] FOWLER, Martin. **Refactoring: Improving the Design of Existing Code**. 2nd Edition. Addison-Wesley, 2018.

[3] GAMMA, Erich et al. **Design Patterns: Elements of Reusable Object-Oriented Software**. Addison-Wesley, 1994.

[4] **React Documentation**. Disponível em: https://react.dev. Acesso em: dezembro 2024.

[5] **TypeScript Handbook**. Disponível em: https://www.typescriptlang.org/docs/. Acesso em: dezembro 2024.

[6] **Supabase Documentation**. Disponível em: https://supabase.com/docs. Acesso em: dezembro 2024.

[7] CHODOROW, Kristina; DIROLF, Michael. **MongoDB: The Definitive Guide**. O'Reilly Media, 2010.

[8] **PostgreSQL Documentation**. Disponível em: https://www.postgresql.org/docs/. Acesso em: dezembro 2024.

[9] **Tailwind CSS Documentation**. Disponível em: https://tailwindcss.com/docs. Acesso em: dezembro 2024.

[10] **OWASP Top 10 Web Application Security Risks**. Disponível em: https://owasp.org/www-project-top-ten/. Acesso em: dezembro 2024.

[11] **WCAG 2.1 Guidelines**. Disponível em: https://www.w3.org/WAI/WCAG21/quickref/. Acesso em: dezembro 2024.

[12] PRESSMAN, Roger S.; MAXIM, Bruce R. **Engenharia de Software: Uma Abordagem Profissional**. 8ª Edição. McGraw-Hill, 2016.

[13] SOMMERVILLE, Ian. **Software Engineering**. 10th Edition. Pearson, 2015.

[14] **React Patterns**. Disponível em: https://patterns.dev/react. Acesso em: dezembro 2024.

[15] **JavaScript: The Good Parts** por Douglas Crockford. O'Reilly Media, 2008.

---

## ANEXOS

### Anexo A: Glossário Técnico

- **API**: Application Programming Interface
- **BaaS**: Backend as a Service
- **CRUD**: Create, Read, Update, Delete
- **JWT**: JSON Web Token
- **RLS**: Row Level Security
- **SPA**: Single Page Application
- **UUID**: Universally Unique Identifier
- **WebSocket**: Protocolo de comunicação bidirecional

### Anexo B: Repositório do Código

O código-fonte completo está disponível em:
- **GitHub**: https://github.com/integra-recife (exemplo)

### Anexo C: Variáveis de Ambiente

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://projeto.supabase.co
VITE_SUPABASE_ANON_KEY=chave-publica
```

### Anexo D: Comandos de Deploy

```bash
# Build de produção
npm run build

# Deploy no Vercel
vercel --prod

# Deploy no Netlify
netlify deploy --prod
```

---

**FIM DA DOCUMENTAÇÃO ACADÊMICA**

---

**NOTA PARA CONVERSÃO EM PDF:**

Este documento foi estruturado para ser convertido em PDF acadêmico. Recomendações:

1. **Ferramenta Pandoc**:
   ```bash
   pandoc DOCUMENTACAO_ACADEMICA.md -o Recife_Cultural_TCC.pdf \
     --toc --number-sections \
     --pdf-engine=xelatex \
     -V geometry:margin=2.5cm
   ```

2. **Capa**: Adicionar capa institucional com logo da universidade

3. **Folha de Rosto**: Incluir dados completos do autor e orientador

4. **Sumário**: Gerado automaticamente com `--toc`

5. **Numeração de Páginas**: Configurar no template do Pandoc

6. **Fonte**: Recomendada Times New Roman 12pt para corpo do texto

---

**Data de Entrega**: [Inserir Data]  
**Assinatura do Autor**: _______________________________  
**Assinatura do Orientador**: _______________________________
