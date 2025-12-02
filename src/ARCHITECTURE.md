# 🏗️ Arquitetura do Sistema - Integra Recife

## Visão Geral

A aplicação Integra Recife segue uma arquitetura em camadas com separação clara de responsabilidades, utilizando princípios de Clean Code e padrões modernos de desenvolvimento React.

---

## 📐 Padrões Arquiteturais

### 1. Component-Based Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│   (React Components + UI Logic)     │
├─────────────────────────────────────┤
│          Business Logic             │
│    (Custom Hooks + Utilities)       │
├─────────────────────────────────────┤
│           Data Layer                │
│   (Supabase Client + API Calls)     │
└─────────────────────────────────────┘
```

### 2. Separação de Responsabilidades

#### **Components** (`/components`)
- **Responsabilidade**: Renderização de UI e interações do usuário
- **Não deve**: Conter lógica de negócio ou chamadas diretas ao banco
- **Deve**: Receber dados via props e delegar ações via callbacks

#### **Custom Hooks** (`/hooks`)
- **Responsabilidade**: Lógica de negócio e gerenciamento de estado
- **Benefícios**: 
  - Reutilização de lógica
  - Testabilidade
  - Separação de concerns

#### **Utils** (`/utils`)
- **Responsabilidade**: Funções puras e helpers
- **Exemplos**: Formatação, validação, transformação de dados

#### **Types** (`/types`)
- **Responsabilidade**: Contratos de dados TypeScript
- **Benefício**: Type-safety em toda aplicação

---

## 🔄 Fluxo de Dados

### Padrão de Dados Unidirecional

```
┌──────────┐
│   User   │
│  Action  │
└────┬─────┘
     │
     ▼
┌──────────────┐
│  Component   │ ──► Chama hook
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Custom Hook  │ ──► Faz chamada Supabase
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Supabase   │ ──► Retorna dados
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    State     │ ──► Atualiza UI
│   Update     │
└──────────────┘
```

### Exemplo Prático

```typescript
// 1. Componente chama hook
const EventsScreen = () => {
  const { events, loading, loadEvents } = useEvents();
  
  // 2. Hook gerencia estado e lógica
  useEffect(() => {
    loadEvents(); // 3. Busca dados do Supabase
  }, []);
  
  // 4. Renderiza baseado no estado
  if (loading) return <LoadingSpinner />;
  return <EventList events={events} />;
};
```

---

## 🗄️ Modelo de Dados

### Estrutura do Banco de Dados (Supabase/PostgreSQL)

```sql
usuarios
├── id (UUID, PK)
├── email (VARCHAR)
├── nome (VARCHAR)
├── tipo (ENUM: admin, cidadao)
├── avatar (TEXT)
├── interesses (TEXT[])
└── criado_em (TIMESTAMP)

eventos
├── id (SERIAL, PK)
├── titulo (VARCHAR)
├── descricao (TEXT)
├── data_inicio (TIMESTAMP)
├── localizacao (VARCHAR)
├── categoria (VARCHAR)
├── imagem (TEXT)
└── criado_por (UUID, FK -> usuarios)

avaliacoes
├── id (UUID, PK)
├── evento_id (INT, FK -> eventos)
├── usuario_id (UUID, FK -> usuarios)
├── nota (INT)
├── comentario (TEXT)
└── criado_em (TIMESTAMP)

roteiros_turisticos
├── id (SERIAL, PK)
├── titulo (VARCHAR)
├── descricao (TEXT)
├── duracao_estimada (VARCHAR)
└── criado_por (UUID, FK -> usuarios)

projetos
├── id (UUID, PK)
├── nome (VARCHAR)
├── descricao (TEXT)
├── status (ENUM)
└── criado_por (UUID, FK -> usuarios)

notificacoes
├── id (UUID, PK)
├── usuario_id (UUID, FK -> usuarios)
├── tipo (ENUM)
├── titulo (VARCHAR)
├── mensagem (TEXT)
├── lida (BOOLEAN)
└── criado_em (TIMESTAMP)
```

---

## 🔐 Segurança e Autenticação

### Row Level Security (RLS)

Todas as tabelas utilizam RLS do Supabase:

```sql
-- Exemplo: Usuários só podem ver seus próprios dados
CREATE POLICY "Users can view own data"
ON usuarios
FOR SELECT
USING (auth.uid() = id);

-- Admins podem ver todos os eventos
CREATE POLICY "Admins can view all events"
ON eventos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.tipo = 'admin'
  )
);
```

### Fluxo de Autenticação

```
1. Login Request
   ↓
2. Supabase Auth (JWT Token)
   ↓
3. Store Token (localStorage)
   ↓
4. Include Token in Requests
   ↓
5. RLS Validates Access
```

---

## 🎨 Camada de Apresentação

### Hierarquia de Componentes

```
App.tsx (Root)
│
├── LoginScreen
│   └── LoginForm
│       ├── PasswordRequirements
│       └── InterestSelector
│
├── MainScreen (Dashboard)
│   ├── EventCard[]
│   ├── SearchBar
│   └── FilterButtons
│
├── EventDetailScreen
│   ├── EventHeader
│   ├── EventInfo
│   ├── RatingSection
│   └── ShareDialog
│
├── ProfileScreen
│   ├── ProfileHeader
│   ├── FavoriteEvents
│   └── ProfileSettings
│
└── NotificationSystem
    ├── NotificationBell
    └── NotificationPanel
        └── NotificationItem[]
```

---

## 🔌 Integração com Supabase

### Cliente Supabase Singleton

```typescript
// /utils/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Padrão de Chamadas

```typescript
// Custom Hook Pattern
export const useEvents = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eventos')
        .select('*');
      
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, loadEvents };
};
```

---

## 🎯 Performance

### Otimizações Implementadas

1. **Code Splitting**
   - Lazy loading de componentes pesados
   - Dynamic imports para rotas

2. **Memoization**
   - `useMemo` para cálculos pesados
   - `useCallback` para funções em props

3. **Virtualização**
   - Listas grandes renderizam apenas itens visíveis

4. **Caching**
   - Supabase faz cache automático
   - React Query para cache client-side (futuro)

5. **Imagens Otimizadas**
   - Lazy loading com `ImageWithFallback`
   - Unsplash com parâmetros de otimização

---

## 🧪 Testabilidade

### Estrutura para Testes

```typescript
// Component Test
describe('EventCard', () => {
  it('should render event details', () => {
    const event = mockEvent();
    render(<EventCard event={event} />);
    expect(screen.getByText(event.title)).toBeInTheDocument();
  });
});

// Hook Test
describe('useEvents', () => {
  it('should load events from database', async () => {
    const { result } = renderHook(() => useEvents());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.events.length).toBeGreaterThan(0);
    });
  });
});
```

---

## 📦 Build e Deploy

### Pipeline de Build

```
1. Type Check (tsc)
   ↓
2. Lint (ESLint)
   ↓
3. Build (Vite)
   ↓
4. Optimize Assets
   ↓
5. Generate Bundle
```

### Estratégia de Deploy

- **Continuous Deployment**: Push to main → Auto deploy
- **Preview Deploys**: Pull requests geram preview URLs
- **Environment Variables**: Gerenciadas no Vercel/Netlify

---

## 🔮 Escalabilidade

### Preparado para Crescimento

1. **Modular Architecture**: Fácil adicionar novas features
2. **TypeScript**: Refatoração segura em escala
3. **Component Library**: Componentes reutilizáveis
4. **API First**: Backend desacoplado via Supabase
5. **CDN Ready**: Assets estáticos otimizados

### Futuras Melhorias

- [ ] State Management Global (Zustand/Redux)
- [ ] React Query para cache avançado
- [ ] Micro-frontends para features isoladas
- [ ] Server-Side Rendering (Next.js)
- [ ] GraphQL para queries complexas

---

## 📚 Referências

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)

---

**Última atualização**: Dezembro 2024
