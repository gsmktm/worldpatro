---
name: worldpatro-interface
description: Build or audit WorldPatro's Nepal-first, accessible and truthfully gated UI. Use for navigation, calendar cards, modules, state labeling, and responsive Next.js interfaces.
license: MIT
---

# WorldPatro interface, accessibility & production truth

Use this after the root AGENTS.md and Ponytail Full mode. This is an original WorldPatro-specific checklist informed by the linked **source references**, not an installed UI framework.

## Before implementation
1. Verify the actual route in `src/lib/navigation.ts`, data method and API, and human-facing source and access boundaries.
2. Classify a feature: working local interface, source-reviewed records, configured but unverified backend, admin-only, or planned. Never represent a logo, an icon or a rendered route as a working calculation.
3. Use `src/app/styles/observatory.css` tokens and `src/components/ui/icon.tsx` instead of new fonts, duplicated SVG packages or large CSS frameworks.

## Nepal-first visual language
- Own identity: ॐ, Himalayan observatory, gold on navy, legible Nepali Devanagari, calm spacing. Preserve independent cultural representation without copying third-party religious art.
- Bilingual labels, real date and timezone context, correctly sourced BS/AD correspondences. Astronomy is not religious authority; traditional Muhurat is not a scientifically certified prediction.
- Maintain a distinct hover, active, keyboard-focus, pending, empty, error, and gated state. A disabled action needs a reason and next safe action.
- Responsive grid at 320px upward; do not force horizontal scrolling at 400% zoom. Use readable sizes, scalable layout, and adequate space for Nepali glyphs.
- Form inputs have labels, SVG decoration is hidden from assistive technology, controls have discernible names and keyboard focus. Target 44×44 CSS pixels on touch navigation, at least 24×24 when space is constrained. Verify actual contrast.

## Source-of-truth and verification
- Route inventory is derived from `NAV_ITEMS`; detailed functions are enriched from `FEATURE_MAP`. Don't maintain another hand-counted 23-versus-32 list.
- `/api/v1/platform/modules` conveys *gates*, not proof of database connectivity. Use live status views for operational proof and keep missing/pending labels explicit.
- Before claiming done: test every advertised route, verify code typechecks and builds, smoke test API and negative auth paths, then inspect the Vercel preview including mobile behavior.
- No production merge or schema mutation as part of a visual redesign unless explicitly approved.

## Reviewed engineering references
- [Matt Pocock: Skills for Real Engineers](https://github.com/mattpocock/skills) — feedback loops before broad edits
- [ECC: Accessibility](https://github.com/affaan-m/ECC/tree/main/skills/accessibility) — names, roles, keyboard, contrast, states
- [obra: Verification Before Completion](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion) — fresh evidence before completion claims
- [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) and [Frontend UI Engineering](https://github.com/addyosmani/agent-skills) — reference patterns for accessible responsive design; their external scripts and dependencies are **not installed**.
