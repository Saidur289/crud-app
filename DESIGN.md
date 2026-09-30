---
name: Flow Tasks
description: Clean, focused, and tactile native task management
colors:
  primary: "#6366F1"
  primary-light: "#818CF8"
  primary-dark: "#4F46E5"
  primary-surface: "#EEF2FF"
  primary-surface-dark: "#1E1B4B"
  success: "#10B981"
  success-surface: "#ECFDF5"
  danger: "#EF4444"
  danger-surface: "#FEF2F2"
  surface-light: "#FFFFFF"
  surface-dark: "#1E293B"
  bg-light: "#F8FAFC"
  bg-dark: "#0F172A"
  border-light: "#E2E8F0"
  border-dark: "#334155"
  text-primary-light: "#0F172A"
  text-primary-dark: "#F8FAFC"
  text-muted-light: "#64748B"
  text-muted-dark: "#94A3B8"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
---

# Design System

## Overview

Flow Tasks is an Operate-mode native task interface. The design prioritizes visual clarity, instant scanability, and tactile feedback. Every interaction is immediate, controls are self-explanatory, and visual noise is rigorously eliminated in favor of clean spacing and purposeful typography.

## Colors

The palette uses an Indigo / Slate foundation with intentional functional accents:
- **Primary Accent (`#6366F1` / `#818CF8`):** Identifies active filters, primary calls-to-action, and focused fields.
- **Success (`#10B981`):** Applied exclusively to completed task status and completion badges.
- **Danger (`#EF4444`):** Restricted to destructive actions (e.g., delete task, clear completed).
- **Surfaces (`#FFFFFF` in light, `#1E293B` in dark):** High-contrast cards with subtle, tinted borders (`#E2E8F0` / `#334155`).
- **Text:** High-contrast slate titles (`#0F172A` / `#F8FAFC`) paired with readable muted secondary metadata (`#64748B` / `#94A3B8`).

## Typography

- **Header / Brand:** 28px bold, tight tracking (-0.02em), commanding presence without decorative styling.
- **Page Headings:** 20px–22px semi-bold for screens and modals.
- **Body & Task Titles:** 16px medium (`fontWeight: '500'`), line height 22px for effortless reading. Completed tasks use subdued muted text with a delicate strikethrough.
- **Captions & Badges:** 12px–13px semi-bold (`fontWeight: '600'`), letter-spaced for metadata badges and counts.

## Layout

- **Container:** Generous safe-area margins (20px gutters) creating comfortable breathing room across phones and tablets.
- **Visual Rhythm:** 12px gap between list cards; 16px–20px spacing between major functional groups (Header → Progress → Search/Add → Filters → List).
- **Touch Targets:** All interactive pressables have minimum 44×44px hit areas with subtle scale or opacity feedback on press.

## Elevation & Depth

- **Cards:** Layered with soft diffuse shadow (`shadowOffset: { width: 0, height: 2 }`, `shadowOpacity: 0.06`, `shadowRadius: 8`, `elevation: 2`) over flat borders.
- **Borders:** Refined 1px solid hairline borders instead of harsh contrast cuts.
- **Floating Modals / Toasts:** Elevated pill with deep shadow (`shadowOpacity: 0.15`, `shadowRadius: 12`, `elevation: 6`).

## Shapes

- **Task Cards:** 12px border radius (`rounded.md`) for a friendly, modern feel.
- **Buttons & Inputs:** 10px–12px radius matching card geometry.
- **Pills & Badges:** Full pill radius (9999px) for status indicators, counts, and theme toggles.

## Components

- **Task Item:** Dedicated circular checkbox on the left with instant toggle; title in center; subtle icon action buttons (edit pencil, delete trash) on the right.
- **Progress Card:** Sleek, integrated card displaying completed task counter, percentage badge, and smooth progress track.
- **Search & Add Inputs:** Integrated clear icon on search; enter-key submission on add.
- **Filter Pills:** Segmented pill bar with embedded item count badges (`All 20`, `Pending 12`, `Completed 8`).
- **Empty States:** Context-aware empty state illustrations with clear guidance and reset action.

## Do's and Don'ts

### Do's
- Use genuine vector icons from `@expo/vector-icons` with consistent stroke weight.
- Trigger light haptic feedback on task completion, addition, and deletion.
- Handle empty search results, empty filter states, and zero-task states with dedicated UI.
- Maintain WCAG AA contrast ratio (>= 4.5:1 for body copy).

### Don'ts
- Do NOT use colored left-border stripes (`borderLeftWidth: 5`) on cards or list items.
- Do NOT use raw emojis as UI icons or button labels.
- Do NOT use gradient text or arbitrary zero-offset colored glow shadows.
- Do NOT delete tasks without user awareness; provide instant visual toast feedback.
