# Emulator UI audit - 9 October 2026

## Observed on installed internal apps

Android emulator at 320 x 640. Screens opened and captured: Client login, guest Home, Find; Professional role selection. The installed APKs predate the task-first Home changes.

- Pro role selection: side-by-side icon, long description and radio consume the card width. Descriptions wrap into many short lines and push the second option below the first viewport. Changed to icon/title/radio heading with full-width description below, 16px padding and 40px icon container.
- Client login: combined NAHTREEK HOME heading wraps into two large lines, followed by another multiline uppercase tagline. Changed to NAHTREEK with a smaller HOME label; retained the explanatory sentence below.
- Client Home: header and promotion consume the first viewport. The source task-first redesign moves the service choices ahead of the promotional card and reduces greeting size; new APK visual confirmation is still required.
- Client Find: observed navigation, search, AI prompt and Engineer/Services control are readable at this viewport. Lower results and authenticated states remain unaudited.

Both mobile TypeScript checks pass; seven focused component tests pass. Kluster review is unavailable. Offline builds failed to resolve the Gradle Foojay plugin; online rebuilds were started. Do not infer device verification of edited layouts until installation and screenshots confirm them.

Professional dashboard/jobs/profile need a signed-in test account. No account was created, private credentials accessed, or live booking submitted during this audit.
