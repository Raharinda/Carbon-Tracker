#pragma once

// Copy this file to include/secrets.h and fill in your own values.
// include/secrets.h is gitignored. Never commit real credentials.

// Firebase web app config (Project settings -> General -> Web app).
#define API_KEY "your-firebase-web-api-key"

// A dedicated Email/Password account for the device.
// Enable Email/Password in Firebase Console -> Authentication -> Sign-in method.
#define USER_EMAIL "device@example.com"
#define USER_PASS "replace-with-a-strong-password"

// Realtime Database URL, with a trailing slash.
#define DATABASE_URL "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app/"

// Device key used by the app: devices/{DEVICE_ID}/...
#define DEVICE_ID "esp32_01"

// Captive portal shown when no WiFi is saved yet.
#define WIFI_AP_SSID "CarbonTracker-Setup"
#define WIFI_AP_PASS "carbon123"
