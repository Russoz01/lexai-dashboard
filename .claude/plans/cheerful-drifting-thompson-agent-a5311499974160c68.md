# LexAI Dashboard Improvement Plan

## Priority Order & Estimated Effort

| # | Task | File(s) | Impact | Effort |
|---|------|---------|--------|--------|
| 1 | Fix API key missing | `.env.local` | Critical (blocking) | 1 min |
| 2 | Light mode contrast fixes | `globals.css` | High | 20 min |
| 3 | Login page two-column redesign | `login/page.tsx` | High | 45 min |
| 4 | Dashboard animations and glassmorphism | `globals.css` + `dashboard/page.tsx` | Medium | 30 min |
| 5 | Header polish | `Header.tsx` | Low | 10 min |

---

## Step 1: Fix ANTHROPIC_API_KEY (`.env.local`)

**Problem**: The file has `GEMINI_API_KEY` but no `ANTHROPIC_API_KEY`. All three API routes (`/api/resumir`, `/api/pesquisar`, `/api/redigir`) read `process.env.ANTHROPIC_API_KEY` and return 503 when it is missing.

**Action**: Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env.local`. The user must supply their own key.

**No code changes needed** -- the routes already handle the missing key gracefully with a 503 response.

---

## Step 2: Light Mode Contrast Fixes (`globals.css`)

All changes below use `[data-theme="light"]` selectors or modify the `:root` variables. Dark mode is not touched.

### 2A. Update light theme CSS variables (lines 12-47)

| Variable | Current | New | Reason |
|----------|---------|-----|--------|
| `--border` | `#e5e2dc` | `#d1cdc4` | Visible card borders |
| `--shadow` | `rgba(0,0,0,0.06)` | `rgba(0,0,0,0.08)` | Stronger card shadows |
| `--shadow-md` | `rgba(0,0,0,0.12)` | `rgba(0,0,0,0.15)` | Stronger hover shadows |
| `--text-muted` | `#8e95a2` | `#6b7280` | WCAG 4.5:1 contrast |
| `--text-secondary` | `#58667a` | `#4b5563` | Better readability |
| `--input-bg` | `#fafaf9` | `#f3f2ef` | Distinct from card-bg |

### 2B. Add light-mode card shadows (new rule block, after line 379)

```css
[data-theme="light"] .section-card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
}
[data-theme="light"] .stat-card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
[data-theme="light"] .stat-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
}
```

### 2C. Brighten stat-card icons in light mode

Add after the existing dark-mode icon overrides (after line 352):
```css
[data-theme="light"] .stat-card-icon.docs     { background: #e0e7ff; color: #4338ca; }
[data-theme="light"] .stat-card-icon.agents    { background: #ede9fe; color: #6d28d9; }
[data-theme="light"] .stat-card-icon.deadline  { background: #fef3c7; color: #b45309; }
[data-theme="light"] .stat-card-icon.finance   { background: rgba(201,168,76,0.12); color: #92700c; }
```

### 2D. Form input light mode border fix

Add after existing `.form-input:focus` block (after line 519):
```css
[data-theme="light"] .form-input {
  border-color: #c5c0b6;
}
[data-theme="light"] .form-input:focus {
  border-color: #b8960e;
  box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
}
```

### 2E. Action card and header light mode shadows

```css
[data-theme="light"] .action-card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
[data-theme="light"] .action-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
}
[data-theme="light"] .top-header {
  box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04);
}
```

---

## Step 3: Login Page Two-Column Redesign (`login/page.tsx`)

### Layout Structure

```
+-------------------------------+-------------------------------+
|  LEFT PANEL (form)            |  RIGHT PANEL (showcase)       |
|  - LexAI logo + tagline       |  - Gradient bg navy-to-deep   |
|  - Google OAuth button         |  - 3 glassmorphic stat cards  |
|  - divider                     |  - 4 feature bullet points    |
|  - email/password form         |  - Testimonial quote          |
|  - terms footer                |  - "Powered by Claude" badge  |
+-------------------------------+-------------------------------+
```

### Left panel
- Keep ALL existing form code, move it into a flex child
- Background: keep `#0b1220` (login is always dark)
- Width: `50%` desktop, `100%` mobile
- Padding: `60px 48px`
- Vertically center content with `display: flex; flexDirection: column; justifyContent: center`

### Right panel
- Background: `linear-gradient(160deg, #0f1923 0%, #162133 50%, #0f2027 100%)`
- Overlay: `radial-gradient(circle at 30% 70%, rgba(201,168,76,0.06) 0%, transparent 60%)`
- Width: `50%` desktop, `display: none` on mobile
- Padding: `60px 48px`
- Content positioned with flex column, `justifyContent: center`

### Right panel content details

**Stats row** (3 glassmorphic cards in a horizontal flex):
- Card 1: value `+2500`, label `Documentos Analisados`
- Card 2: value `4`, label `Agentes IA Ativos`  
- Card 3: value `99.7%`, label `Disponibilidade`
- Each card CSS:
  - `background: rgba(255,255,255,0.04)`
  - `backdrop-filter: blur(12px)`
  - `border: 1px solid rgba(255,255,255,0.08)`
  - `border-radius: 16px; padding: 20px`
  - Value: `font-size: 28px; font-weight: 700; color: #c9a84c`
  - Label: `font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 4px`

**Feature list** (below stats, `margin-top: 40px`):
- 4 items, each with an icon circle and text
- Icon circle: `width: 32px; height: 32px; border-radius: 8px; background: rgba(201,168,76,0.10); color: #c9a84c; font-size: 14px`
- Text: `font-size: 14px; color: rgba(255,255,255,0.6)`
- Items:
  1. `bi-file-earmark-check` "Analise contratos e documentos com IA"
  2. `bi-search` "Pesquise jurisprudencia em segundos"
  3. `bi-pencil-square` "Gere pecas processuais completas"
  4. `bi-calendar-check` "Controle prazos e financeiro"

**Testimonial** (below features, `margin-top: 40px`):
- Container: `border-left: 3px solid rgba(201,168,76,0.35); padding-left: 16px`
- Quote: `font-style: italic; font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.6`
- Author: `font-size: 12px; color: rgba(255,255,255,0.25); margin-top: 8px`

**Powered by Claude** (at very bottom of right panel):
- `font-size: 11px; color: rgba(255,255,255,0.2)`
- Position at bottom via `margin-top: auto`

### Responsive media query

Add to the existing `<style>` block:
```css
@media (max-width: 768px) {
  .lx-right-panel { display: none !important; }
  .lx-left-panel  { width: 100% !important; min-width: 100% !important; }
}
```

### Implementation note
The outer container changes from `display: flex; alignItems: center; justifyContent: center` to `display: flex; minHeight: 100vh` (side by side). The decorative glow div stays but is repositioned to the left panel area.

---

## Step 4: Dashboard Animations and Glassmorphism

### 4A. Keyframe animations in `globals.css` (after line 674)

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.animate-fadeInUp { animation: fadeInUp 0.45s ease-out both; }
.animate-fadeIn   { animation: fadeIn 0.4s ease-out both; }
.delay-1 { animation-delay: 0.05s; }
.delay-2 { animation-delay: 0.10s; }
.delay-3 { animation-delay: 0.15s; }
.delay-4 { animation-delay: 0.20s; }
.delay-5 { animation-delay: 0.25s; }
.delay-6 { animation-delay: 0.30s; }
```

### 4B. Glassmorphism on dark-mode stat cards

```css
[data-theme="dark"] .stat-card {
  background: rgba(22,29,46,0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06);
}
```

### 4C. Pulsing urgent deadline bar

```css
@keyframes urgentPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
.deadline-bar.critical {
  animation: urgentPulse 2s ease-in-out infinite;
}
```

### 4D. Section card hover accent

```css
.section-card:hover {
  border-color: rgba(201,168,76,0.15);
}
```

### 4E. Apply animation classes in `dashboard/page.tsx`

Modify existing elements to add CSS classes:

1. Welcome div (line 73): `<div className="animate-fadeIn">`
2. Each stat-card Link (lines 80, 91, 101, 111): add `animate-fadeInUp delay-1` through `delay-4`
   - Example: `<Link href="/dashboard/resumidor" className="stat-card animate-fadeInUp delay-1">`
3. Content grid div (line 124): `<div className="content-grid animate-fadeIn delay-3">`
4. Quick actions div (line 221): `<div className="quick-actions animate-fadeIn delay-5">`

### 4F. Better empty state for deadlines (line 174)

Replace the current empty state div with:
```jsx
<div style={{
  padding: '32px 20px', textAlign: 'center',
  color: 'var(--text-muted)', fontSize: '14px',
  border: '1px dashed var(--border)', borderRadius: '12px',
  margin: '8px',
}}>
  <i className="bi bi-clock" style={{ fontSize: '32px', display: 'block', marginBottom: '10px', opacity: 0.5 }} />
  Nenhum prazo cadastrado
  <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)', opacity: 0.7 }}>
    Adicione prazos para monitoramento automatico
  </div>
</div>
```

### 4G. "Powered by Claude" badge at bottom of dashboard

Add after the quick-actions closing div (after line 243), before the page-content closing div:
```jsx
<div style={{
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '6px', marginTop: '32px', paddingBottom: '16px',
  fontSize: '12px', color: 'var(--text-muted)', opacity: 0.6,
}}>
  <i className="bi bi-cpu" style={{ fontSize: '13px' }} />
  Powered by Claude · Anthropic
</div>
```

---

## Step 5: Header Minor Polish (`Header.tsx`)

### 5A. Add notification bell before theme toggle

Insert a notification bell button before the existing theme toggle button (before line 35):
```jsx
<button className="header-theme-toggle" style={{ position: 'relative' }} title="Notificacoes">
  <i className="bi bi-bell" />
  <span style={{
    position: 'absolute', top: '-2px', right: '-2px',
    width: '8px', height: '8px', borderRadius: '50%',
    background: 'var(--danger)', border: '2px solid var(--card-bg)',
  }} />
</button>
```

### 5B. Avatar hover effect in `globals.css`

```css
.header-avatar {
  transition: border-color 0.15s ease;
}
.header-avatar:hover {
  border-color: var(--accent);
}
```

---

## Constraints Respected

- Gold/navy brand identity preserved throughout
- Dark mode untouched (all light fixes use `[data-theme="light"]` selectors)
- No new npm dependencies added
- Inline style patterns maintained in TSX files
- Existing functionality preserved without restructuring
- Login page remains dark-themed always (brand consistent)
- Sidebar stays dark in both themes (already the case)
