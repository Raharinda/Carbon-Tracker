# Carbon Tracker

Minimalist Expo app for an ESP32 + PZEM-004T energy monitor. It shows live power, estimated cost, weekly energy use, relay control, and estimated CO₂ emissions.

Built with Expo SDK 58 (React Native 0.88), TypeScript strict mode, Expo Router, Zustand, NativeWind, react-native-svg, and Firebase.

## Repository layout

npm-workspaces monorepo with two independent toolchains:

```
sisnam/
  apps/
    mobile/               # Expo app (workspace @carbon-tracker/mobile)
      src/
      assets/
      app.json
      package.json
    firmware/             # ESP32 + PZEM-004T firmware (PlatformIO)
      esp32-carbon-tracker/
        platformio.ini
        src/main.cpp
        include/secrets.example.h
  package.json            # workspaces + root scripts
```

`node_modules` is hoisted to the repository root. The firmware is not part of the npm workspace or the Metro/TypeScript build. See [`apps/firmware/README.md`](apps/firmware/README.md) for wiring, flashing, and Firebase rules.

## Run it

```bash
npm install
copy apps\mobile\.env.example apps\mobile\.env.local   # macOS/Linux: cp
npm start
```

`npm start` starts Expo from `apps/mobile`. For app-specific tooling, work inside that folder:

```bash
cd apps/mobile
npx expo install <package>   # resolves SDK-compatible versions
npx expo start -c            # start with a cleared cache
```

The app runs **without hardware** by default: `EXPO_PUBLIC_DEVICE_SOURCE=mock` streams simulated readings, and the login screen offers **Explore with demo data**.

To use the real device:

1. Set `EXPO_PUBLIC_DEVICE_SOURCE=firebase` and fill the Firebase values in `apps/mobile/.env.local`.
2. Sign in with a Firebase email/password account that can read/write the device paths.
3. Set the device key (default `esp32_01`) under **Settings**.

Scripts:

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint (Expo + import sorting + Prettier)
npm test              # Jest unit tests
npm run format        # Prettier write
npm run firmware:build   # PlatformIO build for the ESP32 node
npm run firmware:upload  # flash the ESP32
npm run firmware:monitor # serial monitor
```

The `firmware:*` scripts require PlatformIO (`pio`) on your PATH.

> Expo Go includes `react-native-svg`. If you later add a library with custom native code, use a development build (`cd apps/mobile && npx expo run:android`, `npx expo run:ios`, or `eas build --profile development`).

## Screens

| Route       | Purpose                                                                    |
| ----------- | -------------------------------------------------------------------------- |
| `/`         | Home: live power dial, today's cost, CO₂ today, relay toggle, weekly chart |
| `/control`  | Device Control: connection, relay, voltage/current/power factor/frequency  |
| `/carbon`   | Carbon Detail: today/week/month emissions, 7- or 30-day chart              |
| `/settings` | Tariff, emission factor, monthly budget, device ID, sign out               |
| `/login`    | Email/password sign-in plus demo entry when the mock source is enabled     |

## Architecture

Feature-first modules; routes are thin and only compose feature APIs.

```
apps/mobile/src/
  app/                    # expo-router routes (no business logic)
  features/
    device/               # hardware boundary: repository interface + Firebase/mock
      services/           # DeviceRepository, FirebaseDeviceRepository, MockDeviceRepository
      hooks/              # useDeviceStream, useDeviceStatus
      store/              # live snapshot store
      utils/              # freshness/connection helpers
    energy/               # power, kWh, cost, weekly series
    relay/                # optimistic relay toggle + rollback
    carbon/               # emission calculations and chart series
    settings/             # tariff, emission factor, budget, device ID
  shared/
    components/           # Button, Card, Text, Input, Toggle, charts, icons…
    theme/                # tokens.js: colors, spacing, radii, typography
    lib/                  # firebase client, constants, formatters, dates, auth
    hooks/                # useNow, useRequireAuth
    types/                # shared primitives
```

Dependency rule: `shared/` never imports `features/`. Features expose a public API through `index.ts`; cross-feature imports go through that index (enforced by ESLint `no-restricted-imports`). There are no circular dependencies.

### Data flow

```
ESP32 + PZEM ──► Firebase RTDB ──► FirebaseDeviceRepository ──► deviceStore
                                                                    │
                          ┌─────────────────────────────────────────┤
                          ▼                                         ▼
                    energyStore ──► useEnergySummary ──► Home/Control
                          │
                          ▼
                  useCarbonSummary ──► Carbon screens

UI action ──► useRelayControl ──► relayService ──► repository.setRelay()
                 │ optimistic update + rollback on failure
                 ▼
             relayStore
```

- **Services own I/O.** Components and stores never touch Firebase.
- **Pure calculations** live in `features/*/utils` (`calculateCost`, `calculateCarbon`, `buildUsageWindow`, …) and are unit tested with no React or Firebase imports.
- **Hooks** connect services, stores, and UI.
- **One Zustand store per feature**, read through selectors.

### Swapping the backend

`features/device/services/deviceRepository.ts` defines the hardware boundary:

```ts
interface DeviceRepository {
  subscribeDevice(...);
  subscribeDailyUsage(...);
  subscribePreferences(...);
  setRelay(...);
  recordUsage(...);
  savePreferences(...);
}
```

Implement that interface (REST, MQTT, BLE) and select it in `features/device/services/index.ts`. No UI, hook, or store changes are required.

## Firebase schema

Realtime Database:

```
devices/{deviceId}/readings   { voltage, current, power, energy, frequency, pf, ts }
devices/{deviceId}/relay      true | false
devices/{deviceId}/settings   { tariff, emissionFactor, monthlyBudget }
```

The firmware also publishes `devices/{deviceId}/relayState` (the state actually applied to the relay pin). The app uses `relay` as the command and confirmed state.

Firestore (daily rollups written at most once per minute):

```
devices/{deviceId}/dailyHistory/{yyyy-mm-dd}
  { date, startEnergy, endEnergy, energy, cost, emission, updatedAt }
```

`energy` is the PZEM cumulative energy; daily kWh is derived from the delta between readings and is reset-safe.

## Design system

- Light theme, soft green accent, Inter font (loaded with `expo-font`).
- All colors/spacing/radii/typography come from `apps/mobile/src/shared/theme/tokens.js`, consumed by both Tailwind and TypeScript. No color literals in components.
- 8 px spacing grid; cards use the shared `Card` component.

## Notes and defaults

- Default tariff: **Rp 1,444.7/kWh**; default emission factor: **0.87 kg CO₂e/kWh**; default budget: **Rp 300,000** (`apps/mobile/src/shared/lib/constants.ts`).
- A reading is considered online while the last snapshot is younger than **30 s**.
- Daily usage is recorded every 60 s in Firebase mode; the mock repository accumulates usage itself.
- Demo sign-in is in-memory only; reloading returns to `/login`.
- Firebase config is read from `EXPO_PUBLIC_FIREBASE_*` variables. No secrets are committed.

## Troubleshooting Firebase mode

- **The UI ignores changes made in the Realtime Database.** Check `EXPO_PUBLIC_DEVICE_SOURCE=firebase` in `apps/mobile/.env.local`, then restart with a cleared cache: `cd apps/mobile && npx expo start -c`. Expo inlines `EXPO_PUBLIC_*` values at bundle time; adding keys alone is not enough.
- **Demo button missing.** That is expected in Firebase mode. Create an Email/Password user in Firebase Console → Authentication → Users, then sign in on `/login`.
- **Device key.** The app reads `devices/esp32_01/...` by default. If your database uses another key, change **Device ID** in Settings.
- **Relay does not follow the database.** The app uses `devices/{deviceId}/relay` as both command and reported state. Firmware must watch that node. A separate `relayState` node is not read by the app.
- **Permission denied.** The signed-in user needs read/write access to `devices/{deviceId}` in RTDB rules, and read access to `devices/{deviceId}/dailyHistory` in Firestore.
- **Weekly chart empty.** Daily rollups live in Firestore; they appear after the app has been open for a minute (`recordUsage` runs every 60 s).
