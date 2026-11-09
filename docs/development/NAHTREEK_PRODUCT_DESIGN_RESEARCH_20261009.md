# NAHTREEK product design research and redesign brief

Research date: 9 October 2026. Applies to NAHTREEK Home and NAHTREEK Pro.

## 1. Decision

Choose a calm, task-first service marketplace with an Android-native interaction language. Preserve the navy/yellow identity, use light content surfaces, and make the next meaningful action obvious. The customer app helps people choose and track trusted help; the professional app helps people assess and deliver work. They share components, not identical home screens.

Do not pursue glass effects, neon gradients, decorative animation, an AI-dominated home screen, or a different color for every button. Polish comes from readable content, predictable interaction and truthful state. No violet.

This is a proposed product specification, not a claim that the redesign or live workflows are complete.

## 2. Evidence and limits

Method: desk research from platform documentation and first-party service-marketplace help pages; source inspection; previously captured 320x640 Android emulator screens. Agency UX Researcher guidance informed the distinction between observations and hypotheses. Earlier UI Designer and Mobile App Builder reviews inform the component direction. No customer interviews or competitor-app device tests were conducted. No invented personas, satisfaction scores or conversion improvements are reported.

Observed on installed NAHTREEK builds:

- Client Home's header and promotion consumed the first viewport before service choices.
- Pro role descriptions were squeezed between an icon and radio control, producing excessive wrapping.
- Client login combined a large wrapping brand label with an additional uppercase tagline.
- Client Find's visible controls were readable, but its lower results and authenticated states were not fully audited.

Source findings:

- Both apps use MaterialCommunityIcons, but the Client wrapper mixes filled and outline glyphs; Pro also renders icons directly. The problem is inconsistent selection and composition, not proof the library itself is defective.
- ServiceBookingForm collects address, work details, recipient, visit mode and matches on one long surface. Scheduled dates are typed as YYYY-MM-DD HH:mm. A confirmation alert exists, but it does not present the full work description, time and price breakdown as an editable review screen.
- JourneyPanel has stage-specific actions, revision submission, a 3-second foreground refetch interval and stale-update messaging. That is meaningful existing work. It is not evidence of successful two-device operation or continuous live map animation.
- JourneyPanel reuses one text field for scope, completion and issues; different tasks need contextual labels and dedicated validation.
- Client navigation separates engineering requests and service history. Pro labels include Jobs and Time. A clearer unified activity model is a proposal, not a trivial text-only change.

Relevant files: apps/client-mobile/src/components/ServiceBookingForm.tsx; packages/mobile-booking/JourneyPanel.tsx; apps/client-mobile/src/components/ui/Icon.tsx; both navigation/types.ts files; both HomeScreen.tsx files.

## 3. Research translated into decisions

| Source | What it supports | NAHTREEK decision |
| --- | --- | --- |
| Android accessibility | Large targets, meaningful accessible labels, readable contrast | Separate icon size from hit area; test TalkBack, not screenshots alone |
| Google Material Symbols | One configurable family with fill, weight and optical-size variants | Rounded symbols with a fixed visual specification |
| NN/g progressive disclosure | Defer secondary complexity until relevant | Keep booking essentials visible; reveal optional details on demand |
| NN/g bottom sheets | Sheets suit temporary contextual controls | Sheets for filters and short choices; full screens for booking and complex forms |
| Taskrabbit booking help | Address, provider comparison, scheduling, details and review are distinct decisions | Explicit review before submission; distinguish request sent from accepted |
| Urban Company service page | Its public positioning emphasizes service categories, transparent pricing and reviews | Make category, scope, cost basis and verifiable trust legible; do not copy its claims |
| Android offline-first guidance | Read caching and write reliability require different strategies | Preserve drafts and cached views; do not pretend an offline acceptance is confirmed |
| Android notification design | Contextual opt-in and meaningful notification content | Transactional alerts first; separately opted-in, restrained promotions |

These are design inferences from the sources, not proof that copying a competitor will satisfy NAHTREEK users. Sources are linked beside the detailed decisions below.

## 4. Visual foundation

### Color and typography

Retain brand navy #111F35 and yellow #E8AD43. Use #F7F9FC for page surfaces, white for cards, #172033 for primary text and #667085 for supporting text. Yellow is for selected states and primary action fills with dark labels. On white, use navy headings rather than pale yellow headings. Use yellow headings selectively on navy. Choose darker semantic foregrounds where needed: success #166534, warning #92400E, error #B42318, information #1D4ED8; validate every foreground/background pair before implementation.

Use system typography initially: native Android sans-serif and iOS system text, avoiding a new font dependency before legibility is validated. Proposed scale: screen title 24/32, section heading 20/28, card title 17/24, body 16/24, supporting text 14/20, tab label 12/16. Weight 400 for body, 600 for labels and 700 for headings. Text scaling must remain enabled; avoid truncating names, addresses, prices and primary actions.

Spacing: 4, 8, 12, 16, 24, 32. Screen gutter 20dp, compact gutter 16dp when required. Input radius 12, card radius 16, contextual sheet radius 24. Reserve pill shapes for compact selections, not every component. Use borders or whitespace before shadows. These measurements are NAHTREEK design choices, not platform mandates.

Android recommends at least 48dp interactive targets. Adopt that across both apps; use 4.5:1 normal-text contrast as the minimum and test scaled text, focus order and accessible names. Color must not be the only status cue. [Android accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views)

### Icon decision

Target family: Material Symbols Rounded, default weight 400, optical size 24, unfilled at rest; filled counterpart for selected primary navigation where appropriate. Normal controls use 24dp artwork inside a 48dp target; supporting metadata uses 18-20dp. Do not enlarge every icon into a colored tile. Use semantic tints on service-category cards, neutral icons for ordinary settings, and text labels for unfamiliar symbols.

Google provides configurable fill/weight/optical-size axes and downloadable assets. Bundle the selected assets locally so icons do not depend on network delivery. Keep licensing notices. This is a new family, not the existing MaterialCommunityIcons package. Validate the React Native rendering approach and dependency implications before migration; do not import a web icon font into a native view and assume it works. [Material Symbols guide](https://developers.google.com/fonts/docs/material_symbols)

Proposed icon concepts: Home/house; Find/search; Bookings/calendar with check; Messages/chat bubble; Profile/person; Jobs/work; Schedule/calendar; AI Planner/plan or auto-awesome with an explicit label. Do not use a hard-hat person for all discovery. Remove question-mark fallbacks, but retain legitimate help punctuation and user-written questions. Audit glyph coverage in release APKs.

## 5. Navigation and screen architecture

Proposed visible labels:

- Home app: Home, Find, Bookings, Messages, Profile.
- Pro app: Home, Jobs, Schedule, Messages, Profile.

Keep five labelled destinations, consistent selection styling and a stable bar that respects the system inset. Show badges only for real unread/actionable counts. Preserve existing route identifiers and deep links; changing visible labels requires a coherent migration across screen titles, analytics and support copy.

Home headers carry the logo and product label once. Detail screens use Back + clear title + only a relevant action; no repeated wordmark. Use a compact app bar with content-sized subtitle, not a fixed oversized blue block. Current nested screens must preserve draft state on Back. Avoid using Home navigation as a substitute for Back.

The full-screen booking path should not be placed inside a cramped modal. Use bottom sheets for filter selection, sort order or a brief address choice; keep persistent task information in the page. [NN/g bottom-sheet guidance](https://www.nngroup.com/articles/bottom-sheet/)

## 6. Client screens

### Home

Order: compact brand/location row; search; current booking card if one exists; clear service/engineering entry points; optional AI planning entry; small promotional/editorial section last. A new user should see a route into service discovery without scrolling through a campaign. When signed out, show useful discovery and defer sign-in until a protected action; retain the selection through authentication.

Do not invent nearby availability. Location text should distinguish a selected service area from current GPS. Client Profile access stays in the bottom bar; retain a header avatar only if it provides useful account context without crowding the logo.

### Find and professional profile

Search followed by Engineers/Services selection, a results count, and one filter control with an active-filter count. Show active filters as removable chips; avoid several competing horizontal filter rows. Results cards prioritize name, actual specialty, review count, verification meaning, service area and an explicit rate basis. Use a real profile photo or an honest initials fallback, not a fabricated portrait for real users.

Profile details: identity and specialty; verification explanation; scope/experience; genuine reviews; availability; price basis; one booking action. Never label someone “available now” based only on a profile toggle without fresh eligibility data. Urban Company's public materials emphasize pricing and reviews; this supports prominence, not an endorsement of any particular badge or service guarantee. [Urban Company public service page](https://www.urbancompany.com/near-me)

### Booking

Use four decision groups, preserving entered values when navigating back:

1. Work: category, issue/scope and optional photos.
2. Place and time: saved/current/other address, editable map pin, house details, recipient, permission, immediate/scheduled choice. Use date/time pickers and supported availability, not a format-typing exercise.
3. Professional: explicitly chosen person or explicit nearby matching; skill, coverage and eligibility checked against the service address.
4. Review: work, address, recipient, time, professional, known charge and unknown charges, cancellation terms and editable sections. One Send request action.

Taskrabbit publicly documents category, address, provider choice, scheduling, details and review as separate decisions, and distinguishes submission from provider scheduling. NAHTREEK should adopt that clarity without copying its deadlines or business policy. [Taskrabbit booking help](https://support.taskrabbit.com/hc/en-us/articles/46260422073755-How-Do-I-Hire-a-Tasker)

Engineering consultations use appointment and project-brief language. Immediate home services use dispatch language. Do not force engineering design work into a 30-minute delivery promise.

### Bookings and messages

Propose one Bookings destination containing both service visits and engineering consultations, with clear type labels. Each card shows status in words, next event and next action. An ongoing booking opens a timeline and contextual detail; messages remain associated with that booking. Empty states explain the next step without claiming support response times that are not guaranteed.

## 7. Professional screens

Home should prioritize an accepted visit or actionable request, then availability and schedule, then summary counts. Unverified professionals instead see their exact next setup requirement. Separate verification status from online/offline status.

Jobs: New, Active, History, with counts only from real data. Request detail must reveal scope, address area, travel estimate freshness, requested time, price basis and acceptance deadline before Accept. Once accepted, use a job workspace with one primary stage action. Keep Decline/Cancel visually secondary and explain consequences.

Schedule: date selector, working hours, booked slots, blocked periods and timezone. Profile: public preview, identity/work details, verification and notification settings as distinct sections. Short role-selection descriptions should not be squeezed into columns beside large icons.

## 8. Shared booking-state contract

| State | Client sees | Pro primary action | Dependency |
| --- | --- | --- | --- |
| Draft | Editable, not submitted | None | Local draft persistence |
| Pending | Waiting for acceptance | Accept / decline | Durable save, deadline, notification |
| Accepted | Visit accepted | Start journey | Atomic reservation, conflict check |
| En route | ETA and location age | Mark arrived | Authorized job-specific tracking |
| Arrived | Confirm identity; scope/price | Quote / verify start code | Server-validated stage and code |
| In progress | Approved scope; change requests | Submit completion | Explicit approval for extra work |
| Awaiting confirmation | Summary and issue option | Await response | Customer confirmation contract |
| Completed | History, receipt if supported, review | View summary | Confirmed completion, separate payment state |
| Declined/expired/cancelled | Reason and valid alternatives | Context-dependent | Rules, cleanup and notifications |
| Disputed | Support review, not completed | Provide information | Auditable support workflow |

The source contains many of these UI stages already. Backend authorization, races and actual delivery must be tested. A 30-minute arrival target is conditional on coverage, recent provider location, availability and road ETA plus preparation; it is not a completion promise. Never switch a specifically chosen provider without consent.

## 9. Forms, poor network and feedback

Progressive disclosure supports showing essential options first and deferring advanced detail. Apply this to optional landmarks, photos and special requirements; never hide price terms or required consent. [NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/)

Every important component needs loading, populated, empty, validation-error, offline/stale, permission-denied and submitting states. Keep forms editable where safe. Preserve text across retries; explain why submission is disabled next to the relevant field. Distinguish “Sending request” from “Request sent” and “Professional accepted.” A timeout may leave server outcome unknown: check the same idempotency identifier before offering a new submission.

Cache previously read information with a stale marker; store drafts separately. Sensitive writes such as acceptance and completion require authoritative confirmation, not optimistic success. Android's offline-first guidance distinguishes reads from different write strategies; offline support is more than displaying a banner. [Android offline-first architecture](https://developer.android.com/topic/architecture/data-layer/offline-first)

Skeletons should match unloaded content and stop under reduced motion. Do not obscure already loaded content during background refresh. Inline errors for forms, contextual banners for connectivity, brief confirmation feedback for low-risk saves. Never use endless loaders or a universal “try again” message for every failure.

## 10. Maps, AI and notifications

Maps: request permission at the relevant action, allow manual address entry, show accuracy/last update when useful, and keep the booking address separate from profile address. A static map image is not continuous navigation. Do not imply Google Maps or live tracking unless the installed build actually provides it. Tracking needs job-level authorization and an explicit start/stop lifecycle.

AI Planner: secondary project-planning tool, not a substitute for service discovery. Ask only missing context; return a structured summary, assumptions, priorities, indicative budget ranges with basis, professional types needed and a checklist. Separate confirmed user facts from estimates. Keep drafts after timeout. Offer downloadable output only when generation/storage is actually implemented. Structural, electrical and approval-sensitive decisions must be referred for qualified review; do not invent local compliance facts or treat generated estimates as quotations. Response usefulness needs scenario evaluation, not just model replacement.

Notifications: job alerts should open the exact booking and remain available in an in-app inbox. Request permission contextually; separate booking/message channels from optional promotions. Proposed initial promotional limit is at most one relevant reminder per week with opt-out, not a researched optimum. Avoid guilt, fabricated urgency or frequent random messages. Android guidance supports contextual opt-in and meaningful notifications. [Android notification design](https://developer.android.com/design/ui/mobile/guides/home-screen/notifications)

## 11. Delivery order and acceptance

1. Stabilize the build and record exactly which APK is under review. Preserve prior APKs and existing user changes.
2. Prototype Client Home/Find/booking review and Pro Home/job detail using real native components. Validate the icon renderer in a release build before migrating every screen.
3. Migrate shared headers, icon registry, buttons, input fields, selection rows, status timeline, provider cards, empty/loading/error components. Do not mix old/new icon families on completed screens.
4. Implement the booking and job workspaces against existing API contracts; add missing backend capabilities separately with tests.
5. Test the rest of profile, messages, notifications and AI; then build the release candidates.

Proposed acceptance gates, not achieved metrics:

- At 320, 360 and 412 logical widths and increased text sizes, no clipped primary action, name, price or address; keyboard does not hide the active field or prevent reaching submission.
- TalkBack announces labels, selection and errors without reading decorative glyphs.
- Flight mode, permission denial, slow connection, process restart and repeated taps preserve data and do not create duplicate bookings.
- Two-device acceptance demonstrates each supported stage and reconnect recovery. Competing acceptance requests cannot double-book a provider.
- AI test cases cover vague briefs, unrealistic budgets, unsupported locations, missing photos, server failures and safety-sensitive questions. Assess accuracy and actionable value, not just fluent prose.
- Run two formative usability rounds, initially recruiting 5 clients and 5 professionals per round with varied device familiarity and including large-text/accessibility users. This is issue discovery, not a statistically representative survey. Obtain consent and use fictional booking data.
- Measure unaided task completion, wrong turns, abandonment, retries and status comprehension before/after. Report observed denominators; do not advertise improvement percentages without data.

## 12. Final recommendation

Build a coherent, trustworthy service product first. The visual target is modern but restrained: recognizable icons, legible type, compact branded headers, clean task cards and clear next actions. A design is only polished when the user understands what will happen, what it costs, whether it succeeded and how to recover.

This research creates the direction and implementation contract. It does not certify production readiness. Authenticated Pro screens, real map/notification behavior and full two-device workflows remain necessary validation work. No application code, dependencies or production records were changed for this research deliverable. Kluster review was unavailable in the tool set.
