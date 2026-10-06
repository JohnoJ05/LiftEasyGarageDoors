---
name: Lift Easy Garage Doors
description: A no-nonsense, one-man garage door repair trade site in bold black and site-yellow
colors:
  site-yellow: "#FFD400"
  site-yellow-hover: "#ffe14d"
  garage-black: "#111111"
  paper: "#f3f2f2"
  white: "#ffffff"
  muted: "#6b6560"
  soft: "#d8d6d4"
  grey: "#a8a4a0"
  line-dark: "#333333"
  line-light: "#c9c6c3"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.625rem, 6.2vw, 5.75rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.4vw, 1.75rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 800
    lineHeight: 1.5
    letterSpacing: "0.12em"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1.5rem, 4vw, 3.5rem)"
  stack: "clamp(2.25rem, 4vw, 3rem)"
  section-y: "clamp(4rem, 8vw, 7rem)"
  section-y-sm: "clamp(2.5rem, 6vw, 4.5rem)"
  tap: "44px"
components:
  button-primary:
    backgroundColor: "{colors.site-yellow}"
    textColor: "{colors.garage-black}"
    rounded: "{rounded.none}"
    padding: "16px 22px"
  button-primary-hover:
    backgroundColor: "{colors.site-yellow-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "16px 22px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.garage-black}"
    rounded: "{rounded.none}"
    padding: "clamp(24px, 3vw, 36px)"
  card-dark:
    backgroundColor: "{colors.garage-black}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "clamp(24px, 3vw, 36px)"
---

# Design System: Lift Easy Garage Doors

## Overview

**Creative North Star: "The Site Van Nameplate"**

This is the visual language of stencilled signage on the side of a work van, not a software product. Every surface reads as bold, load-bearing, and built to be understood at a glance from across a driveway: heavy uppercase Archivo type, hard black rules, and a single hazard-bright yellow that appears only where it means "look here" — a call button, a tick mark, a fact worth noticing. Nothing about the system is decorative; every line, border, and block of color is doing a structural job.

The system is deliberately flat and edged, never soft. There are no rounded corners anywhere in the implementation and no shadows — depth and separation come from hard 2px borders, dark-background "grid dividers" (thin gaps between white/yellow cells that read as mortar lines), and strong color blocking between ink-black and paper-white sections. The layout alternates full-bleed black bands (hero, fast-response, footer) with lighter paper/white bands (services, about, area), giving the page a stamped, sign-panel rhythm rather than a continuous scroll.

Mobile is treated as the primary reading device, not a shrunk desktop: the base CSS is phone-first, a fixed yellow call bar anchors the bottom of the screen below 768px, and a dedicated `max-width:767px` block actively removes repeated content (duplicate call-to-actions, restated facts, decorative badges) rather than just shrinking type — the phone experience is edited down, not just resized.

**Key Characteristics:**
- Hazard-bright single accent color used sparingly and always with intent (calls, checkmarks, key facts)
- Zero border-radius anywhere; every edge is a hard 90° corner
- No shadows; separation comes from 2px borders and thin dark "grid line" gaps between grouped cells
- Heavy uppercase Archivo (weight 800) for all display type; tight, negative letter-spacing on large headings
- Full-bleed alternating ink-black and paper/white section bands
- Fluid type and spacing throughout via `clamp()`, not fixed breakpoint jumps
- Phone view is content-edited (things removed), not just visually compressed

## Colors

A near-monochrome black-and-white system pierced by exactly one accent. The accent's scarcity is what gives it force.

### Primary
- **Site Yellow** (`#FFD400`): The single accent. Reserved for calls-to-action (phone buttons, call bars), checkmarks/ticks, key stat badges, active nav/link states, and focus rings. Never used as a large background except in the dedicated CTA and trust-strip bands, where it becomes the section's whole identity for a few seconds of scroll.
- **Site Yellow Hover** (`#ffe14d`): Hover state for yellow buttons only.

### Neutral
- **Garage Black** (`#111111`): The dominant color — body text, header, footer, and every "dark band" section background. Functions as both ink and structural background, not just a text color.
- **Paper** (`#f3f2f2`): The page's base background and the "light band" section color (services, about).
- **White** (`#ffffff`): Card and form surfaces sitting on top of Paper; pure white is reserved for content containers, never used as a section background on its own.
- **Muted** (`#6b6560`): Secondary text — eyebrows, captions — on light backgrounds.
- **Soft** (`#d8d6d4`): Secondary text on dark backgrounds (bylines, ledes inside the hero).
- **Grey** (`#a8a4a0`): Tertiary/placeholder text — breadcrumbs, footer labels.
- **Line Dark** (`#333333`) / **Line Light** (`#c9c6c3`): Hairline dividers and grid gaps, on dark and light backgrounds respectively.

### Named Rules
**The One Accent Rule.** Site Yellow is the only saturated color in the system. If a second bright color is ever needed, that's a sign the hierarchy is unclear, not a sign to add a color.

**Sanctioned exception: Banner Red** (`#e3141b`, `--banner-red`). Used once only, on the homepage desktop hero's "Fast response / Same-day repairs" brush stamp, kept at the client's request to match Steve's printed banner. Don't reuse it anywhere else.

## Typography

**Display/Body Font:** Archivo (with system-ui, sans-serif fallback)

**Character:** A single grotesque doing all the work — geometric, high-contrast between its default (body) and 800 (display) weights, and always set in true uppercase for headings and labels rather than `text-transform` as an afterthought. There is no serif or secondary display face; hierarchy comes entirely from size, weight, and case.

### Hierarchy
- **Display** (800, `clamp(2.625rem, 6.2vw, 5.75rem)`, line-height 0.92): The h1 on the homepage hero. Uppercase, tight tracking (-0.035em), with the emphasis phrase set in Site Yellow.
- **Headline** (800, `clamp(1.875rem, 5vw, 3.75rem)`, line-height 0.98): Section h2s (`.h2-xl`). Uppercase, -0.03em tracking.
- **Title** (800, `clamp(1.5rem, 2.4vw, 1.75rem)`, line-height 1.05): Card and tile h3s. Sentence case, not uppercase — this is the one hierarchy level that reads as a heading rather than a shout.
- **Body** (400, 1.125rem, line-height 1.5–1.6): Paragraph copy, capped at 46–58ch max-width for readability.
- **Label** (800, 0.8125rem, letter-spacing 0.12em, uppercase): Eyebrows, chips, button text, form labels. The small-but-loud workhorse of the system.

### Named Rules
**The Shout-or-Speak Rule.** Display, headline, label, and button text are always uppercase and heavy (weight 800) — they shout. Body copy and card/tile titles are sentence case and lighter — they speak. Nothing sits ambiguously between the two registers.

## Layout

Mobile-first: base rules are the phone layout, with five content-driven `min-width` breakpoints layered on top (360px, 480px, 768px, 1024px, 1200px) rather than a fixed device grid. A single `--container` (1400px) and one fluid `--gutter` (`clamp(1.5rem, 4vw, 3.5rem)`) govern every section's width and side padding.

Section rhythm alternates full-bleed background bands (`--section-y`: `clamp(4rem, 8vw, 7rem)` vertical padding) between ink-black and paper/white, so scrolling reads as moving through distinct panels rather than one continuous page. Grids that draw dividers with a dark background and 2px gaps (cards, logos, trust strip, steps, tiles) always use explicit column counts so rows fill evenly with no orphaned dark cells.

Below 768px, the layout is not simply narrowed — content is actively pruned (see Overview). A fixed bottom call bar owns the thumb-zone on phones and tablets, and the in-page header call button hides accordingly since it would duplicate that action.

## Elevation & Depth

Flat by design — there are no shadows anywhere in the system. Depth and grouping are conveyed structurally instead: hard 2px borders around cards/forms/grids, 2px "grid line" gaps (rendered as a dark background peeking through a grid gap) between grouped cells, and section-level color contrast (ink vs. paper vs. white) to separate one band from the next. The only "lift" effect anywhere is a background-color shift on hover for interactive cards and links.

### Named Rules
**The No-Shadow Rule.** Depth is never simulated with `box-shadow`. If something needs to feel separated or grouped, it gets a hard border or a background-color change — never a soft edge.

## Shapes

Every corner in the system is 0px. No `border-radius` is used anywhere, on buttons, cards, inputs, images, or badges. Borders are always solid and either 1px (hairline dividers), 2px (structural borders, focus rings, tick separators), or 4–6px (a small set of emphasis accents: the hero photo's yellow underline, the contact form's yellow top border). Corners are always square; the visual vocabulary is entirely rectilinear panels and thin rules, echoing the "stencilled signage" north star.

### Named Rules
**The Square Corner Rule.** `border-radius: 0` everywhere, without exception. A rounded corner would read as software chrome, not signage.

## Components

### Buttons
- **Shape:** Square corners (0px), 2px borders where outlined.
- **Primary** (`.btn-yellow` / `.call-big` / `.cta__call`): Site Yellow background, Garage Black text, bold uppercase label line plus a larger phone-number line, generous padding (16–26px), minimum 64–72px tall — sized to be an unmissable tap target for a "call me now" action, not a standard button.
- **Outline** (`.btn-outline`): Transparent background, 2px border in the current context's foreground color (white on dark, black on light), fills solid on hover.
- **Text link** (`.more-link`): No button chrome at all — bold uppercase label with a 2px Site Yellow underline offset below the text, arrow icon trailing.
- **Hover / Focus:** Buttons darken/lighten their fill on hover; every interactive element gets a 3px solid Site Yellow `outline` on `:focus-visible`, offset 2px — the same accent color used for "look here" throughout the system also marks keyboard focus.

### Cards / Containers
- **Corner Style:** Square (0px) always.
- **Background:** White on paper sections; one "dark" card variant (`.card--dark`) inverts to Garage Black with Site Yellow accents, used to make the first/primary offering in a set visually lead the others.
- **Shadow Strategy:** None — see Elevation & Depth. Grouped cards sit in a CSS grid with a 2px dark gap between them, giving the appearance of a mortared panel wall.
- **Border:** 2px solid Garage Black around the whole card grid; individual cards are separated by the grid gap rather than their own borders.
- **Internal Padding:** `clamp(24px, 3vw, 36px)`, tightened to 22px flat on phones.

### Inputs / Fields
- **Style:** 2px solid Garage Black border, square corners, white background, minimum 48px tall.
- **Focus:** 3px solid Site Yellow outline, no offset (sits flush against the input's own border).
- **Labels:** Bold, small, uppercase-weight-800 label sitting directly above the field (not floating/inline).

### Navigation
- **Style:** Sticky ink-black header with a 2px Site Yellow bottom border. Below 1200px it collapses to a hamburger menu that drops down as a full-width dark panel; at 1200px+ it becomes an inline row of links.
- **States:** Nav links are white by default, Site Yellow on hover and for the current page (`aria-current="page"`).
- **Mobile treatment:** The in-header phone button is hidden below 768px in favor of the fixed bottom call bar; the hamburger's open panel uses full-height rows with hairline dividers for large, unambiguous tap targets.

### Trust / Fact Strips (signature component)
A recurring "grid of stamped facts" pattern (`.trust`, `.problems`, `.stats`, `.area__tags`): short bold facts laid out in a CSS grid with 2px dark gaps between cells, each cell a solid color block (yellow, black, or white depending on section). This is the system's signature way of presenting credibility/scope information as discrete, scannable panels rather than prose or icons-with-captions.

## Do's and Don'ts

### Do:
- **Do** keep Site Yellow rare — it should mark "the thing to act on," never a general accent for decoration.
- **Do** use square corners (0px radius) on every new element; a rounded corner is off-brand by construction.
- **Do** convey grouping and separation with hard borders and 2px grid gaps, not shadows.
- **Do** set headings, labels, and buttons in true uppercase with weight 800 and negative letter-spacing at large sizes.
- **Do** treat the phone layout as an edited version of the page (removing duplicate content), not just a shrunk one — follow the pattern already established in the `max-width:767px` block in `css/site.css`.
- **Do** size any primary call-to-action (especially phone actions) as an oversized, unmissable tap target — this is a trade site where the phone call is the entire conversion goal.

### Don't:
- **Don't** add `border-radius` anywhere, including on images, badges, or form controls.
- **Don't** add `box-shadow` for depth or hover "lift" — use a background-color or border change instead.
- **Don't** introduce a second saturated accent color alongside Site Yellow.
- **Don't** set body copy or card/tile titles in uppercase — that register is reserved for display type, labels, and buttons.
- **Don't** let phone-width sections just shrink desktop content; actively decide what to cut, per the existing mobile block's own rule ("everything removed here is still shown elsewhere on the page").
