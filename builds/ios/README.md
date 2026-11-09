# Preview iOS builds (test builds)

No binaries are checked in here — iOS test builds install via Xcode.
Both apps compile clean (verified 2026-11-09, Xcode 27.2):

- Home 1.0.0 (build 46) → `apps/preview-Home/ios/NahtreekClient.xcworkspace`
- Pro 1.0.0 (build 12) → `apps/preview-Pro/ios/NahtreekProfessional.xcworkspace`

Compile check (no signing needed):

```bash
cd ../apps/preview-Home/ios   # or ../apps/preview-Pro/ios
xcodebuild -workspace NahtreekClient.xcworkspace -scheme NahtreekClient \
  -configuration Debug -destination 'generic/platform=iOS' \
  CODE_SIGNING_ALLOWED=NO build
```

Run on a simulator from Xcode with Metro running (`npx react-native
start` in the app dir). Display names are "Nahtreek Home" /
"Nahtreek Pro" with no preview tag. Points at the preview API.
