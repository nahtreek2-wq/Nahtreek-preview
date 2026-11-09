# End-to-end data flows

## Professional registration and approval

1. A professional account is created and assigned either `ENGINEER` or
   `SERVICE_PROVIDER`.
2. The professional app saves identity, work area and capabilities through
   `PUT /professionals/me`.
3. The professional uploads required proof through
   `POST /professionals/me/verification-documents`.
4. Engineers provide identity, address and qualification proof. Service
   providers provide identity, address and work proof.
5. `POST /professionals/me/verification/submit` validates completeness and
   changes the profile to `UNDER_REVIEW`.
6. The admin queue reads this database profile and its private documents.
7. An administrator approves/rejects each document and then the profile. The
   final profile approval is blocked until all required document types are approved.
8. The professional app reads the updated status and shows `VERIFIED` or the
   rejection state/reason after refresh.
9. Only a `VERIFIED`, active profile is returned to the client app. Availability
   is shown separately and is enforced when a client creates a request.

## Client request to professional

1. The client selects an approved professional and creates a request.
2. The API validates role, professional visibility, service match and request data.
3. One database record is linked to the client and professional profile IDs.
4. The same record appears in the client's history and the selected
   professional's inbox.
5. Allowed status transitions append immutable history and create notifications.

## Environment isolation

Preview data reaches only the preview admin and preview apps. Production data
reaches only production systems. Records do not cross databases. Behavior is the
same because both environments run the same source and schema.
