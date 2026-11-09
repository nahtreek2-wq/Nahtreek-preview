# Task-first mobile redesign

## Direction and audit

Apply UI Designer, UX Architect and Mobile App Builder guidance from the installed Agency roster. These are three selected specialists, not 280 simultaneous agents. Preserve navy/yellow branding, semantic icon colors, existing navigation contracts and API behaviour. No violet or decorative motion.

Client Home previously placed its promotional hero, carousel controls and AI card ahead of its main service choices. Professional Home placed the setup/status panel ahead of pending and active work. This prioritised supporting content over the next task.

## First implemented slice

- Client service and engineer choices now precede the promotional section, using full-width action cards with wrapping descriptions.
- Professional attention items now precede the setup/status panel. Existing job status and navigation logic is preserved.
- Both apps share the ActionCard component for these entry points and Professional quick actions, with 48px icon containers, semantic tints, accessible labels and pressed feedback.
- Client greeting scale is reduced and the search prompt is shorter, leaving more room for actions on small screens.

## Still to validate or redesign

This is not a completed app-wide redesign. Obtain client feedback on the visual direction; review discovery/provider cards, job details, profile, forms and empty/loading states next. Check the native layouts at small and standard widths and enlarged text sizes. Existing APKs in consistency-20261008 do not include this slice until new builds are explicitly packaged. Live workflow reliability requires separate authenticated testing.

Kluster review is unavailable in the current tool set. Do not treat source type checks or component tests as full device acceptance.

Validation for this slice: both mobile TypeScript checks passed; three focused test suites passed (seven tests). No emulator was connected at the time of the check, so these new layouts have not yet had native screenshot review. No new APK has been packaged for this slice.
