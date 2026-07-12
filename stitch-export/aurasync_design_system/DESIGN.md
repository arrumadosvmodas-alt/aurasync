---
name: AuraSync Design System
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#ccc3d4'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#958e9e'
  outline-variant: '#4a4452'
  surface-tint: '#d3bbff'
  primary: '#d3bbff'
  on-primary: '#3f0689'
  primary-container: '#4c1d95'
  on-primary-container: '#b994ff'
  inverse-primary: '#6f46b9'
  secondary: '#ffca45'
  on-secondary: '#3f2e00'
  secondary-container: '#e4ae00'
  on-secondary-container: '#5b4400'
  tertiary: '#89ceff'
  on-tertiary: '#00344d'
  tertiary-container: '#00415f'
  on-tertiary-container: '#2eb1f6'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ebdcff'
  primary-fixed-dim: '#d3bbff'
  on-primary-fixed: '#260059'
  on-primary-fixed-variant: '#572ba0'
  secondary-fixed: '#ffdf9a'
  secondary-fixed-dim: '#f7be1d'
  on-secondary-fixed: '#251a00'
  on-secondary-fixed-variant: '#5a4300'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system for AuraSync is built upon the concept of "Digital Sanctuary." It balances high-performance utility with a meditative, spiritual atmosphere. The target audience seeks a professional yet deeply calming environment for introspection, spiritual growth, and relaxation.

The visual style is a fusion of **Modern Corporate** and **Glassmorphism**. It utilizes semi-transparent surfaces and soft background blurs to create a sense of ethereal depth. Every interaction should feel intentional and serene, avoiding jarring transitions or aggressive prompts. The emotional response is one of grounded tranquility—where professional-grade tools meet the vastness of the inner self.

## Colors
The palette is centered on a deep, obsidian-like dark mode to reduce eye strain and promote relaxation.

*   **Primary (Deep Violet):** `#4c1d95`. Represents the subconscious and spiritual depth. Used for key brand moments and primary actions.
*   **Secondary (Soft Gold):** `#eab308`. Evokes enlightenment and warmth. Used sparingly for highlights, icons, and subtle "Aha!" moments.
*   **Tertiary (Professional Blue):** `#0ea5e9`. Maintains the "vibrant professionalism" roots, providing clarity and trust in data-heavy views.
*   **Background (Neutral):** `#0f172a`. A rich navy-black that serves as the foundation for the glassmorphic layers.

Interaction states should use low-intensity glows rather than high-contrast color shifts. Hovering over an element should feel like it is gently "waking up."

## Typography
This design system exclusively uses **Plus Jakarta Sans** to maintain a modern, approachable, and geometric clarity. 

The type scale is generous with line height to ensure maximum readability and a feeling of "breath" between lines of text. Headlines use a slightly tighter letter spacing for a professional look, while labels and small captions use increased tracking to ensure legibility against dark, translucent backgrounds. Editorial content should favor `body-lg` to create a more immersive, premium reading experience.

## Layout & Spacing
The layout follows a **fluid grid** model with significant horizontal margins to center the user's focus. 

*   **Desktop:** 12-column grid with 64px outer margins. Content is often contained within a 10-column central span to prevent eye fatigue.
*   **Mobile:** 4-column grid with 16px margins.
*   **Spacing Rhythm:** Based on an 8px root. Use `lg` and `xl` spacing liberally between sections to create "white space" (even in dark mode) that allows the design to breathe.

Layouts should prioritize vertical stacking for a natural scrolling "flow" that mirrors the rhythm of a guided meditation.

## Elevation & Depth
Depth is created through **Glassmorphism** and **Tonal Layering**. Instead of traditional black shadows, this design system uses:

1.  **Backdrop Blurs:** Surfaces use a 12px - 20px Gaussian blur on the background layer with a high-transparency fill (e.g., `rgba(255, 255, 255, 0.05)`).
2.  **Inner Glows:** A subtle 1px top border or "rim light" in a faint violet or gold helps define the edges of cards.
3.  **Soft Violet Shadows:** Elevation is suggested by extremely soft, low-opacity shadows tinted with the primary violet color (`#4c1d95`) rather than pure black, creating a "lifting" effect from the dark background.

## Shapes
The shape language is organic and inviting. We use the **Rounded** (0.5rem) setting as a baseline to avoid sharp, aggressive corners that contradict the brand's focus on relaxation. 

Interactive elements like buttons and chips should lean towards `rounded-xl` or full pill-shapes to feel "pebble-like" and tactile. Large containers and cards use `rounded-lg` (1rem) to maintain structure without appearing rigid.

## Components
Consistent styling across components reinforces the serene atmosphere:

*   **Buttons:** Primary buttons use a subtle gradient from Deep Violet to a slightly lighter purple. "Soft Gold" is reserved for high-priority floating action buttons. All buttons utilize a 200ms ease-in-out transition on hover.
*   **Cards:** Use the glassmorphic style with a very thin (0.5px) stroke in a light violet. Content inside should have generous padding (`md` or `lg`).
*   **Inputs:** Fields are dark with a subtle bottom border. Upon focus, the border transitions to Soft Gold with a faint outer glow (bloom effect).
*   **Chips/Tags:** Fully rounded (pill-shaped) with low-opacity backgrounds. They should look like soft indicators rather than heavy UI elements.
*   **Lists:** Items are separated by generous vertical space rather than hard lines. Use subtle chevrons in Soft Gold to indicate navigation.
*   **Specialty Component - "Breath Indicator":** A slow-pulsing circular element used during loading or transition states to encourage the user to sync their breathing with the interface.