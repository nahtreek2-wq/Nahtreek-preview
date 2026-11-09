# Deployment

Release order: provision PostgreSQL; configure secrets; run the committed Prisma migration; generate Prisma client; deploy the API over TLS; inject `NahtreekRuntimeConfig.apiBaseUrl` into iOS/Android builds; then run smoke tests for OTP, session rotation/logout, Client ownership, request state, and Socket.IO chat.

Do not deploy with the sample seed, an unset mobile API base, absent `SMS_API_KEY`, or tokens stored in AsyncStorage. For multi-instance API deployments, add a Socket.IO adapter/pub-sub backend before relying on cross-instance realtime delivery.
