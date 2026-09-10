/**
 * Décodeur de payload « compteur d'eau ECAM », protocole version 1.
 *
 * À coller dans le formateur de payload du serveur de réseau :
 *   - ChirpStack v4 : Device profile ▸ Codec ▸ JavaScript functions
 *   - The Things Stack : Application ▸ Payload formatters ▸ Uplink ▸ Custom JS
 *
 * Les deux LNS attendent la même signature `decodeUplink(input)` renvoyant
 * `{ data: ... }` ou `{ errors: [...] }`.
 *
 * Spécification de référence : docs/lorawan-payload.md
 * Ce fichier doit rester synchronisé avec backend/app/codec/water_meter.py —
 * la cohérence entre les deux est vérifiée par backend/tests/test_codec_parity.py.
 */

var PROTOCOL_VERSION = 1;
var UPLINK_SIZE = 10;

var MESSAGE_TYPES = { 0: "PERIODIC", 1: "ALARM", 2: "BOOT" };

var FLAGS = [
  [0x01, "leak_suspected"],
  [0x02, "backflow"],
  [0x04, "tamper_magnet"],
  [0x08, "tamper_case"],
  [0x10, "low_battery"],
  [0x20, "burst"],
  [0x40, "frost_risk"]
];

function decodeUplink(input) {
  var bytes = input.bytes;

  if (bytes.length !== UPLINK_SIZE) {
    return { errors: ["payload de " + bytes.length + " octets, " + UPLINK_SIZE + " attendus"] };
  }

  var version = bytes[0] >> 4;
  if (version !== PROTOCOL_VERSION) {
    return { errors: ["version de protocole " + version + " non supportée"] };
  }

  var rawType = bytes[0] & 0x0f;
  if (!(rawType in MESSAGE_TYPES)) {
    return { errors: ["type de message inconnu : " + rawType] };
  }

  // Index sur 4 octets big-endian. On utilise une multiplication plutôt qu'un
  // décalage : en JavaScript, `<<` travaille sur 32 bits signés et un index
  // dépassant 2 147 483 647 L ressortirait négatif.
  var indexL =
    bytes[1] * 16777216 + bytes[2] * 65536 + bytes[3] * 256 + bytes[4];

  var flowLph = bytes[5] * 256 + bytes[6];
  var batteryV = Math.round((2.0 + bytes[7] * 0.01) * 100) / 100;
  var rawFlags = bytes[8] & 0x7f; // le bit 7 est réservé
  var temperatureC = bytes[9] > 127 ? bytes[9] - 256 : bytes[9];

  var flags = {};
  var active = [];
  for (var i = 0; i < FLAGS.length; i++) {
    var isSet = (rawFlags & FLAGS[i][0]) !== 0;
    flags[FLAGS[i][1]] = isSet;
    if (isSet) {
      active.push(FLAGS[i][1]);
    }
  }

  return {
    data: {
      message_type: MESSAGE_TYPES[rawType],
      index_l: indexL,
      index_m3: indexL / 1000,
      flow_lph: flowLph,
      battery_v: batteryV,
      temperature_c: temperatureC,
      flags: flags,
      active_flags: active
    }
  };
}

/**
 * Encodeur de downlink de configuration (port 10).
 * `input.data` accepte une seule des clés suivantes.
 */
function encodeDownlink(input) {
  var data = input.data || {};

  if (data.uplink_interval_min !== undefined) {
    var m = data.uplink_interval_min;
    return { bytes: [0x01, (m >> 8) & 0xff, m & 0xff], fPort: 10 };
  }
  if (data.leak_threshold_lph !== undefined) {
    var t = data.leak_threshold_lph;
    return { bytes: [0x02, (t >> 8) & 0xff, t & 0xff], fPort: 10 };
  }
  if (data.request_uplink) {
    return { bytes: [0x03], fPort: 10 };
  }
  if (data.set_index_l !== undefined) {
    var v = data.set_index_l;
    return {
      bytes: [
        0x04,
        Math.floor(v / 16777216) & 0xff,
        Math.floor(v / 65536) & 0xff,
        Math.floor(v / 256) & 0xff,
        v & 0xff
      ],
      fPort: 10
    };
  }

  return { errors: ["commande de downlink inconnue"] };
}

// Export pour les tests Node ; ignoré par les LNS.
if (typeof module !== "undefined") {
  module.exports = { decodeUplink: decodeUplink, encodeDownlink: encodeDownlink };
}
