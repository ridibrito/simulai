# Design Guidelines: Brazilian Exam Preparation Platform

## Design Approach

**Selected Approach:** Design System (Utility-Focused)  
**Primary References:** Linear (clean dashboards), Notion (content hierarchy), Modern SaaS patterns  
**Rationale:** Educational platform prioritizing clarity, data comprehension, and focused study environment over visual flair

## Core Design Principles

1. **Clarity First:** Information-dense without overwhelming - use progressive disclosure
2. **Study-Optimized:** Minimal distractions, readable typography, comfortable spacing
3. **Data Transparency:** Charts and statistics must be instantly comprehensible
4. **Trust & Professionalism:** Brazilian competitive exam students need credibility signals

## Typography System

**Font Families:**
- Primary: Inter (headings, UI elements, data labels)
- Secondary: system-ui fallback for body text and questions

**Hierarchy:**
- Hero/Page Titles: text-4xl md:text-5xl font-bold
- Section Headers: text-2xl md:text-3xl font-semibold
- Card Titles: text-lg font-semibold
- Body Text: text-base leading-relaxed
- Small Text/Labels: text-sm text-gray-600
- Data/Stats: text-3xl md:text-4xl font-bold (for numbers)

## Layout System

**Spacing Primitives:** Use Tailwind units of 3, 4, 6, 8, 12, 16
- Tight spacing: p-3, gap-3 (cards, compact lists)
- Standard spacing: p-6, gap-6 (sections, forms)
- Generous spacing: p-8, p-12 (page containers, feature sections)

**Grid Structure:**
- Dashboard: 12-column grid for flexible widget placement
- Content max-width: max-w-7xl for main container
- Sidebar: Fixed 256px (w-64) on desktop, collapsible on mobile
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## Component Library

### Navigation
**Top Header:**
- Fixed header with logo, main navigation, user profile dropdown
- Height: h-16, with shadow and subtle border-bottom
- Include notification bell icon and quick access to "Novo Simulado"

**Sidebar (Dashboard Area):**
- Fixed left sidebar with icon + label navigation
- Sections: Dashboard, Simulados, Estatísticas, Materiais, Perfil, Assinatura
- Active state: subtle background with left border accent
- Collapsible on tablet/mobile with hamburger menu

### Dashboard Components

**Stat Cards:**
- Grid of 3-4 cards showing key metrics (Simulados Realizados, Taxa de Acertos, Tempo de Estudo, Ranking)
- Each card: rounded-xl border with p-6
- Large number display with small label underneath
- Optional icon in top-right corner

**Progress Charts:**
- Line chart for performance over time (use recharts or similar)
- Bar chart for subject breakdown
- Donut chart for question type distribution
- Cards containing charts: p-6 with descriptive headers

**Recent Activity Feed:**
- List of recent mock exams with date, score, subject
- Each item: subtle hover state, clickable to view details
- Include small badge for pass/fail status

### Mock Exam Interface

**Question Display:**
- Clean, distraction-free layout with question number navigation sidebar
- Large, readable question text (text-lg leading-relaxed)
- Answer options with radio buttons or letter-labeled cards (A, B, C, D, E)
- Bottom action bar: Previous, Flag, Next buttons with progress indicator

**Timer & Progress:**
- Sticky top bar showing remaining time and question progress (15/50)
- Visual progress bar showing completion percentage

### Forms & Inputs

**Standard Inputs:**
- Height: h-12, rounded-lg with border
- Focus state: ring-2 with subtle shadow
- Labels: text-sm font-medium mb-2
- Helper text: text-xs text-gray-500

**File Upload (PDF):**
- Drag-and-drop zone with dashed border
- Icon + "Arraste seu PDF aqui ou clique para selecionar"
- Show uploaded file with preview thumbnail and remove option

**Buttons:**
- Primary CTA: px-6 py-3 rounded-lg font-semibold
- Secondary: outlined variant with same padding
- Icon buttons: w-10 h-10 rounded-lg for actions

### Content Cards

**Study Material Cards:**
- Thumbnail preview (if available) or icon placeholder
- Title, upload date, file type badge
- Action buttons: Gerar Resumo, Ver Detalhes, Excluir

**Mock Exam Cards:**
- Subject label as badge
- Title with date created
- Stats preview: questões, tempo estimado
- Call-to-action: "Iniciar Simulado" button

### Profile & Settings

**Profile Section:**
- Avatar upload area (circular, large)
- Form fields in 2-column grid on desktop
- Sections: Dados Pessoais, Área de Estudo, Meta de Aprovação

**Subscription/Pricing:**
- Feature comparison table with 3 tiers
- Highlight recommended plan
- Clear "Assinar" buttons with Stripe integration

## Page-Specific Layouts

### Landing Page (Marketing)
- **Hero:** Full-width section with headline "Prepare-se para Concursos com Inteligência Artificial", subheadline, dual CTA (Começar Grátis + Ver Demo), hero image showing dashboard preview
- **Features:** 3-column grid showcasing: Simulados Personalizados, IA Adaptativa, Correção Inteligente
- **How It Works:** 4-step process with icons
- **Pricing:** 3-tier comparison table
- **Social Proof:** Testimonials from approved students with photos
- **CTA Section:** Final conversion push with trial offer

### Dashboard (Logged In)
- Sidebar + main content area
- Top row: 4 stat cards
- Second row: 2-column (Performance Chart + Subject Breakdown)
- Third row: Recent Simulados list + AI Suggestions panel

### Mock Exam Creation
- Step-by-step wizard: (1) Upload Material → (2) Configure → (3) Generate
- Progress indicator at top
- Large upload zone on step 1
- Configuration form with subject selection, question count, difficulty on step 2

## Icons
**Library:** Heroicons (outline for navigation, solid for emphasis)  
**Usage:** All navigation items, stat cards, feature highlights, form inputs

## Images

**Hero Section:** 
- Large dashboard preview screenshot showing charts and interface
- Positioned on right side of hero, with text on left
- Modern, clean mockup style (slight perspective, subtle shadow)

**Feature Sections:**
- Screenshot previews of key features (exam interface, AI feedback, dashboard)
- Use actual UI screenshots with slight blur on sensitive data

**Testimonials:**
- Circular student photos (real or stock photos of Brazilian students)

**Empty States:**
- Friendly illustrations for no simulados yet, no materials uploaded

## Animations
**Minimal approach - use sparingly:**
- Smooth page transitions (fade-in)
- Chart data animation on load (staggered)
- Button hover scale (scale-105)
- No scroll-triggered animations
- Loading states: simple spinners, no complex animations