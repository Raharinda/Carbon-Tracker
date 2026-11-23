// Carbon Tracker device node: ESP32 + PZEM-004T + relay.
//
// Publishes to Firebase Realtime Database under devices/{DEVICE_ID}:
//   readings    { voltage, current, power, energy, frequency, pf, ts }
//   relay       boolean command from the app (polled every 2 s)
//   relayState  boolean, the state actually applied to the relay pin
//
// Relay: GPIO26, active HIGH (HIGH = ON, LOW = OFF).
// PZEM:  Serial2, TX PZEM -> GPIO16, RX PZEM -> GPIO17.

#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <Arduino.h>
#include <FirebaseClient.h>
#include <PZEM004Tv30.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WiFiManager.h>
#include <optional>

#if __has_include("secrets.h")
#include "secrets.h"
#else
#error "Copy include/secrets.example.h to include/secrets.h and fill in your credentials."
#endif

#define RELAY_PIN 26
#define PZEM_RX_PIN 16 // ke TX PZEM
#define PZEM_TX_PIN 17 // ke RX PZEM

const String DEVICE_PATH = String("/devices/") + DEVICE_ID;

const unsigned long READ_INTERVAL = 2000;
const unsigned long PUSH_INTERVAL = 4000;
const unsigned long POLL_INTERVAL = 2000;
const unsigned long REQUEST_TIMEOUT = 10000;
const unsigned long INIT_RETRY_DELAY = 5000;
const unsigned long LOCAL_CMD_POLL_HOLD = 5000;

// Inisialisasi di setup() setelah Serial2 siap (ESP32 Arduino core 3.x).
std::optional<PZEM004Tv30> pzem;
WiFiManager wm;

UserAuth user_auth(API_KEY, USER_EMAIL, USER_PASS);
FirebaseApp app;
WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
RealtimeDatabase Database;

bool fbStarted = false;
bool initSent = false;
bool initRetryWait = false;
bool relaySynced = false;
bool fbReadyPrinted = false;
bool wasConnected = false;
bool hasReading = false;
bool relayOn = false;
bool getPending = false;
bool pushPending = false;
bool pollBlocked = false;

float g_v = 0, g_i = 0, g_p = 0, g_e = 0, g_f = 0, g_pf = 0;

unsigned long lastRead = 0, lastPush = 0, lastPoll = 0;
unsigned long localCmdAt = 0, getSentAt = 0, pushSentAt = 0, initFailedAt = 0;

void processData(AsyncResult &aResult);

bool isWifiConnected() { return WiFi.status() == WL_CONNECTED; }

bool isPollBlocked() {
  if (!pollBlocked) return false;
  if (millis() - localCmdAt >= LOCAL_CMD_POLL_HOLD) {
    pollBlocked = false;
    return false;
  }
  return true;
}

void applyRelay(bool on, bool pushCommand) {
  relayOn = on;
  digitalWrite(RELAY_PIN, on ? HIGH : LOW); // HIGH = ON, LOW = OFF
  Serial.println(on ? "Relay: ON" : "Relay: OFF");

  if (pushCommand) {
    pollBlocked = true;
    localCmdAt = millis(); // cegah poll/respon lama menimpa perintah lokal
  }

  if (isWifiConnected() && app.ready() && relaySynced) {
    if (pushCommand) {
      Database.set<bool>(aClient, DEVICE_PATH + "/relay", on, processData, "setRelay");
    }
    // Umpan balik: status relay yang benar-benar terpasang.
    Database.set<bool>(aClient, DEVICE_PATH + "/relayState", on, processData, "setState");
  }
}

void processData(AsyncResult &aResult) {
  if (!aResult.isResult()) return;

  String uid = aResult.uid();

  if (aResult.isEvent()) {
    if (uid == "authTask" || aResult.eventLog().code() == auth_event_error) {
      Firebase.printf("Firebase event [%s]: %s (%d)\n", uid.c_str(),
                      aResult.eventLog().message().c_str(), aResult.eventLog().code());
    }
  }

  if (aResult.isError()) {
    if (uid == "getRelay") getPending = false;
    else if (uid == "pushReadings") pushPending = false;
    else if (uid == "initRelay") {
      initSent = false;
      initRetryWait = true;
      initFailedAt = millis();
    }
    Firebase.printf("Firebase error [%s]: %s (%d)\n", uid.c_str(),
                    aResult.error().message().c_str(), aResult.error().code());
    return;
  }

  if (aResult.available()) {
    if (uid == "getRelay") getPending = false;
    else if (uid == "pushReadings") pushPending = false;

    String payload = aResult.c_str();
    payload.trim();

    if (uid == "initRelay") {
      relaySynced = true;
      Serial.println("Firebase: relay disinkronkan");
    } else if (uid == "getRelay" && !isPollBlocked()) {
      if (payload == "true" && !relayOn) applyRelay(true, false);
      else if (payload == "false" && relayOn) applyRelay(false, false);
    }
  }
}

void startFirebase() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  ssl_client.setInsecure(); // tahap pengembangan; gunakan root CA untuk produksi
  ssl_client.setConnectionTimeout(5000);
  ssl_client.setHandshakeTimeout(5);
  aClient.setNetworkStatusCallback(isWifiConnected);
  initializeApp(aClient, app, getAuth(user_auth), processData, "authTask");
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);
  fbStarted = true;
  Serial.println("Firebase: inisialisasi...");
}

void pushReadings() {
  if (!isWifiConnected() || !app.ready() || !relaySynced || !hasReading || pushPending) return;

  String json = "{";
  json += "\"voltage\":" + String(g_v, 1);
  json += ",\"current\":" + String(g_i, 3);
  json += ",\"power\":" + String(g_p, 1);
  json += ",\"energy\":" + String(g_e, 3);
  json += ",\"frequency\":" + String(g_f, 1);
  json += ",\"pf\":" + String(g_pf, 2);
  time_t now = time(nullptr);
  if (now > 1700000000) json += ",\"ts\":" + String((uint32_t)now);
  json += "}";

  pushPending = true;
  pushSentAt = millis();
  Database.set<object_t>(aClient, DEVICE_PATH + "/readings", object_t(json), processData,
                         "pushReadings");
}

void readPzem() {
  // Buang sisa byte UART agar frame Modbus 25 byte tidak desync.
  while (Serial2.available()) Serial2.read();

  float voltage = pzem->voltage();
  if (isnan(voltage)) {
    hasReading = false;
    Serial.println("PZEM: tidak ada respon (cek 5V PZEM, TX/RX, dan AC)");
    return;
  }

  float current = pzem->current();
  float power = pzem->power();
  float energy = pzem->energy();
  float frequency = pzem->frequency();
  float pf = pzem->pf();

  g_v = voltage;
  g_i = isnan(current) ? 0 : current;
  g_p = isnan(power) ? 0 : power;
  g_e = isnan(energy) ? 0 : energy;
  g_f = isnan(frequency) ? 0 : frequency;
  g_pf = isnan(pf) ? 0 : pf;
  hasReading = true;

  Serial.println("----- PZEM -----");
  Serial.printf("Voltage   : %.1f V\n", g_v);
  Serial.printf("Current   : %.3f A\n", g_i);
  Serial.printf("Power     : %.1f W\n", g_p);
  Serial.printf("Energy    : %.3f kWh\n", g_e);
  Serial.printf("Frequency : %.1f Hz\n", g_f);
  Serial.printf("PF        : %.2f\n", g_pf);
}

void handleCommand() {
  if (!Serial.available()) return;
  String c = Serial.readStringUntil('\n');
  c.trim();
  c.toUpperCase();

  if (c == "ON") {
    applyRelay(true, true);
  } else if (c == "OFF") {
    applyRelay(false, true);
  } else if (c == "WIFI") {
    if (isWifiConnected()) {
      Serial.printf("WiFi: %s, IP %s, sinyal %d dBm\n", WiFi.SSID().c_str(),
                    WiFi.localIP().toString().c_str(), WiFi.RSSI());
    } else {
      Serial.println("WiFi: belum tersambung");
    }
  } else if (c == "RESETWIFI") {
    wm.resetSettings();
    Serial.println("WiFi tersimpan dihapus. Restart...");
    delay(500);
    ESP.restart();
  } else if (c.length() > 0) {
    Serial.println("Perintah: ON, OFF, WIFI, RESETWIFI");
  }
}

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(50);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // default OFF

  pzem.emplace(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);

  WiFi.mode(WIFI_STA);
  wm.setConfigPortalBlocking(false);
  wm.setConnectTimeout(20);
  if (wm.autoConnect(WIFI_AP_SSID, WIFI_AP_PASS)) {
    Serial.println("WiFi: tersambung pakai WiFi tersimpan");
  } else {
    Serial.printf("Portal setup aktif: sambung ke WiFi %s (password %s), buka 192.168.4.1\n",
                  WIFI_AP_SSID, WIFI_AP_PASS);
  }

  Serial.println("Siap. Perintah: ON, OFF, WIFI, RESETWIFI");
}

void loop() {
  wm.process();
  handleCommand();

  bool connected = isWifiConnected();
  if (connected && !wasConnected) {
    Serial.print("WiFi: tersambung. IP: ");
    Serial.println(WiFi.localIP());
  } else if (!connected && wasConnected) {
    Serial.println("WiFi: terputus");
    getPending = false;
    pushPending = false;
    if (!relaySynced) initSent = false;
  }
  wasConnected = connected;

  if (connected && !fbStarted) startFirebase();

  if (fbStarted) {
    app.loop();

    if (connected && app.ready()) {
      if (!fbReadyPrinted) {
        fbReadyPrinted = true;
        Serial.println("Firebase: siap");
      }

      // Saat boot, Firebase disamakan dengan kondisi relay sebenarnya (default OFF).
      if (!initSent && (!initRetryWait || millis() - initFailedAt >= INIT_RETRY_DELAY)) {
        initSent = true;
        initRetryWait = false;
        Database.set<bool>(aClient, DEVICE_PATH + "/relayState", relayOn, processData, "initState");
        Database.set<bool>(aClient, DEVICE_PATH + "/relay", relayOn, processData, "initRelay");
      }

      if (getPending && millis() - getSentAt > REQUEST_TIMEOUT) getPending = false;
      if (pushPending && millis() - pushSentAt > REQUEST_TIMEOUT) pushPending = false;

      // Cek perintah relay dari Firebase.
      if (relaySynced && !getPending && !isPollBlocked() &&
          millis() - lastPoll >= POLL_INTERVAL) {
        lastPoll = millis();
        getPending = true;
        getSentAt = millis();
        Database.get(aClient, DEVICE_PATH + "/relay", processData, false, "getRelay");
      }
    }
  }

  if (millis() - lastRead >= READ_INTERVAL) {
    lastRead = millis();
    readPzem();
  }

  if (millis() - lastPush >= PUSH_INTERVAL) {
    lastPush = millis();
    pushReadings();
  }
}
