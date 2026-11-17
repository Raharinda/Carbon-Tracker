# ESP32 firmware — Carbon Tracker

PlatformIO project for the ESP32 + PZEM-004T + relay node. It publishes live readings to Firebase Realtime Database and polls the app's relay command.

```
apps/firmware/
  esp32-carbon-tracker/
    platformio.ini
    include/
      secrets.example.h   # template, safe to commit
      secrets.h           # your credentials, gitignored
    src/
      main.cpp
```

## Hardware

| Signal            | ESP32  | Notes                                      |
| ----------------- | ------ | ------------------------------------------ |
| PZEM 5V           | 5V/VIN | PZEM-004T needs 5 V                        |
| PZEM GND          | GND    | Common ground with ESP32                   |
| PZEM TX           | GPIO16 | UART2 RX                                   |
| PZEM RX           | GPIO17 | UART2 TX                                   |
| Relay IN          | GPIO26 | Active HIGH (HIGH = ON)                    |
| Relay VCC / GND   | 5V/GND | Use a relay module with an optocoupler     |
| AC load           | COM/NO | Mains wiring — see the safety note below   |

> ⚠️ The relay switches mains voltage. Wire it unplugged, use a properly rated module and enclosure, and never touch the board while it is connected to AC.

## Build and flash

1. Install [PlatformIO](https://platformio.org/install) (VS Code extension or `pip install platformio`).
2. Create your secrets file:

   ```powershell
   cd apps\firmware\esp32-carbon-tracker
   copy include\secrets.example.h include\secrets.h
   ```

   On macOS/Linux use `cp include/secrets.example.h include/secrets.h`.

3. Fill `include/secrets.h`:
   - `API_KEY`: Firebase Web app API key.
   - `USER_EMAIL` / `USER_PASS`: a dedicated Email/Password account.
   - `DATABASE_URL`: your RTDB URL, with a trailing slash.
   - `DEVICE_ID`: must match the app's Device ID (`esp32_01` by default).
4. Build, flash, and open the serial monitor:

   ```bash
   pio run
   pio run --target upload
   pio device monitor
   ```

5. On first boot, connect to `CarbonTracker-Setup` (password `carbon123`) and open `http://192.168.4.1` to enter your WiFi. Credentials are stored by WiFiManager.

Serial commands: `ON`, `OFF`, `WIFI`, `RESETWIFI`.

## Firebase setup

1. **Authentication → Sign-in method**: enable **Email/Password**, then create the device user under **Users**.
2. **Realtime Database**: create the database and set rules. The database should not be publicly readable:

   ```json
   {
     "rules": {
       ".read": false,
       ".write": false,
       "devices": {
         "$deviceId": {
           ".read": "auth != null",
           ".write": "auth != null"
         }
       }
     }
   }
   ```

3. **Firestore** (used by the app for daily rollups): keep it enabled and add rules for the signed-in app user, for example:

   ```json
   {
     "rules": {
       "devices": {
         "$deviceId": {
           "dailyHistory": {
             "$date": {
               ".read": "auth != null",
               ".write": "auth != null"
             }
           }
         }
       }
     }
   }
   ```

4. In the app, set `EXPO_PUBLIC_DEVICE_SOURCE=firebase` in `apps/mobile/.env.local`, restart with `cd apps/mobile && npx expo start -c`, and sign in with a Firebase account.

## Data contract

The firmware writes:

```
devices/{DEVICE_ID}/readings    { voltage, current, power, energy, frequency, pf, ts }
devices/{DEVICE_ID}/relay       true | false   (command + last confirmed command)
devices/{DEVICE_ID}/relayState  true | false   (state actually applied to GPIO26)
devices/{DEVICE_ID}/settings    { tariff, emissionFactor, monthlyBudget }  (written by the app)
```

The firmware never touches `settings`; the app writes tariff, emission factor, and budget there.

- PZEM is read every **2 s**, readings are pushed every **4 s**.
- `ts` is epoch seconds and is only included once NTP has synced.
- The relay command is polled every **2 s**. The app's optimistic toggle confirms as soon as its write to `relay` lands; the physical relay follows within about 2 s.
- The app currently reads `relay` as both command and confirmed state. `relayState` is the physical feedback and is published for monitoring/future use.
- On boot the pin is driven LOW (OFF) and the firmware writes `relay = false`, so the app shows the relay as off after a power cycle.

## Security

- **Never commit `include/secrets.h`.** It is gitignored; only `secrets.example.h` is tracked.
- Use a strong, unique password for the device account. A password that has been shared or committed must be rotated immediately in Firebase Console → Authentication.
- `ssl_client.setInsecure()` skips certificate validation for development. For production, install the Firebase root CA and remove `setInsecure()`.
- Lock down RTDB and Firestore rules as shown above. This project's RTDB was publicly readable during setup.
