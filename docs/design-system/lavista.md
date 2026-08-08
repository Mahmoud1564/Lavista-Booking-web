# Lavista Design System

**Status:** Extracted and ready for approval  
**Scope:** Public Lavista booking website  
**Source of truth:** `src/styles.css`, `src/components/lavista/`, and the
shared primitives in `src/components/ui/`

This document captures the existing visual language. It is an extraction, not
a redesign. No screen implementation is changed by this document.

## Brand expression

Lavista feels like a warm, modern stay near the pyramids: quiet after dark,
sun-baked during the day, tactile rather than glossy, and hospitable without
being overly formal.

The interface relies on:

- A dark ink foundation that lets photography and gold accents carry focus.
- Editorial serif headlines paired with highly legible sans-serif UI text.
- Soft gold for action, wayfinding, and small moments of warmth.
- Large rounded surfaces and thin translucent borders.
- Restrained motion: gentle reveals, smooth carousel transitions, and deliberate
  hover states.

## Foundations

### Color

Use the semantic names below rather than inventing one-off colors. All source
values are preserved in `lavista.tokens.json` and in `src/styles.css`.

| Token | Value | Role |
| --- | --- | --- |
| `background` | `oklch(0.14 0.012 60)` | Main page background |
| `foreground` | `oklch(0.96 0.018 80)` | Default light text |
| `card` | `oklch(0.18 0.014 60)` | Elevated content surfaces |
| `popover` | `oklch(0.16 0.014 60)` | Floating menus and dialogs |
| `primary` | `oklch(0.82 0.11 78)` | Primary action fill |
| `primary-foreground` | `oklch(0.14 0.012 60)` | Text on primary actions |
| `secondary` | `oklch(0.22 0.018 60)` | Secondary surface |
| `muted-foreground` | `oklch(0.72 0.03 75)` | Supporting and metadata text |
| `sand` | `oklch(0.78 0.06 75)` | Warm subdued text |
| `sand-soft` | `oklch(0.88 0.04 80)` | Headings and primary light text |
| `gold` | `oklch(0.82 0.13 80)` | Accent, links, icons, focus |
| `gold-soft` | `oklch(0.9 0.08 82)` | Hovered primary action |
| `ink` | `oklch(0.1 0.01 60)` | Deep overlay and image-backed contrast |
| `border` | `oklch(1 0 0 / 10%)` | Default translucent border |
| `destructive` | `oklch(0.6 0.22 25)` | Errors and destructive actions |

Common compositional treatments:

- Subtle border: `border-gold/10` or `border-gold/15`.
- Interactive border: `border-gold/30`, becoming `border-gold` on hover.
- Primary action: `bg-gold text-ink`, hovering to `bg-gold-soft`.
- Image overlays: `bg-ink/50` through `bg-ink/80` with
  `backdrop-blur-md` when text sits over photography.
- Glass surface: use the existing `glass` utility. It combines a translucent
  ink surface, blur, saturation, and a gold-tinted border.

Do not introduce bright white page backgrounds, cool blue-gray neutrals, or
unrelated accent hues into Lavista surfaces.

### Typography

| Role | Family | Existing treatment |
| --- | --- | --- |
| Display/headline | Fraunces, Georgia, serif | `font-display`, tight letter spacing |
| UI/body | Inter, system-ui, sans-serif | `font-sans`, readable line height |

Guidance:

- `h1`–`h4` use the display face and `letter-spacing: -0.02em`.
- Page and section titles use `text-3xl` through `text-5xl`, scaling at `md`.
- Eyebrows and labels use small uppercase text with wide tracking, commonly
  `text-xs uppercase tracking-[0.3em] text-gold`.
- Supporting copy uses `text-sm` or `text-base` with muted or sand-soft
  colors.
- Preserve editorial contrast: large Fraunces headlines against compact Inter
  metadata.

### Shape and spacing

- Base radius: `0.625rem`.
- Small controls: `rounded-md` to `rounded-xl`.
- Cards and feature surfaces: `rounded-2xl` to `rounded-3xl`.
- Pills, tags, and primary CTAs: `rounded-full`.
- Use generous section rhythm (`py-20`, `py-28`) and compact internal rhythm
  (`gap-2` through `gap-6`) rather than dense borders.
- Page content generally uses `mx-auto max-w-7xl px-6`.

## Component language

### Navigation

- Desktop navigation is centered and understated: small sand-soft text,
  generous horizontal gaps, gold on hover.
- The brand wordmark uses Fraunces and sits at the leading edge.
- “Manage booking” is a compact uppercase gold pill with a translucent gold
  border.
- Fixed or overlay navigation uses the ink backdrop and `backdrop-blur-md`.
- Navigation must remain usable over imagery and preserve strong contrast.

### Buttons and links

Primary:

```tsx
className="inline-flex items-center justify-center gap-2 whitespace-nowrap
  rounded-full bg-gold px-6 py-4 text-sm font-medium text-ink
  transition hover:bg-gold-soft"
```

Secondary:

```tsx
className="inline-flex items-center justify-center gap-2 whitespace-nowrap
  rounded-full border border-gold/30 px-6 py-4 text-sm font-medium
  text-sand-soft transition hover:bg-gold/10"
```

Rules:

- Keep action labels on one line with `whitespace-nowrap`.
- Use icons as supporting affordances, not as replacements for labels.
- Preserve a visible focus ring using the existing `ring` token.
- Disabled actions reduce opacity and remove pointer interaction; do not
  recolor them into unrelated gray.

### Cards

The default Lavista card is a dark, quiet surface:

```tsx
className="rounded-3xl border border-gold/10 bg-card p-6
  transition hover:border-gold/30"
```

Cards should:

- Have a clear internal hierarchy.
- Use `min-w-0` where text sits beside icons or images.
- Let photography carry visual weight with `object-cover`.
- Use gold sparingly for prices, tags, metadata labels, and actions.

### Forms, popovers, and calendars

- Use card/popover surfaces instead of white panels.
- Keep fields full width on small screens and stack them before `md`.
- Labels are compact uppercase gold or sand-soft text.
- Calendar and guest controls use gold for the selected state and muted
  translucent borders for inactive states.
- Touch targets should be at least 44px where practical.

### Carousels

- Use the shared Embla carousel primitives in
  `src/components/ui/carousel.tsx`.
- Navigation buttons are circular, bordered, and use the shared arrow icon
  treatment.
- Preserve `aria-label`, disabled state, and keyboard arrow navigation.
- Image galleries use rounded overflow containers and keep controls readable
  over `bg-ink` overlays.

### Reviews and avatars

- Reviewer identity is compact: avatar, name, origin, then rating.
- Avatar images are circular and use the same border treatment as other
  circular media.
- A missing reviewer image must reuse the existing project placeholder asset,
  never a newly invented icon or visual.
- Review cards use a dark translucent card and generous quote spacing.

## Responsive behavior

| Breakpoint | Intent |
| --- | --- |
| Base / `<640px` | Single-column flow, stacked actions, compact type, horizontal overflow only for intentional carousels |
| `sm` / `640px` | Begin two-up content where cards remain comfortable; allow inline metadata |
| `md` / `768px` | Desktop navigation and multi-column layouts become available |
| `lg` / `1024px` | Full editorial compositions, wider gaps, and two-column detail pages |

Mobile rules:

- Keep page content away from viewport edges with horizontal padding.
- Stack competing actions rather than letting labels wrap.
- Use `min-w-0`, `break-words`, and `overflow-hidden` intentionally to prevent
  accidental horizontal scrolling.
- Keep images responsive with aspect-ratio containers and `object-cover`.
- Preserve bottom safe-area space for fixed mobile controls.
- Never sacrifice readable type or tap target size to preserve a desktop row.

## Motion and interaction

- Standard transitions use roughly `300ms`; reveal transitions use roughly
  `500ms`.
- Hover states should change color, border, opacity, or a small translation,
  not introduce a large scale jump.
- Use Framer Motion for section reveals already established in the site.
- The review marquee uses a linear infinite loop and pauses during interaction.
- Respect `prefers-reduced-motion`; motion should be removable without losing
  information or access.

## Imagery

- Photography is cinematic, warm, and place-led.
- Favor wide editorial crops and rounded overflow containers.
- Use `loading="lazy"` for below-the-fold images.
- Always provide meaningful alt text for content images. Decorative duplicates
  should use empty alt text or be hidden from assistive technology.
- Do not add gradients, shadows, or filters to identity placeholders unless
  they already exist in the extracted component pattern.

## Accessibility baseline

- Maintain semantic headings and landmarks.
- Every icon-only control needs an accessible label.
- Keep keyboard navigation for carousels, dialogs, and menus.
- Use `aria-current` for active navigation where appropriate.
- Ensure text remains readable against ink, card, and image-backed surfaces.
- Keep touch targets around 44px or larger.
- Preserve `prefers-reduced-motion` behavior.

## Implementation map

| Pattern | Existing source |
| --- | --- |
| Theme tokens and base typography | `src/styles.css` |
| Shared button variants | `src/components/ui/button.tsx` |
| Shared carousel and arrow controls | `src/components/ui/carousel.tsx` |
| Booking bar and popovers | `src/components/lavista/BookingBar.tsx` |
| Room cards and section composition | `src/components/lavista/Rooms.tsx` |
| Experience cards and gallery composition | `src/components/lavista/Experiences.tsx`, `src/routes/experiences.$slug.tsx` |
| Review cards and marquee | `src/components/lavista/Testimonials.tsx` |
| Global navigation | `src/components/lavista/Navbar.tsx` |
| Footer/contact surface | `src/components/lavista/Footer.tsx` |

## Approval boundary

This design system is extracted and documented, but it has not been applied as
a new restyling pass. Before changing any existing screen, ask the user whether
they want this Lavista system applied.