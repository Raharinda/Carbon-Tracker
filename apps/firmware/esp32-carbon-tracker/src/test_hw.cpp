// Hardware-only test for ESP32 + PZEM-004T + relay (no WiFi / Firebase).
// Build & flash: pio run -e test_hw -t upload && pio device monitor

#include <Arduino.h>
#include <PZEM004Tv30.h>
#include <optional>

#define RELAY_PIN 26
#define PZEM_RX_PIN 16 // ke TX PZEM
#define PZEM_TX_PIN 17 // ke RX PZEM

// Inisialisasi di setup() setelah Serial2 siap (ESP32 Arduino core 3.x).
std::optional<PZEM004Tv30> pzem;
unsigned long lastRead = 0;

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(50);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // default OFF

  pzem.emplace(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);

  Serial.println("Tes PZEM + Relay siap. Ketik: ON / OFF");
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    cmd.toUpperCase();

    if (cmd == "ON") {
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("Relay: ON");
    } else if (cmd == "OFF") {
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("Relay: OFF");
    }
  }

  if (millis() - lastRead >= 2000) {
    lastRead = millis();

    // Buang sisa byte UART agar frame Modbus 25 byte tidak desync.
    while (Serial2.available()) Serial2.read();

    float v = pzem->voltage();
    if (isnan(v)) {
      Serial.println("PZEM: tidak ada respon (cek 5V, TX/RX, dan AC)");
      return;
    }

    float i = pzem->current();
    float p = pzem->power();
    float e = pzem->energy();
    float f = pzem->frequency();
    float pf = pzem->pf();

    Serial.printf(
        "V: %.1f V | I: %.3f A | P: %.1f W | E: %.3f kWh | F: %.1f Hz | PF: %.2f\n",
        v, isnan(i) ? 0.0f : i, isnan(p) ? 0.0f : p, isnan(e) ? 0.0f : e,
        isnan(f) ? 0.0f : f, isnan(pf) ? 0.0f : pf);
  }
}
