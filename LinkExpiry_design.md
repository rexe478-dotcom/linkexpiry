# LinkExpiry Design Direction

## Design Goal

LinkExpiry should feel like a small, polished utility created by a
thoughtful product designer.

It should not resemble an AI-generated SaaS landing page.

The interface should communicate privacy, simplicity, and trust without
becoming visually dramatic.

## Core Principles

-   Minimal
-   Quiet
-   Functional
-   Intentional
-   Responsive
-   Typography-led
-   Strong spacing
-   Clear hierarchy

Prefer good typography, spacing, alignment, borders, and states over
decorative effects.

## Composition

The primary experience should be a compact centered composition.

The create screen should contain: 1. Product identity. 2. Short
explanation. 3. Message field. 4. Expiration control. 5. Primary action.

After creation, show the generated link directly within the same
experience.

The recipient screen should focus only on: 1. Private-message
explanation. 2. Reveal action. 3. Result or unavailable state.

## Visual Language

Use a restrained neutral palette: - near-white or white background -
charcoal primary text - muted gray secondary text - subtle borders - one
restrained accent for interactive states

Avoid: - gradients - neon colors - glow - glassmorphism - colorful
blobs - decorative waves - excessive shadows - excessive rounded cards -
gradient text - oversized buttons

## Typography

Use one clean modern sans-serif family where possible.

Typography should have a clear hierarchy without oversized marketing
headlines.

Do not use typography as decoration.

## Components

Inputs should feel precise and easy to use.

Buttons should be clear and compact.

Generated links should be visually identifiable and easy to copy.

Status states should be simple and readable.

Do not create components merely because they are common in SaaS
templates.

## Motion

Use only subtle transitions where they improve feedback.

Allowed: - small opacity transitions - subtle result appearance -
loading indicator - focus transitions

Avoid: - floating animations - parallax - bouncing elements - animated
gradients - excessive entrance animations

Respect `prefers-reduced-motion`.

## Responsive Behavior

Design intentionally for small screens rather than shrinking a desktop
layout.

At 320px wide: - no page-level horizontal scrolling - controls remain
usable - URLs wrap - text remains readable - touch targets remain
comfortable

On wider screens: - preserve a compact reading width - do not stretch
the application unnecessarily

## Anti-AI-Slop Rules

Never add: - generic hero sections - fake testimonials - pricing
tables - fake statistics - random feature cards - decorative 3D
illustrations - purple/blue AI gradients - glowing borders - excessive
pill-shaped controls - excessive cards - "AI-powered" language -
unnecessary badges - decorative dashboard widgets

If an element does not improve the product, remove it.

## Impeccable Design Requirement

Before implementing the frontend, use the Impeccable design
skill/process available in the project.

Use it to: - critique the initial visual direction - establish
hierarchy - remove generic patterns - improve spacing and typography -
check responsive behavior - identify AI-slop patterns - perform a final
visual review

Do not blindly follow generic AI design defaults.

The final interface should look intentionally designed, restrained, and
product-focused.
