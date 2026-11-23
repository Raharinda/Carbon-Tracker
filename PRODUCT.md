# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

- **Primary users:** The embedded-systems student/developer team building, testing, and operating the ESP32 + PZEM-004T energy monitor prototype.
- **Secondary evaluators:** Lecturers, project reviewers, and classmates observing live hardware demonstrations or exploring the app on a phone without hardware via demo mode.

## Product Purpose

Carbon Tracker is the mobile companion app for an ESP32 + PZEM-004T + mains relay energy monitor (`sisnam`). It translates live electrical readings from a single AC load into real-time power draw, estimated electricity cost in Indonesian Rupiah (`Rp`) against a monthly budget, and estimated CO₂ emissions (`kg CO₂e`), while allowing remote relay switching. Success means a user or evaluator can inspect live load behavior, toggle the physical relay reliably, and understand cost and carbon impact both when connected to hardware and in zero-hardware demo mode.

## Positioning

An end-to-end open-hardware embedded-systems monitor pairing a low-cost ESP32 + PZEM-004T + optocoupled relay node with an Android-first Expo app pre-calibrated for Indonesian PLN residential tariff (`Rp 1,444.7/kWh`) and Indonesian grid emission factor (`0.87 kg CO₂e/kWh`). Unlike cloud-locked commercial smart plugs, it exposes raw electrical telemetry alongside cost and CO₂ estimates, keeps the hardware transport behind a swappable `DeviceRepository` boundary, and includes a built-in simulated demo stream so the full app works without plugged-in hardware.

## Operating Context

- **Hardware bench & live demonstrations:** Paired with a single physical ESP32 + PZEM-004T + relay test rig switching a real AC load over WiFi and Firebase Realtime Database / Firestore.
- **No-hardware evaluation:** Run with `EXPO_PUBLIC_DEVICE_SOURCE=mock` using the login screen's demo entry (`Explore with demo data`) when the ESP32 rig is offline or unavailable.
- **Hardware provisioning:** First-boot WiFi setup runs outside the app via the ESP32 captive portal (`CarbonTracker-Setup`, `http://192.168.4.1`) and PlatformIO serial commands (`ON`, `OFF`, `WIFI`, `RESETWIFI`).
- **Mains safety context:** The physical relay switches live AC mains voltage; users rely on the app to understand whether the connected load is energized or disconnected.

## Capabilities and Constraints

- **Single-device scope:** Tracks one paired device at a time (default ID `esp32_01`, editable in Settings). Multi-device management is out of current scope.
- **Core screens and workflows:**
  - `/login`: Firebase Email/Password authentication plus in-memory demo entry when mock source is active (reloading returns to `/login`).
  - `/` (Home): Live power readout (gauge ceiling 1,000 W), today's estimated cost and projected monthly spend against monthly budget, today's and weekly CO₂ estimate, quick relay toggle, and 7-day energy chart.
  - `/control` (Device control): Online/offline connection status, relay state and toggle, last reading timestamp, and electrical metrics (voltage, current, power factor, frequency).
  - `/carbon` (Carbon detail): Today/week/month CO₂ totals, 7- or 30-day emissions chart, and active emission-factor reference.
  - `/settings` (Settings): Device ID, electricity tariff (`Rp/kWh`), emission factor (`kg CO₂e/kWh`), monthly budget (`Rp`), and sign out.
- **Hardware & sync constraints:**
  - PZEM-004T is read every 2 s and pushed to Firebase RTDB every 4 s; readings are treated as online while younger than 30 s.
  - Relay commands are polled by the ESP32 every 2 s; the app toggles optimistically with rollback on write failure, while physical actuation follows within ~2 s.
  - On ESP32 boot/power cycle, the relay pin initializes LOW (OFF) and writes `relay = false`.
  - Daily energy rollups derive reset-safe deltas from cumulative PZEM kWh and write to Firestore `dailyHistory` at most once per 60 s while the app is open.
  - Firmware publishes `relayState` (actual GPIO26 state), but the app currently reads and writes `relay` only.
- **Language & regional defaults:** English UI copy paired with `id-ID` number/date formatting, IDR (`Rp`) currency, default tariff `Rp 1,444.7/kWh`, default emission factor `0.87 kg CO₂e/kWh`, and default monthly budget `Rp 300,000`.
- **Technical boundary:** Monorepo with Expo SDK 58 / React Native (`apps/mobile`, workspace `@carbon-tracker/mobile`) and separate PlatformIO firmware (`apps/firmware/esp32-carbon-tracker`). Expo Go compatibility is currently preserved (no custom native modules required beyond bundled Expo packages).
- **Undecided / out of current scope:** Multi-device support, Bahasa Indonesia UI localization, displaying physical `relayState` feedback separately from `relay` command state, and public Play Store distribution.

## Brand Commitments

- **Product name:** Carbon Tracker (slug `sisnam`, Android package `com.raharinda.sisnam`).
- **Voice & copy:** Concise, direct English product copy paired with Indonesian currency (`Rp`) and local grid/tariff figures.
- **Existing assets:** App icon, Android adaptive icon layers, splash icon, and favicon in `apps/mobile/assets/images/` (and `apps/mobile/assets/expo.icon/`).

## Evidence on Hand

- Working Expo mobile app (`apps/mobile/src/`) with five routes, unit tests covering cost/energy, carbon, relay store rollback, settings validation, and dates, plus simulated telemetry (`apps/mobile/src/features/device/services/mockDeviceRepository.ts`).
- Working ESP32 + PZEM-004T + relay firmware (`apps/firmware/esp32-carbon-tracker/src/main.cpp`) and hardware/Firebase setup documentation (`apps/firmware/README.md`).
- Calibrated Indonesian residential defaults (`apps/mobile/src/shared/lib/constants.ts`).
- **Absences (do not fabricate):** No external customer testimonials, field-study savings claims, third-party carbon certifications, or multi-household usage benchmarks exist.

## Product Principles

1. **Surface hardware truth honestly:** Make telemetry freshness (30 s online threshold), update cadence, and pending/offline states clear so operators and evaluators never mistake stale or simulated data for live hardware readings.
2. **Keep demo mode first-class and unambiguous:** The app must remain immediately demonstrable without an ESP32 attached while clearly distinguishing simulated data from live Firebase hardware.
3. **Turn raw electrical telemetry into everyday impact:** Pair technical PZEM-004T figures (W, V, A, PF, Hz, kWh) with clear Indonesian Rupiah cost, budget progress, and `kg CO₂e` context.
4. **Make AC load control unmistakable:** Switching mains power through a relay requires clear current state, pending feedback during the ~2 s actuation loop, and explicit error recovery on failure.
5. **Stay focused on one paired node:** Keep navigation, settings, and status centered on a single ESP32 monitor rather than adding multi-home fleet complexity before it is needed.
