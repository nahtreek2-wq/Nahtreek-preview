# NAHTREEK UI design-change register

This is the visual and usability checklist requested for the Client and Professional apps. It is intentionally separate from feature status: an API may work while its screen still needs design work.

## Global rules

- Use navy for app bars, primary navigation and trusted/system areas.
- Use NAHTREEK yellow only for the primary action on a screen, the selected navigation item, and small highlights. Do not use it for every card, icon or secondary action.
- Use white or very light neutral cards, consistent corner radii, readable dark text and adequate spacing.
- Respect Android safe areas: no title, logo, control or content may sit underneath the status bar, camera cut-out or gesture navigation bar.
- All screens must remain usable with larger text and smaller phones. Long content must scroll instead of overlapping controls.
- Use simple, direct wording for people who may not be comfortable with technical language. Avoid jargon and ambiguous labels.
- Every screen must have loading, empty, offline/error and retry states with the same visual system.

## Client app

| Screen or area | Required design behaviour |
| --- | --- |
| Sign in and create account | Keep fields in a scrollable form, prevent the create-account panel from overlapping guest/explore content, and show a clear error beside the action rather than a vague message. |
| Email verification | Make the one-time-code state clear; show only one success or error message at a time; provide resend and change-details actions without visual collision. |
| Home and service selection | Use familiar cards with plain service names, meaningful icons and a single clear next step. |
| Booking details | Ask for service details first, then location. The current-location permission/action must explain why the address is needed and have a manual-address fallback. |
| Professional discovery and profile | Show only admin-approved professionals and genuine saved profile/work data. No synthetic cover photo, generic service label or invented qualification may appear. |
| AI planner | Keep the signed-out prompt fully scrollable; never overlap its explanation and sign-in action. |
| Navigation | Use the same calm navy/neutral design language as the Professional app, clear active state, legible labels and safe bottom spacing. |

## Professional app

| Screen or area | Required design behaviour |
| --- | --- |
| Home | Show NAHTREEK logo/brand at top, the "Today at a glance" summary near the top, then current work and helpful next actions. Do not let a promotional image hide the practical actions. |
| Navigation | Match the Client app’s rounded, easy-to-read bottom navigation. Use simple labels: Home, Jobs, Schedule, Messages and Profile. |
| Colour system | Replace unnecessary yellow blocks with neutral surfaces. Reserve yellow for the most important current action and selected state. |
| Public profile | Call it "My public professional profile" or "See what customers see"—never "customer profile". Populate name, work description, services, price, qualifications, cover and statistics from the professional’s saved data only. |
| Work photos | Provide a visible "Add work photo" action, upload progress, retry/error feedback, display the uploaded image and allow the owner to remove it. No placeholder should pretend that work photos exist. |
| Verification | Explain each proof in simple words. Use correct status: Draft, Ready to submit, Under admin review, Changes requested, or Profile verified. A verified account must not show "Send for verification". |
| Jobs and messages | Use clear status chips, large touch targets, real request data and friendly empty states. New jobs, messages and status changes must be visually distinct. |
| Notifications | In-app notification centre and push notifications must use useful transaction events—new request, booking accepted, message, verification decision or status change—not generic spam. |

## Admin web

- On mobile, use a hamburger menu instead of a row of top buttons.
- Keep the NAHTREEK logo; no unrelated stock or random imagery.
- Provide responsive review, user-management and document-view screens.
- Let authorised admins view uploaded verification files, approve/reject with reasons, edit permitted user details, suspend/remove users, and see service-request operational status.

## Definition of done for a design change

1. The screen is checked at normal and large Android font sizes.
2. It has no status-bar, keyboard or bottom-navigation overlap.
3. It uses real backend data; no fake personal profile content.
4. Loading, empty, error and retry visuals are present.
5. Its action and wording can be understood without technical knowledge.
6. The related client/professional/admin flow is tested end to end where applicable.

## Current implementation note

The latest preview APKs implement the safe-area, account-form, guest-AI, professional home/navigation, verification wording, public-profile data and work-photo changes described above. The Client update in progress additionally makes planner/account forms keyboard-aware, puts a compact NAHTREEK identity line on internal headers, removes city-specific header wording from Find, enlarges the Client profile identity area and reorganises its settings. The remaining work is visual QA on physical devices across the rest of the screen catalogue; this register is the acceptance checklist for that pass.
