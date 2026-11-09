# Messaging

One conversation links to one accepted engineer request. The API verifies request state and both participant identities before creating, joining, listing, reading, or sending. Sender identity is authenticated server-side.

Messages persist in PostgreSQL before `message:created` is emitted to an authorized Socket.IO room. REST history is the reconnect recovery path. Attachments remain unavailable until signed object-storage uploads are implemented.
