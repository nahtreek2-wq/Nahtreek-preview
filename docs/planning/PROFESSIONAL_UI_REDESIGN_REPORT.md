# NAHTREEK Professionals redesign handoff

12 October 2026 · Android internal build · implementation status: substantial first pass, not a signed-off complete redesign.

## Delivered

- Task-first Home: real pending work, active work, unread conversations, profile readiness, availability and partial-load states replace the image-led opening. Live work-location control is nearer the top for service professionals.
- Compact five-tab navigation, a consistent navy header, reduced splash delay, a narrow-screen role selector with visible Continue, and a Professional-only color/type/spacing layer. Client app design tokens and routes were not changed.
- Jobs and detail: denser status/next-action cards, truthful request dates, contextual work photos, and the existing engineering/service transition controls preserved.
- Time: available-today summary and custom availability entry through the existing endpoint. Chat: visible job context/link when the conversation supplies a request ID. Notifications: Today/Earlier grouping and event-specific icons. Profile: actual field-based readiness guidance. Verification: required-proof count and existing document-specific status/rejection guidance. Portfolio: image-load fallback.
- Three locally bundled, category-specific job photos and a role-aware icon component. See [visual asset map](VISUAL_ASSET_MAP.md).

## Functionality and data contract

This pass did not alter API routes, request state transitions, quotation rules, verification submission, location permissions, Socket.IO transport, or Client ↔ Professional server behavior. New counts and prompts derive from existing responses; unknown information is not represented as a successful action. UI changes alone cannot establish that live cross-app workflows are healthy.

## Verification evidence

- TypeScript: pass. ESLint: zero errors, nine warnings in PublicProfilePreviewScreen. Jest: 6 suites / 14 tests pass.
- Android: offline `assembleInternal` successful; APK installed and launched on a 320 × 640 emulator. Role selector visually inspected with its bottom action visible; account access and Create Account were also inspected during development.
- APK: `apps/professional-mobile/android/app/build/outputs/apk/internal/app-internal.apk` (internal package and signing, not a store update).

## Still required before release approval

1. Sign into both engineer and service-professional test accounts and capture Home, Jobs, detail, Time, Chat, notifications, Profile, setup, verification, portfolio and reviews at small and standard device widths, including large text, keyboard, empty, loading and offline states.
2. Run a real Client booking through Professional acceptance, chat, notification, location, service arrival, quotation and completion against a reachable backend. Confirm on both devices; no such end-to-end run was completed here.
3. Review remaining work-setup, reviews, notification settings, map preview and service-job detail presentation on device; this pass did not fully redesign every screen named in the brief.
4. Test iOS on a simulator/device; none was available on this host. Run accessibility traversal and reduced-motion checks on both platforms.
5. Produce a release-signed build with a valid version increment and complete the production rollout separately. The internal APK is for inspection only.

## Known limitations

The installed app can launch, but signed-in screens were not visually certified. The image assets are representative context, not evidence of any user's actual work. The Professional live-work-location control remains Android-only; iOS shows an explicit unsupported message. Kluster automated review could not run because its connection failed; TypeScript, lint, Jest and Android build are separate checks and do not replace that review.
