# NAHTREEK Client — Feature Parity Matrix

| Feature | Old APK | Required in New App | Improvement | Implementation Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Login / Register | Present with OTP and offline profile flow | Yes | Validation, session restore, API environments, accessible errors | In progress | Client-only |
| Home | Present with search, hero cards, stats, categories | Yes | Real recommendations, request/saved shortcuts, resilient states | In progress | Reference audited |
| Engineers discovery | Present with sort/filter chips and cards | Yes | Server-backed filters, debounce, stable IDs, optimistic saves | In progress | Existing client foundation retained |
| Search | Present in Home header | Yes | Global search, suggestions, recent searches, no-results/retry | In progress | Needs dedicated search state |
| Professional profile | Present | Yes | Portfolio, availability, reviews, honest verification | In progress | Existing screen foundation retained |
| Saved professionals | Present through profile/discovery | Yes | Persistent API-backed save/unsave with rollback | In progress | Existing query hooks available |
| Request creation | Present through professional flow | Yes | Clear requirements, confirmation, request ID, next step | In progress | Existing consultation flow available |
| Requests tracking | Present with status timeline and actions | Yes | Backend state machine, segmented filters, detail center | In progress | Existing request cards available |
| Messaging | Present with conversation list and support card | Yes | Request-linked conversations, retry, offline, reconnect | In progress | Existing query/socket foundations available |
| Notifications | Present from Home header | Yes | Read state, mark all, retry, deep links | In progress | Existing screen foundation retained |
| Reviews | Present after completed interactions | Yes | Eligibility and duplicate-review enforcement | In progress | Backend contract required |
| Client profile | Present with settings sections | Yes | Real settings, persisted data, safe logout | In progress | Existing screen foundation retained |
| Location | City shown and selectable | Yes | Permission-aware current/manual selection and fallback | In progress | City store exists |
| Offline behavior | Present in login and data fallback | Yes | Explicit network state and safe retry behavior | In progress | Do not hide sync limitations |
| Accessibility | Partial labels in APK | Yes | Labels, focus order, touch targets, contrast | In progress | Applied during migration |
| Android release | APK available | Yes | Reproducible release build and environment config | In progress | Java 23/Gradle 8.8 build verified |
