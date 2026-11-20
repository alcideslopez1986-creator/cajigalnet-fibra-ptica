# Design Brief

## Direction

Cajigalnet — "Nodo de Fibra": a deep-navy mobile app whose surfaces read as polished optical glass, lit from above by electric blue.

## Tone

Premium technical instrumentation — tactile, luminous, confident; a fiber-optic network console you can hold in one hand.

## Differentiation

Every card is a physical object: gradient-relief surfaces with a lit top edge and soft cast shadow, pressing inward on touch; the splash emblem is a floating 3D fiber node with a pulsing light ring.

## Color Palette

| Token      | OKLCH             | Role                                     |
| ---------- | ----------------- | ---------------------------------------- |
| background | 0.165 0.045 265   | deep navy canvas (dark is primary mode)  |
| foreground | 0.972 0.008 255   | clean white text, AA+ on canvas          |
| card       | 0.222 0.05 265    | raised relief surfaces                   |
| primary    | 0.605 0.208 259   | electric blue CTAs and active states     |
| accent     | 0.735 0.152 253   | luminous sky-blue highlights, links      |
| success    | 0.735 0.168 158   | emerald "Activo" status                  |
| warning    | 0.825 0.132 82    | soft amber "Por vencer / Cortado"        |
| destructive| 0.605 0.196 22    | suspended / failed payments              |
| muted      | 0.268 0.038 264   | inert chips, secondary rows              |

## Typography

- Display: Space Grotesk — wordmark, screen titles, KPI numerals, tight tracking
- Body: Figtree — labels, paragraphs, table rows, buttons
- Mono: Geist Mono — invoice numbers, BCV rate, amounts
- Scale: hero `text-4xl font-bold tracking-tight`, h2 `text-xl font-semibold`, label `text-[11px] font-semibold uppercase tracking-[0.14em]`, body `text-[15px] leading-relaxed`

## Elevation & Depth

Three tiers: flat canvas → `shadow-relief` cards (gradient + inset top highlight) → `shadow-elevated` modals; primary buttons carry `shadow-primary-lift`.

## Structural Zones

| Zone    | Background          | Border              | Notes                                            |
| ------- | ------------------- | ------------------- | ------------------------------------------------ |
| Header  | `bg-card` + border-b | `border-border`    | sticky, backdrop-blur, wordmark left, avatar right |
| Content | `bg-background`     | —                   | alternating `bg-muted/30` bands; `bg-gradient-glow` on hero |
| Nav     | floating `bg-card/95` pill | `border-border` | fixed bottom, 4 tabs, active = primary pill + label |
| Footer  | `bg-muted/40`       | `border-t`          | legal / versión, only where content scrolls past nav |

## Spacing & Rhythm

Mobile-first: 16px page gutters, 20px card padding, 12px gaps in stacks, 32px between sections; 4/8px micro-grid.

## Component Patterns

- Buttons: full-width `rounded-2xl` pills, `bg-gradient-primary text-primary-foreground shadow-primary-lift`, `press-tactile`; secondary = outlined `border-border bg-card`
- Cards: `rounded-[22px] surface-relief`, 1px `border-border/60`, icon chip top-left in tinted `bg-primary/12`
- Badges: `rounded-full px-3 py-1 text-[11px] font-semibold` — success/12, warning/15, destructive/15 tints with matching text
- Status dots: 6px ring with 2px inner glow, emerald pulse when active

## Motion

- Entrance: `animate-fade-up` staggered 60ms per card; view changes use `animate-slide-in-view`
- Hover/press: `press-tactile` scale 0.985 + shadow drop, 160ms
- Decorative: `animate-node-float` on emblem, `animate-pulse-ring` halo, `animate-sheen` sweep on primary CTA

## Constraints

- Tokens only — no hex/rgb or arbitrary color classes in components
- Spanish (Venezuela) copy; amounts shown in USD with Bs. at BCV rate
- Touch targets ≥ 44px; body text ≥ 15px; contrast AA+ on every surface
- Never reference the design preview image in app code

## Signature Detail

Layered-relief "glass panel" cards with a lit top edge that physically depress on touch — material depth as the app's identity.
