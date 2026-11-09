# Notifications

Bookings, status changes, messages and verification decisions create persisted `Notification` rows. Users can list and mark only their own notification history.

Android Firebase registration, notification permission handling, generic background alerts and a backend delivery worker are implemented. Preview Firebase configuration is present; scheduled delivery and device testing are still pending. APNs/iOS delivery is not implemented. See [Firebase setup and acceptance checks](../../operations/FIREBASE_PUSH_SETUP.md).
