# Project layout — preview tree (testing)

```text
Nahtreek-preview/
├── apps/
│   ├── preview-Home/     Home app source (src/ shared; android/ + ios/ native shells)
│   ├── preview-Pro/      Professional app source (same split)
│   ├── preview-Api/      Backend API (staging env)
│   └── preview-Admin/    Admin website source (staging)
├── packages/             Shared code (UI, design, maps, push, types…)
├── builds/               THE installable outputs — one place only
│   ├── android/          Nahtreek-Home.apk + Nahtreek-Pro.apk
│   ├── ios/              Nahtreek-Home.app (simulator)
│   └── admin/            Built admin panel (staging)
├── docs/                 Guides: home.md, professional.md, preview-v2/, shared topics
├── deployments/preview/  Preview deploy notes
└── CODEBASE.md           Build commands index
```

Rules: source lives in `apps/`; installables live in `builds/` only;
Android + iOS sources stay together (they share `src/`) while their
outputs stay split (`builds/android/` vs `builds/ios/`). Mirror every
change to the production tree at the same relative path.
