# NAHTREEK — complete project audit and UI modernisation plan

**Date:** 23 October 2026
**Scope:** everything under `apps/`, `packages/`, `docs/`, `deployments/`, `releases/`, `artifacts/`, plus root-level files and build health.
**Method:** source inspection, config inspection, dependency inspection, running type checks and every test suite, reading the existing screenshots in `artifacts/redesign-20261007/`, and reading the 68 documents already in `docs/`.

**Honest limits up front:** I did not run the Android apps on a device or emulator, and I could not sign in to any account. Every claim below is either (a) measured by a command I ran, (b) read from source with a file reference, or (c) read from the checked-in screenshots. Sign-in-only screens are marked **source-only**.

---

## 1. What this project actually is

One marketplace product, one backend, three front ends.

| Part | Path | Size | Stack |
| --- | --- | --- | --- |
| Client app (Android-first) | `apps/client-mobile` | 52 `.tsx` files, 13.7k LOC in `src` | React Native 0.75.4, React 18.3.1, React Navigation 7, TanStack Query 5, Zustand 5 |
| Professionals app | `apps/professional-mobile` | 30 `.tsx` files, 7.9k LOC | Same stack, deliberately forked presentation layer |
| Admin console | `apps/admin-web` | 1,407 LOC total | Hand-written vanilla JS + CSS, no framework, built by `scripts/build.mjs` to `dist/` |
| API | `apps/api` | 90 `.ts`, 708-line Prisma schema, 12 modules | NestJS 11, Prisma 5, PostgreSQL (Supabase), Socket.IO, JWT/Passport |
| Shared design tokens | `packages/design-system` | 1 file | Colour/spacing/radius/type constants, no components |
| Shared mobile components | `packages/mobile-ui` | 11 files | Button, card, header styles, icons, motion, keyboard helpers |
| Shared domain code | `packages/mobile-booking`, `mobile-geography`, `mobile-push`, `android-push`, `types` | small | Journey state machine, state/district picker, push prefs, DTOs |
| Docs | `docs/` | **68 markdown files** | Architecture, ADRs, runbooks, plans, audits |
| Environments | `deployments/` | profile READMEs only | Preview + production profiles, no duplicated source |
| Builds | `releases/preview/*.apk` | 75 MB + 68 MB | Internal debug-signed APKs, version 1.0.1 (build 2), 14 Oct 2026 |
| Brand | `brand-assets/` | images, PDF, PPTX | Logo, header, poster material |

**Backend modules:** auth, clients, discovery, requests, platform (service-request journey), chat, notifications, favorites, ai, admin, bookings, dev.

**Admin capabilities today:** overview metrics, professional verification queue + document approve/reject, user list/detail/edit/suspend, admin activity log, admin profile. **There is no service-request operations view, no messaging moderation, no payments, no analytics beyond counts.**

---

## 2. Health scorecard — measured

| Check | Command | Result |
| --- | --- | --- |
| Client TypeScript | `npx tsc --noEmit` in `apps/client-mobile` | **PASS** (0 errors) |
| Professionals TypeScript | `npx tsc --noEmit` in `apps/professional-mobile` | **PASS** (0 errors) |
| Client tests | `npx jest` | **PASS** 23 suites / **83 tests** |
| Professionals tests | `npx jest` | **PASS** 8 suites / **18 tests** |
| Admin tests | `npm test` | **PASS** 5 tests |
| API tests | `npx jest` | **PASS** 16 suites / **110 tests**, 1 suite + 6 tests skipped |
| Total automated checks | — | **216 passing, 0 failing** |

Technically this project is *not* broken. The client's complaint is not "it crashes" — it is "it looks dated". Those are different problems, and the second one is not caught by any of the 216 checks above.

### Process and hygiene problems (these are real, and they come first)

| # | Finding | Evidence | Severity |
| --- | --- | --- | --- |
| H1 | **The project root is not a git repository.** `git status` at root fails: *"not a git repository"*. Only `apps/client-mobile/.git` exists, with a single commit `a9f3d37 Initial commit` and **71 uncommitted modified files**. `apps/professional-mobile`, `apps/api`, `apps/admin-web` and `packages/` are completely unversioned. | `git status`, `git log` | **Critical** |
| H2 | `NAHTREEK-preview-demo-credentials.json` (real demo accounts) sits at the repo root. It *is* covered by the `**/nahtreek-preview-*.json` rule on a case-insensitive filesystem (verified with `git check-ignore`), but it sits outside any repository, so nothing is actually protecting it. `apps/api/.env` and `apps/admin-web/.env.local` likewise exist on disk. | root `ls`, `.gitignore`, `git check-ignore` test | High |
| H3 | **18 MB of unoptimised images in the Client app alone, of which 6.9 MB is never rendered.** Verified with zero references in `src`: `nahtreek-copy.png` (1.4 MB), `nahtreek_card_clean.png` (1.2 MB), `nahtreek_card_perfect.png` (776 KB), `nahtreek_emblem_noborder.png`, `nahtreek_emblem_tight.png`, `nahtreek_icon_clean.png`, `city-night.png`, `photo-site.jpg`, `work-site.jpg`, `portrait-eng-1-wide.jpg`. `photo-site.jpg` and `work-site.jpg` are byte-identical duplicates. The logo PNG used at 32 px in headers is **837 KB** (shown at 132 px in the splash). Professionals ships two 1.9 MB banner PNGs. No WebP, no density variants. | `grep -rl` per asset, `du -ch` | High |
| H4 | **APK size 75 MB / 68 MB.** Consequence of H3 plus unminified release config. | `ls -lh releases/preview` | Medium |
| H5 | `packages/design-system` and `packages/types` are imported by both mobile apps but **declared in neither `package.json`**. They resolve only through root workspace symlinks. 15 client files reach shared code by relative path traversal (`../../../../packages/mobile-ui/...`), which breaks the moment an app is built standalone or moved. | `package.json` vs `grep packages/mobile-ui` | Medium |
| H6 | **No crash reporting, no analytics, no error monitoring** in client, professional or API dependencies. You learn about production failures from users. | `package.json` grep | Medium |
| H7 | `docs/` has 68 files, including status documents dated 24–25 September while the shipped APKs are 14 October. The status doc says "56 Client tests / 10 Professionals"; reality is 83 / 18. `TASK_FIRST_REDESIGN.md` claims the Client Home now puts service choices before the promotional hero — the source does the opposite. Documents describe intent, not the shipped state. | `docs/operations/IMPLEMENTATION_STATUS.md`, `docs/development/TASK_FIRST_REDESIGN.md` vs `HomeScreen.tsx` | Medium |
| H8 | Build artifacts on disk: 807 MB (`client-mobile/android/app/build`) + 626 MB (`professional-mobile/...`) + 2.0 GB `client-mobile/node_modules`. Total `apps/` = 3.5 GB. | `du -sh` | Low (gitignored) |
| H9 | Admin console hard-codes the preview API in `vercel.json` (`https://nahtreek-api.vercel.app`). Preview and production would share one rewrite target. | `apps/admin-web/vercel.json` | Medium |
| H10 | API is otherwise in good shape: global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`, JWT length assertion in production, Database-backed auth throttle, `no-store` + `nosniff` headers, pool-mode awareness, 110 tests. **No `helmet`** and no response-shape versioning. | `src/main.ts` | Low |

---

## 3. Why the client says the UI "doesn't feel modern" — root causes

The client is right, and the reason is measurable. This is not one ugly screen; it is a **design system that was never actually a system**. Twelve causes, in order of impact:

### 3.1 There is no typography system — there are 20 type sizes and no typeface

Measured in `apps/client-mobile/src`:

```
fontSize 16 ×20    fontSize 15 ×17    fontSize 14 ×17    fontSize 13 ×14
fontSize 20 ×10    fontSize 18 ×6     fontSize 12 ×6     fontSize 10 ×5
fontSize 11 ×4     fontSize 23 ×3     fontSize 32 ×2     fontSize 28 ×2
fontSize 26 ×2     fontSize 22 ×2     fontSize 19 ×2     fontSize 17 ×2   … 116 literals
```

`fontFamily` appears **zero times** in either app. Every string renders in the platform default (Roboto). A 32 / 29 / 28 / 26 / 23 / 22 / 20 / 19 / 18 / 17 / 16 / 15 / 14 / 13 / 12 / 11 / 10 / 9 px ladder with default Roboto and mixed `700`/`800` weights is the single loudest "unfinished" signal a reviewer can see. Modern design reads as modern largely because the type scale is short, the weights are deliberate, and the family is chosen.

### 3.2 Three competing colour palettes, 74 distinct hex literals

- `packages/design-system/src/index.ts` — shared: `navyDeep #111F35`, `navyMid #102E52`, `navyLight #214A7C`, `amber #E8AD43`, plus `gold*`, `skyBlue`, `teal`, `verifiedBlue`, `interactiveBlue`.
- `apps/client-mobile/src/design-system/tokens.ts` — "compatibility aliases" that re-declare the same colours under new names (`primaryNavy`, `deepNavy`, `richNavy`) and add `#F3F7FD`, `#9A6700`.
- `apps/professional-mobile/src/theme/professionalTheme.ts` — a *different* brand navy `#0B2D5B` / `#071F3D`, a *different* blue `#2563EB`, its own greens and reds.
- `apps/admin-web/src/styles/tokens.css` — `--yellow: #f2b84b`, **not** `#E8AD43`.

Measured distinct hex values in source: **42 in the Client app, 32 in the Professionals app**, on top of the token files. `gold`, `amber`, `amberBright`, `goldBright` are four names for one colour. `slate100` and `slate200` are the same value; `slate500` and `slate600` are the same value. The three front ends do not share one navy and do not share one yellow.

When a reviewer says "it doesn't feel modern", inconsistent colour temperature between screens is a major hidden contributor — especially the blue-tinted `#F7F9FC` canvas against pure-white cards, plus 24 different blue/slate greys that are all *almost* the same.

### 3.3 20 different corner radii — including 13, 17, 18, 21, 22, 36, 38

```
borderRadius 16 ×27   14 ×17   12 ×13   18 ×10   20 ×9   22 ×5
13 ×4   9 ×2   4 ×2   21 ×2   17 ×2   15 ×2   10 ×2   38 ×1   36 ×1   28 ×1 …
```

`16` and `17` and `18` and `20` and `22` on adjacent cards is visually indistinguishable but produces a subtle "wobble" the eye reads as unpolished. The Professionals app has the same pattern: 12, 13, 14, 16, 18, 20, 22, 36.

### 3.4 The header treatment is the most dated element

`packages/mobile-ui/headerStyles.ts`:

```ts
container: {
  backgroundColor: Colors.navyDeep,
  paddingBottom: 24,
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
}
title: {...Typography.h1, color: Colors.amber, flex: 1}
```

Navy slab, 24 px rounded bottom corners, **amber screen titles**. This is the 2018-era "dark header with coloured title" pattern. It appears on nearly every screen, so nearly every screen inherits the dated look. The screenshots confirm it: `artifacts/redesign-20261007/client-before.png` shows the header text physically clipped at the right edge at 320 px ("HOME SERVICES & PROJECT…" runs off screen).

Also, `AppHeader` falls back to `navigation.navigate('Home')` when no `onBack` handler is passed — so a "back" affordance sometimes navigates *Home* rather than *back*, which is a correctness bug, not a taste issue (`src/components/ui/AppHeader.tsx`).

### 3.5 The tab bar is a floating pill with an amber block behind the active icon

`apps/client-mobile/src/navigation/AppNavigator.tsx`:

```ts
tabBarStyle: {
  backgroundColor: Colors.navyDeep,
  marginHorizontal: width < 360 ? 4 : 12,
  marginBottom: 8,
  borderRadius: 22,
  height: 68 + insets.bottom + …,
  paddingTop: 8,
},
tabBarActiveTintColor: Colors.amber,
tabBarLabelStyle: {fontSize: width < 360 ? 9 : 12, …},
```

and `packages/mobile-ui/NavigationIcon.tsx`:

```ts
frame: {width: 48, height: 32, borderRadius: 12, …},
selected: {backgroundColor: Colors.amber},
```

An amber rounded rectangle behind the selected icon **inside** a navy floating pill is visually loud and reads as a toy. At 320 px the labels drop to **9 px**. The Professionals app uses the same shape but a *blue* tint (`ProColors.blueSoft`), so the two apps don't even agree on the active state. This is the element on screen 100% of the time — it deserves the most care and currently gets the least.

### 3.6 The tab bar overlaps content (a real, reproducible layout bug)

The floating bar is `68 + safe-area + 8` tall plus an 8 px bottom margin. Tab screens pad their scroll content by `insets.bottom + 24` (`HomeScreen.tsx:139`) or a flat `24` (`ProfileScreen.tsx:314`). **The last ~50 px of every tab screen sits under the bar.** The screenshot `client-home-final.png` shows the hero card clipped exactly at the bar's top edge — the "Find verified professionals" button is cut mid-sentence.

Other screens use `insets.bottom + 90`, `+ 104`, `+ 40`, `+ 34` — six different strategies for the same problem.

### 3.7 Home opens with decorative marketing, not with the task — and the "task-first" fix has regressed

`HomeScreen.tsx` renders, in order: navy header with logo + city → 22 px greeting ("Make yourself at home" for guests) + subtitle → search field → **then the promotional hero `ImageBackground`** (eyebrow + 26 px title + subtitle + amber CTA + text shadow) → **then** "What do you need?" with the Services / Engineers choices.

So a first-time user sees **two headlines, two subtitles and two calls to action before a single service category**. `docs/development/TASK_FIRST_REDESIGN.md` explicitly claims *"Client service and engineer choices now precede the promotional section"* — **the source contradicts the doc**: the hero card sits at line ~207 and the choices at line ~224. The reorder was either reverted or never landed in this build. This is exactly why the previous redesign did not change the client's perception.

### 3.8 Two icon systems in one app

`components/ui/Icon.tsx` wraps `MaterialCommunityIcons` (66 named icons). `NavigationIcon` also wraps `MaterialCommunityIcons` but imposes a 48×32 tinted frame. Meanwhile the screenshots show a hand-drawn-looking logo glyph in the header. Mixing outlined and filled icons, at 13 / 20 / 23 / 24 px, with two different containers, is a "designed by three people" signal.

### 3.9 Everything is an elevated white card

Almost every surface is `#FFFFFF` + 1 px border + radius + shadow on a `#F7F9FC` canvas. There is no hierarchy through *surface tone*, no `sunken` / `raised` distinction, and no flat sections. Long screens (EngineerDiscovery is 943 lines, AiPlanner 893, Home 829) become a vertical stack of visually identical boxes. Modern layouts create rhythm with flat sections, dividers, grouped lists, and only one or two raised elements per screen.

### 3.10 Hard-coded literals everywhere instead of tokens

Even where tokens exist, screens bypass them: `HomeScreen.tsx` declares `ICON_TONES` with five raw hex values (`#EAF2FF`, `#FFF1E5`, `#EAF7EF`, `#FCECF0`, `#D97706`). There is no lint rule preventing it, so every new screen adds more. This is why the three front ends have already diverged.

### 3.11 No custom fonts, no motion system, no dark mode

- No `fontFamily` (see 3.1).
- Motion is ad hoc: `FadeInDown` + `ReduceMotion` in Home, `MotionReveal` in Professionals, `usePressMotion` shared — three approaches; the durations and easings are not shared.
- No dark theme anywhere, while Android 13+ users run the OS in dark mode and the app stays blindingly white. This is one of the fastest ways an app reads as "old".

### 3.12 Small sizes and all-caps tracking fight the small screens you target

10–11 px all-caps eyebrow labels with `letterSpacing: 1.3` are used for section kickers. On a 320 px screen these clip (proven in `client-before.png`). Section labels at 10 px are below any comfortable legibility floor, and at `fontScale 1.3` the layout has never been verified.

---

## 4. Screen-by-screen verdict

Legend: **V** = verdict, **E** = evidence. `S` = source-inspected, `P` = seen in a screenshot, `D` = device-verified in a previous session (per existing docs).

### Client app (20 screens, 52 components)

| Screen | V | What is wrong | E |
| --- | --- | --- | --- |
| `HomeScreen` (829 L) | Poor | Two headlines + two CTAs before any action; documented "choices before promotion" order is **not** in the source (hero at ~207, choices at ~224); hero CTA clipped by tab bar; 5 raw hex icon tones; 9–26 px type ladder | P, S |
| `EngineerDiscoveryScreen` (943 L) | Fair | Largest file; filter tray + header + long list; density on 320 px untested; header eyebrow clips | S |
| `AccountAccessScreen` / `LoginScreen` (782 L) | Fair | Segmented Login/Create control wraps unevenly and fights the heading; amber tab + amber primary button compete | P |
| `AiPlannerScreen` (893 L) | Fair | Second-largest file; long scroll, mixed card styles; no distinct AI visual language | S |
| `ProfileScreen` (686 L) | Fair | Long stack of equally weighted rows; flat `paddingBottom: 24` under floating bar | S |
| `RequestsScreen` (414 L) | Poor | Generic card list; 24 px bottom pad under floating bar; status chips compete with amber accents | S |
| `EngineerProfileScreen` (543 L) | Fair | Hero portrait + stacked panels; sticky CTA area padded `+90` (different from Home's `+24`) | S |
| `SearchScreen` (390 L) | Fair | Two separate scroll containers and paddings; no empty-result design language beyond shared component | S |
| `ServicesScreen` (263 L) | Fair | Card grid is fine structurally; inherits 14 distinct radii | S |
| `ServiceProvidersScreen` (244 L) | Fair | Same | S |
| `MessagingScreen` / `ChatScreen` | Fair | Bubbles are conventional; timestamp/failed-send states not visually verified | S |
| `NotificationsScreen` (248 L) | Fair | Rows not grouped by day (the Professional app does group — inconsistent) | S |
| `RequestDetailScreen` | Fair | Dense; status + timeline + actions share weight | S |
| `ServiceRequestDetailScreen` | Fair | Shares `JourneyPanel`; visual states for 8+ journey stages not designed as a set | S |
| `MapPreviewScreen` | Fair | Works; no distinct map surface styling | S |
| `SavedScreen` (69 L) | Weak | Thinnest screen in the app; `paddingBottom: insets + xl` — a fourth strategy | S |
| `SettingsScreen` | Fair | Plain rows | S |
| `HelpScreen`, `PlatformHistoryScreen` | Fair | Plain | S |
| `SplashScreen` | Weak | **Hard-coded 3.2 s minimum** (`MINIMUM_SPLASH_MS = 3200`) on every cold start, plus a 280 ms fade, showing an 837 KB logo. The app is ready long before it lets the user in. | S, D |
| `ProfileSetupModal` (226 L) | Fair | Modal styling differs from `BottomSheet` | S |

### Professionals app (17 screens, 30 components)

| Screen | V | What is wrong | E |
| --- | --- | --- | --- |
| `HomeScreen` (585 L) | Fair | Task-first pass landed, but still no "today" visual anchor; 4 refresh intervals of 15 s hammer the API | S, D |
| `RequestsScreen` (566 L) | Fair | Tabs + filters + cards; density unverified at 320 px | S |
| `RequestDetailScreen` (834 L) | Fair | Largest file in the app; engineering and service variants interleaved | S |
| `AccountAccessScreen` (762 L) | Fair | Same segment-control problem as Client | S |
| `PublicProfilePreviewScreen` (695 L) | Weak | 9 lint warnings; built from raw sections, least designed screen | D |
| `ProfileScreen` (543 L) | Fair | Long stack | S |
| `ProfessionalSetupScreen` (568 L) | Fair | Dense form; long-form ergonomics unverified | S |
| `ScheduleScreen` (469 L) | Fair | Presets only; calendar-style overview absent | S |
| `VerificationDocumentsScreen` (419 L) | Fair | Best of the forms (document states are real) | S |
| `ProfessionalTypeScreen` | Fair | Cards are tall; second option below the fold at 320 (documented and partly fixed) | P |
| `ChatScreen`, `MessagesScreen`, `NotificationsScreen` | Fair | Notifications do group by day here — inconsistency with Client | S |
| `ReviewsScreen`, `MapPreviewScreen`, `NotificationSettingsScreen`, `IdentitySetupScreen` | Fair | Plain | S |

### Admin console

| Area | V | What is wrong |
| --- | --- | --- |
| Login | Fair | Two-column marketing panel on the left; fine but generic |
| Dashboard | Good | Actually the most considered screen in the whole project — metric cards, attention list, role breakdown |
| Verifications | Fair | Solid split-view pattern; small type (`.64rem` badges, `.7rem` labels) |
| Users | Fair | Reasonable |
| Activity | Fair | Table-less list, no filters |
| Settings | Fair | Fine |
| **Missing** | — | No service-request operations, no messaging moderation, no payments/payouts, no analytics |

**Notable inversion:** the *admin console* (vanilla CSS, 1,407 lines) has a more coherent visual system than the two React Native apps that carry 134 components between them. Its tokens are semantic and consistent. That tells you the problem is not "web vs mobile" — it's that the mobile code accumulated screen-by-screen.

---

## 5. What to do — prioritised

### P0 — before touching a single style (this week)

1. **Initialise version control at the root.** `git init`, commit the current tree as the baseline, then commit the 71 pending changes in `apps/client-mobile`. Without this, a redesign has no rollback and no review. Sub-item: decide whether `apps/client-mobile/.git` becomes a submodule or is folded into the root history — **do not** delete it before the baseline is safe.
2. **Move secrets out of the tree.** `NAHTREEK-preview-demo-credentials.json`, `apps/api/.env`, `apps/admin-web/.env.local`. Keep them in a password manager / hosting secret store. Add an uppercase-safe ignore rule (`**/[Nn]ahtreek-preview-*.json`).
3. **Fix the tab-bar overlap.** Single source of truth: export `useTabBarHeight()` and use it in every tab screen's `contentContainerStyle`. Change the six ad-hoc paddings (`+24`, `+34`, `+40`, `+90`, `+104`, flat `24`) to one value.
4. **Fix `AppHeader`'s fake back button** — if `onBack` is absent, use `navigation.goBack()` when it can, and render a Home affordance only when it cannot.
5. **Cut the 3.2 s splash minimum** to ~600 ms (or remove it; hydrate behind the first frame). This is the very first thing every user experiences and it currently tells them the app is slow.
6. **Take a decision on the visual direction with the client before coding it** (see §7). A redesign without sign-off is how the last two attempts ended up as "substantial first pass, not signed off" (`PROFESSIONAL_UI_REDESIGN_REPORT.md`).

### P1 — rebuild the design foundation (1–2 weeks, no screen redesign yet)

6. **One token file, semantic names only.** Replace `Colors` + `ClientColors` + `ProColors` with `packages/design-system/src/tokens.ts` exporting `color`, `space`, `radius`, `type`, `elevation`, `motion`. Screen code stops importing palette names (`navyDeep`, `amberPale`) and starts importing roles (`color.text.primary`, `color.action.primary`).
7. **Delete the duplicate palettes.** `ClientColors` becomes a 10-line re-export for one release, then goes. `ProColors` same. This alone removes ~30 hex literals from screens.
8. **Add a lint guard.** ESLint `no-restricted-syntax` (or a 30-line custom script) that fails on `#[0-9A-Fa-f]{3,6}` and on numeric `fontSize`/`borderRadius` literals inside `src/screens` and `src/components`. This is the only thing that stops the drift from coming back.
9. **Add a hidden component gallery screen** (`__DEV__` only, reachable from Settings): every button variant, card, input, chip, empty state, toast, sheet, at normal and `fontScale 1.3`. This is the cheapest possible defence against "each screen looks slightly different".
10. **Take a typography decision** (see §7) and implement the 7-step scale everywhere. This is the single highest-leverage visual change.

### P2 — redesign the three always-visible surfaces (1 week)

11. **App bar**: flat, no rounded navy slab, no amber screen titles.
12. **Tab bar**: full-width, no floating margins, no amber block behind the icon, label ≥ 11 px, one active colour.
13. **Home**: remove the marketing hero from the first viewport. Start with greeting + location + search, then the two service choices, then real recent activity. Keep at most one promotional element, below the fold.

Three surfaces, ~500 lines, and the perceived quality of *every* screen in both apps changes, because every screen inherits the chrome.

### P3 — component and screen pass (2–3 weeks)

14. Button hierarchy: one primary per screen. Right now yellow is used for the *Login* segment, the primary CTA, the tab indicator and icon tints — so nothing is primary.
15. Card hierarchy: flat section cards on canvas, raise only interactive/selected content. Remove coloured shadows (`Shadows.amber`, `Shadows.gold` are pure decoration).
16. One icon set at two sizes (20 / 24), outlined only.
17. Unify loading / empty / error / offline into one component with four tones, and make sure every screen uses it.
18. Then screen-by-screen: Requests, Discovery, Profile, Chat, Notifications (Client); Requests, Detail, Public Profile (Pro).

### P4 — performance and polish

19. Compress images to WebP at 2× display size, delete the **10 unreferenced assets (6.9 MB)**, dedupe identical files. Target: `src/assets` < 3 MB, APK < 25 MB.
20. Add crash reporting (Sentry or equivalent) before any external release.
21. Add screenshot regression: a Maestro flow that opens 8 screens and diffs against `artifacts/` baselines at 320 and 412 px. You already have the manual equivalent — automate it.
22. Add dark mode **only after** P1–P3 land, because semantic tokens make it a weekend; before them it is a rewrite.

---

## 6. What NOT to do

These are drawn from mistakes already visible in the codebase and in `docs/`.

1. **Do not redesign screen-by-screen starting from the uglies.** Every previous pass did this (`TASK_FIRST_REDESIGN.md`, `PROFESSIONAL_UI_REDESIGN_REPORT.md`), and each pass left the app *more* inconsistent, because the tokens were still duplicated. Foundation first.
2. **Do not add a fourth theme layer.** The correct move is fewer files. A new `theme/v3.ts` on top of `design-system` + `tokens.ts` + `professionalTheme.ts` is how you got here.
3. **Do not adopt a heavy UI kit** (React Native Paper, gluestack, Tamagui) as a shortcut. It would rewrite 134 components, break the shared `mobile-ui` contract, fight the existing navigation theming, and take longer than the token rebuild. Use the existing components, restyled.
4. **Do not throw away the navy/yellow brand.** The brand is not the problem; the *quantity* of yellow and the *amber-on-navy title* are. Keep the palette, reassign its roles.
5. **Do not delete or loosen the visual tests** to make a restyle pass. `apps/client-mobile/__tests__/visualConsistency.test.tsx` asserts specific contrast ratios and specific header metrics (48×48 nav target, `gap: 12`, `flex: 1` title); `responsiveControls.test.tsx` asserts the 48 px minimum button height. If the new design changes those numbers, **change the test in the same commit with a written reason**. Do not delete the file.
6. **Do not change API routes, request state machines, quotation rules, verification rules, location permissions or Socket.IO behaviour** in a design branch. `PROFESSIONAL_UI_REDESIGN_AUDIT.md` already states this boundary; honour it.
7. **Do not introduce fake data to make a screen look fuller.** The project has an explicit rule about this and the `offlineCatalogue` still carries legacy fixture IDs that had to be cleaned up once already.
8. **Do not ship a design change without device screenshots** at 320 / 360 / 412 px and `fontScale` 1.0 / 1.3, in empty, loading, error and populated states. Source type-checks proved nothing last time — that is why the reports say "not visually certified".
9. **Do not add a custom font and a native rebuild in the same release as a bugfix.** Font linking needs its own APK build and a glyph-fallback check (₹, Devanagari, long names).
10. **Do not use type below 11 px, tracking above 1.0 on small screens, coloured shadows, decorative gradients, or stock photography as personal data.** All four are currently present.
11. **Do not copy the admin console's visual language into mobile.** It is more coherent, but it is a dense desktop console; its `.64rem` badges and 4-px-left-accent metric cards do not belong on a phone.
12. **Do not chase dark mode, animation, or a new logo before the type/spacing/colour foundation is stable.** Those are the visible "modern" signals people *notice last*.
13. **Do not leave P0 items 1–2 undone while redesigning.** Working without version control on a 3.5 GB tree with API keys in it is the largest single risk in this project.

---

## 7. The design direction to propose to the client

The client's complaint is legitimate and needs a *direction decision*, not more polish. Two coherent options:

### Option A — "Calm marketplace" (recommended)

Keeps the brand, removes the noise. The app should look like a trustworthy services marketplace, not a fintech app.

- **Primary action = navy**, white label. **Amber becomes an accent**: the one hero CTA, the active nav tint, and small status highlights. This single inversion removes the "everything is yellow" feel.
- **App bar**: flat white/neutral surface, 17 px semibold title, 44 px back chevron, 1 px bottom border. Brand mark small, top-left. No navy slab, no rounded corners, no amber title.
- **Tab bar**: full width, white surface, 1 px top border, 11–12 px label, active = navy icon + navy label, inactive = `#8A94A6`. No floating pill, no tinted block.
- **Type**: one family, two weights + one display weight, **7 sizes**: 30 / 22 / 17 / 15 / 13 / 11 / 10 (display / title / card / body / meta / label / micro). Default = system font in Phase 1; Inter or Manrope in Phase 2 as its own build.
- **Radius**: `8 / 12 / 16 / 24 / pill`. Nothing else.
- **Spacing**: `4 / 8 / 12 / 16 / 24 / 32 / 48`. Nothing else.
- **Colour**: one navy `#0F2743`, one amber `#E9AE45`, one canvas `#F5F6F8`, one border `#E6E8EC`, three text tones, four semantic pairs. That is 12 values total, replacing 74.
- **Elevation**: flat by default; one raised level for sheets/dialogs. No coloured shadows.
- **Cards**: 16 radius, 1 px border, no shadow, 20 px padding, 16:10 imagery at 12 radius.
- **Home**: greeting + location + search in the first 120 px, then *Services / Engineers* as two large flat rows, then recent activity. Promotional content only below the fold.

### Option B — "Bold brand"

Deeper navy, oversized amber, editorial photography, high-contrast type. More memorable, harder to keep usable at 320 px and large font sizes, and higher risk: it needs photography art direction the project does not currently have (its images are stock/AI-generated and inconsistent in temperature).

**Recommendation: Option A.** It is lower risk, it fixes the client's actual complaint (noise, not blandness), and it can be delivered in the P1–P3 window above without touching any API contract. Do not start coding it until the client says "that one".

---

## 8. Measurable definition of "modern" for this project

A future reviewer should be able to check these in five minutes:

1. `grep -r "#[0-9A-Fa-f]\{6\}" apps/*/src` returns **only** hits inside `packages/design-system`.
2. Distinct `fontSize` values across both apps: **≤ 7**. Distinct `borderRadius`: **≤ 5**.
3. No screen labels text below **11 px** and no all-caps label above `letterSpacing: 1.0`.
4. No content is covered by the tab bar on any tab screen at 320 px / `fontScale` 1.3.
5. Every screen renders in 4 states: populated, loading, empty, error — using one shared component.
6. Contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text, verified by test (the existing contrast test is a good start — extend it).
7. `src/assets` **< 3 MB**, APK **< 25 MB**.
8. All 216 existing checks still pass, plus the new screenshot flows.

---

## 9. What I could not verify

- No device/emulator run: sign-in screens, chat bubbles, journey stages, map rendering and push are **source-only** verdicts.
- No accounts, so no end-to-end booking/payment path was exercised.
- `apps/api/.env` and `apps/admin-web/.env.local` were deliberately **not read**; I only confirmed they exist.
- Whether the AI planner is currently served by a hosted provider or the guided fallback depends on env values I did not inspect.
- iOS: both apps have `ios/` folders, but no `Pods/` — iOS has never been built on this machine, and the existing docs state the live-location feature is Android-only.

---

## 10. One-paragraph summary for the client

The platform is technically healthy — 216 automated checks pass, both apps compile, the API is sensibly guarded, and the workflow logic is real. The UI complaint is a **design-system problem, not a screen problem**: the app has 116 hard-coded type sizes across 20 values, 74 raw colour literals across three competing palettes, 20 corner radii, two icon systems, three different bottom-bar padding strategies (one of which hides content under the tab bar), and no custom typeface at all. Two previous redesigns reordered content but never replaced the foundation, which is why the result still reads as dated. The fix is: version-control the project, then rebuild one semantic token layer and the three always-visible surfaces (app bar, tab bar, home) before touching individual screens — and get the client to sign off on the *direction* first.
