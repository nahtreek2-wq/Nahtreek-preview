# Preview service booking and maps

## Customer journey

1. The Client app lists only available, verified service providers for the chosen city and service.
2. The customer chooses one provider, describes the work, may add a preferred visit time, selects a pinned location, and supplies the house/street/landmark. Changing the location search clears the previous pin.
3. A confirmation names the provider and shows the address. The API creates one request for that exact provider, stores the description and coordinates, and creates a provider notification. The preferred time is included in the work description; it is **not** a confirmed appointment.
4. The customer can see the request timeline and message the provider. The provider can accept or decline; after acceptance, both parties confirm timing and price in chat. The provider can open the pinned map and external directions, mark work in progress, then complete it. Both parties can read status history.

The system does not automatically dispatch a replacement provider, guarantee arrival, calculate a route or ETA, or take payment. An accepted request is not a confirmed price or scheduled appointment.

## Map behavior

- Preview Android builds include a Geoapify key from each app's ignored `android/local.properties` or the `GEOAPIFY_API_KEY` build environment variable. Production release builds require that environment variable separately.
- Client address search uses Geoapify geocoding for Indian addresses and falls back to Android's geocoder if the API is unavailable. Current location uses Android's location provider and requires precise permission.
- The location screen uses a Geoapify static map with a visible center pin. This avoids the blank WebView seen on the Android emulator. Tapping Get directions opens an external interactive map; the in-app preview itself does not pan or zoom.
- Internet access, location permission, API quota, and the device's WebView can still affect results. A successful API test from a development computer does not prove the same network path works on every phone.

## Validation boundary

Client and Professional TypeScript, Jest suites, Android internal builds, Geoapify tile/static-map/geocoding HTTP checks, and seeded-account sign-in were performed. The API has an isolated PostgreSQL integration journey for verification, exact booking, chat, completion, and history; it runs only with an isolated `NAHTREEK_E2E_SCHEMA` database. A real two-phone booking and arrival test remains necessary before claiming a live operational service.
