# Mobile interface review — 8 October 2026

## Direction

NAHTREEK Home helps customers find and request help. NAHTREEK Pro prioritizes work, replies and availability. Both use the existing navy/yellow identity, light surfaces, one icon family and semantic status colors. No violet. Restrained motion supports feedback and respects reduced-motion preferences.

The taste skill informed the visual audit; its web-only patterns are not used in the native apps. Mobile guidance informs safe areas, navigation, scalable text and touch targets.

## Implemented in source

- Shared screen headers put navigation beside a wrapping title, with supporting text beneath. This removes the otherwise empty navigation row and keeps space for screen-specific actions.
- Shared navigation uses a light surface with a yellow selection indicator. Rounded navy Home headers preserve brand identity.
- Client Home search is a single accessible button leading to the search screen, avoiding a keyboard/focus transition on the previous screen.
- Client Home displays the full logo without a negative-margin crop. Service/engineer choices stack on narrow phones or with larger text.
- Professional job filters stack below 380 logical pixels or above 1.2 text scale to keep icons, labels and counts readable.
- Request progress uses flexible columns, green completed steps, a yellow current step and an announced progress label. Fixed-width step labels no longer exceed narrow cards.
- Client profile editing uses a navy pencil on its yellow button for contrast.
- Earlier source changes include larger control targets, clearer input contrast, semantic selection states, reduced-motion handling and animation cleanup.

## Checks and remaining review

### Follow-up consistency pass

- Both standard headers now consume the same native style definitions: 24px navigation glyphs in fixed 48px targets, 12px icon/title spacing, wrapping titles and 8px subtitle spacing. The AI logo uses contain sizing rather than a negative-margin crop.
- The Professional Home brand/product row wraps within the space left by actions.
- Client and Professional forms share the existing focused-field scrolling hook. Professional login, account creation, identity and work-profile forms now wire every local field, including password fields, to it. Android relies on the existing adjustResize manifest setting instead of combining that with a second height adjustment.
- Pale placeholders were replaced with the shared slate500 text color in Professional setup/auth/chat and Client profile/search/AI fields.
- Automated coverage checks text contrast, header target geometry, form focus wiring and keyboard-listener cleanup. Device acceptance should also cover keyboard switching and increased font sizes on both Android and iOS; it is not implied by these tests.

Follow-up validation: both mobile TypeScript checks and all six focused Jest tests pass. Both internal Android APK builds and lint tasks passed, both APK signatures verify, and both installed over the internal emulator apps. Updated artifacts are in `releases/preview/consistency-20261008`; the earlier redesign previews are retained separately. Kluster auto-review remains unavailable.

On the updated Professional APK at 320px, focusing the email field in account creation scrolled it above the open Android keyboard; the field and darker placeholder were visible. No account was created or verification message sent. This is one device check, not full form/device coverage.

Both preview APKs built successfully on 8 October using Java 17, including Android lint. Both installed successfully over the emulator's existing internal apps. Both mobile TypeScript checks and the existing responsive-button test passed. The new APKs are in `releases/preview/redesign-20261008`. They include the earlier refresh, which was not distributed in the September APKs.

After recovering the emulator from an Android system-process hang, visual checks covered Client guest Home and Find, account access, and Professional role selection at 320 logical pixels. The final Client Home build wraps the HOME badge without overlapping the notification button. Both distributed APK signatures verified. Full visual acceptance remains incomplete, particularly authenticated Professional screens. Screen source checks and successful APK builds are not evidence that booking, AI, maps or notifications work end to end. Kluster auto-review was unavailable in this tool session.

Review both apps at 320/360/412 logical pixels and at increased system text size. Check Home, discovery/jobs, requests, messages, profile, AI and form screens; verify loading, empty, error and populated states. Backend-dependent flows require authenticated test accounts and live service verification.
