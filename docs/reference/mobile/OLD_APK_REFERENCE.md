# NAHTREEK Client — Old APK Reference

Reference artifact: `/Users/vedasarathivadivel/Downloads/Nahtreek-release.apk`

The APK is a reference build only. Its bundled React Native JavaScript is not the original TypeScript source, and no source maps were embedded. This audit records observable product behavior to guide the new client implementation.

## Login / Register

- Purpose: authenticate an existing client or create a local/offline profile.
- Entry: cold start when no session is available.
- Visible actions: Login, Create Account, mobile number entry, Send OTP, Explore as Guest.
- Reference behavior: the release build falls back to an offline profile mode when API configuration is unavailable.
- New behavior: use environment-based API configuration, clear validation, explicit loading/error states, and a real session restore path.

## Home

- Purpose: orient the client and provide fast paths into discovery and requests.
- Entry: Home tab after authentication.
- Visible sections: compact NAHTREEK header, city selector, notifications, profile avatar, global search, rotating hero cards, trust statistics, service categories, bottom navigation.
- Reference content: Verified Experts, civil engineer discovery, construction supervision, Plumbing, Electrical, Painting, Carpentry, and Masonry.
- New behavior: preserve the compact hierarchy while adding real nearby/recommended data, current-request shortcut, saved shortcut, loading, empty, and offline states.

## Engineer Discovery

- Purpose: compare and open professional profiles.
- Entry: Home hero, search, service category, or Engineers tab.
- Visible controls: back, title/subtitle, sort chips (Top Rated, Nearest, Available Now), specialization filters, professional cards, save action.
- Card information: verification indicator, name, title/specialization, experience, rating/reviews, availability, distance, consultation fee.
- New behavior: server-backed filters, debounced search, stable IDs, optimistic save with rollback, and honest verification states.

## Requests

- Purpose: track consultations and service visits.
- Entry: Requests tab or request confirmation.
- Visible content: request cards, status badge, progress timeline, date, Track, Chat, and Cancel actions.
- Reference statuses: Pending, Accepted, In Progress, Completed.
- New behavior: backend-controlled state machine, segmented active/completed/cancelled filtering, request detail screen, timestamps, loading, retry, and confirmation states.

## Messages

- Purpose: communicate with professionals and reach support.
- Entry: Messages tab or a request card.
- Visible content: conversation list, timestamps, unread count, Browse Services, Find Engineers, and Need help? cards.
- New behavior: conversations keyed by client/request/professional IDs, resilient send/retry/offline handling, and real-time reconnect behavior where enabled.

## Profile

- Purpose: manage client identity, saved professionals, location, preferences, security, support, and logout.
- Entry: Profile tab or header avatar.
- Visible sections: client avatar/name/phone, Saved Professionals, Payments & Billing, Home Location, Notifications, Privacy & Security, Verification, edit action.
- New behavior: persisted profile data, real settings actions, safe logout, and no unsupported claims.

## Notifications

- Purpose: show request, message, and service updates.
- Entry: bell action in the Home/header.
- Required states: unread/read, empty, loading, retry, mark one read, mark all read.

## Professional Profile

- Purpose: establish trust and convert discovery into a consultation request.
- Required sections: profile header, verification status, specialization, experience, qualifications, about, portfolio, service areas, availability, consultation details, rating summary, reviews, and request CTA.

## Cross-cutting requirements

- Safe-area-aware layouts and keyboard handling.
- Reusable design tokens and components.
- Intentional loading, empty, error, offline, and success states.
- Accessibility labels and meaningful touch targets.
- Environment-based API configuration; no private LAN or tunnel URLs in production.
