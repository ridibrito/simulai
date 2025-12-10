# Simulai - Sistema de Simulados com IA

Plataforma de estudos com simulados personalizados, correção inteligente e recomendações com IA.

## 🚀 Stack Tecnológica

- **Framework**: Next.js 16 (App Router)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: Supabase PostgreSQL
- **IA**: Google Gemini API
- **Pagamentos**: Stripe (opcional)
- **UI**: shadcn/ui + Tailwind CSS
- **Gerenciamento de Estado**: TanStack Query

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase
- Conta Google Cloud (para Gemini API)
- Conta Stripe (opcional, apenas para pagamentos)

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Vá para SQL Editor e execute o arquivo `supabase_schema.sql`
3. Copie as credenciais do projeto

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon

# Gemini AI
GEMINI_API_KEY=sua-chave-gemini

# Stripe (Opcional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Executar Schema SQL

No Supabase SQL Editor, execute todo o conteúdo do arquivo `supabase_schema.sql`. Isso irá:

- Criar todas as tabelas necessárias
- Configurar Row Level Security (RLS)
- Criar triggers e functions
- Configurar indexes

### 5. Iniciar Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
simulai/
├── src/
│   ├── app/                    # App Router (páginas e API routes)
│   │   ├── (dashboard)/        # Rotas protegidas
│   │   ├── api/                # API endpoints
│   │   └── auth/               # Páginas de autenticação
│   ├── components/             # Componentes React
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Hooks customizados
│   ├── lib/                    # Utilitários
│   │   ├── supabase/           # Clientes Supabase
│   │   ├── gemini.ts           # Integração Gemini AI
│   │   └── stripe.ts           # Integração Stripe
│   └── types/                  # TypeScript types
├── public/                     # Arquivos estáticos
├── supabase_schema.sql         # Schema do banco de dados
└── .env.local                  # Variáveis de ambiente
```

## 🔐 Autenticação

O projeto usa Supabase Auth com:
- Email/Password
- OAuth providers (configurável)
- Row Level Security (RLS) habilitado

## 🗄️ Banco de Dados

### Tabelas Principais

- `users` - Perfis de usuários
- `subjects` - Disciplinas/Assuntos
- `questions` - Questões
- `materials` - Materiais de estudo
- `exams` - Simulados
- `exam_attempts` - Tentativas de simulado
- `question_answers` - Respostas às questões
- `user_performance` - Desempenho do usuário
- `ai_recommendations` - Recomendações da IA

## 🤖 Funcionalidades com IA

O Gemini AI é usado para:
- Gerar questões personalizadas
- Avaliar respostas discursivas
- Criar recomendações de estudo
- Resumir materiais automaticamente

## 💳 Integração Stripe (Opcional)

Para habilitar pagamentos:

1. Configure suas chaves no `.env.local`
2. Atualize os planos em `src/lib/stripe.ts`
3. Configure webhooks no dashboard Stripe

## 🚢 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

```bash
vercel
```

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar produção
npm run lint         # Linter
```

## 🔒 Segurança

- Row Level Security (RLS) em todas as tabelas
- Autenticação via Supabase Auth
- Middleware de proteção de rotas
- Validação de dados com Zod

## 🐛 Troubleshooting

### Erro: "Database connection failed"

Verifique se:
- As credenciais do Supabase estão corretas
- O projeto Supabase está ativo
- O schema SQL foi executado

### Erro: "Supabase client not configured"

Configure as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📄 Licença

Este projeto é proprietário.

## 🤝 Contribuindo

Para contribuir com o projeto, entre em contato com a equipe de desenvolvimento.
