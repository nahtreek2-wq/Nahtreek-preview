# NAHTREEK Professionals UI redesign audit

Date: 12 October 2026. Scope: `apps/professional-mobile` presentation layer. The screens below were inspected in source. During implementation, the rebuilt internal APK was installed on a 320 × 640 Android emulator. Role selection, account access, and Create Account were visually inspected; signed-in screens could not be inspected without an authenticated professional account. Findings about those screens remain source-based unless explicitly described as observed.

## Product problem and design direction

The existing five-tab navigation is sound. The main problem is priority: Home leads with a large editorial image and repeats verification, status, jobs, schedule, and quick-action cards. A professional must scroll and interpret several cards to learn whether a request needs a reply or work is blocked. Jobs has readable cards but spends a large vertical area on the header, filter tray and repeated action panels. The UI also mixes brand amber, interaction blue and teal without a single status hierarchy.

The redesign will keep the routes, API calls and mutations, role selection and existing server-controlled workflow. It will use compact navy headers, task-first hierarchy, one semantic status language, restrained contextual graphics, and real state-derived actions. Unknown server data must remain unknown, never be represented as a zero or a success.

## Screen-by-screen source audit

| Screen or state | Current UX and visual findings | Redesign requirement |
|---|---|---|
| Splash | Six-dot orbit and 1.8 s artificial minimum; long intro before work. | Static logo/wordmark, small activity indicator; leave as soon as session hydration finishes; honor reduced motion. |
| Professional type | Existing role cards are text-heavy on narrow screens; a previous 320 × 640 emulator audit found the second choice below the fold. | Compact selectable rows, complete labels at large font, visible next action. |
| Account access | Form actions, error and recovery share one screen; keyboard and loading need narrow-screen review. | Clear heading, field help, focused validation, keyboard-safe primary action. |
| Identity setup | Required identity/work-area form; location can fail independently. | Explain manual entry when device location is unavailable; keep action visible. |
| Home | Image-led hero precedes the actual day's work; a second journey card and separate glance/status/help cards repeat information. Errors become a broad warning; unread conversations are not summarized. | Today summary and attention queue from real data near top, role-specific work language, contextual next action, section-level failures. |
| Jobs | Filter chips are discoverable, but large header + filter tray + full-height cards limit scan density. Cards show status and location, but date is request creation time, not scheduled visit time. | Compact filter/counts, job title, client, place, truthful time label, state and next action in one glance. |
| Job detail, engineering | Current status, detail and mutation controls are present; all content feels similarly weighted. | Status and next step before full description, timeline from real status history, explicit blocked explanation. |
| Job detail, service | `JourneyPanel` owns service transitions and quotations; local location publishing can fail during progression. | Keep `JourneyPanel` state machine, surface its next available action and location blocker clearly. |
| Map/location | Map preview and live work-location controls exist; the Android location path requires permissions/GPS. | Small map preview, clear sharing/permission states, human-readable recovery. iOS live work location is unsupported in current code. |
| Time/availability | Pause/resume and three preset slots work through existing API calls. Presets are the only quick creation UI; schedule and status are visually separate. | Lead with availability status; group saved slots chronologically; explain overlap rejection; add custom slot only if it can use the existing API. |
| Conversations | Existing list contains name, related subtitle, last message, time and unread count. Empty state has a useful Jobs action. | Stronger job context and unread hierarchy; contextual empty illustration. |
| Chat | Polling and Socket.IO are connected; bubble spacing, send feedback and job context need visual QA. | Familiar bubbles, readable time, clear failed send/retry and a visible job link if route data permits. |
| Notifications | Data and deep links exist, but rows are not grouped by day and visual type depends on generic styling. | Group Today/Earlier; event-specific icon; preserve mark-read and routing. |
| Profile | Identity, reviews, public preview, verification, work details, availability, notifications/settings and sign-out exist, but are a long stack of similarly weighted rows. | Identity and verification first, actual field-derived completion guidance, meaningful groups and a compact settings area. |
| Work setup | Role-specific form fetches categories/specializations and saves to the existing API. | Clear sections and required-field feedback; large-font and keyboard-safe QA. |
| Verification | Document upload and submission exist. | Exact missing/rejected document reason near its action; document-specific visual. |
| Public profile / portfolio | Portfolio add/delete is embedded in public-profile preview. Images are displayed remotely; failed images need contextual fallback. | Separate visual grouping, real project covers, clear empty state, confirm delete. Do not create fake projects. |
| Reviews | Real rating, total, distribution and review cards are present. | Keep small-sample restraint; visual hierarchy and empty reputation state. |
| Notification settings | Preference controls exist. | State, persistence feedback, disabled/loading treatment and accessible labels. |
| Empty/loading/error/offline | Shared icon-based empty/error component and skeletons exist; repeated warning patterns have limited context. | Purpose-specific visual and action; keep cached content on partial failure; no full-screen error for one failed Home section. |

## Existing visual system and consistency issues

`packages/design-system/src/index.ts` supplies colors, type, spacing and radii to both apps. The Professional app additionally uses many local literal values (font sizes, padding and corner radii), particularly Home, Reviews, and form screens. This creates inconsistent rhythm and makes large-font behavior harder to predict. Keep shared Client tokens stable; put any Professional-specific theme in a dedicated layer. Existing bitmap graphics consist primarily of the logo and two role banners. The same role banner should not be reused across unrelated workflow states.

## Architecture boundaries

Presentation changes must not alter endpoint paths, authorization, request transitions, quotation or verification rules, availability mutations, location safeguards, Socket.IO behavior, or Client ↔ Professional synchronization. No UI should suggest a booking or job succeeded until the server confirms it. Preserve empty/offline preview behavior but label it accurately.

## Verification plan and known limits

TypeScript and lint checks passed after the changes (lint retains pre-existing warnings), all 14 Jest tests passed, and `assembleInternal` succeeded. The internal APK installed and launched on the 320 × 640 emulator; the role-selection screen was inspected after the final build. Authenticated engineer and service-provider screen QA, larger-width checks, Client-to-Professional booking/messaging/notifications/location/quotation regression, and iOS QA still require test accounts, backend access, and an iOS device/simulator. The current host reports no `simctl` utility.
