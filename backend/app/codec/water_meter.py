"""Codec du payload applicatif des nœuds compteur d'eau.

La spécification de référence est documentée dans ``docs/lorawan-payload.md`` ;
toute évolution de format doit être répercutée dans les deux, ainsi que dans les
décodeurs JavaScript de ``decoders/``.
"""

from __future__ import annotations

import struct
from dataclasses import dataclass
from enum import IntEnum, IntFlag

PROTOCOL_VERSION = 1

#: Taille du payload d'un relevé, en octets.
UPLINK_SIZE = 10

#: Ports applicatifs LoRaWAN.
PORT_PERIODIC = 1
PORT_ALARM = 2
PORT_CONFIG = 10

#: La tension batterie est encodée sur un octet, par pas de 10 mV à partir de 2 V.
_BATTERY_OFFSET_V = 2.0
_BATTERY_STEP_V = 0.01


class PayloadError(ValueError):
    """Payload illisible : taille, version ou champ hors plage."""


class MessageType(IntEnum):
    PERIODIC = 0x0
    ALARM = 0x1
    BOOT = 0x2


class Flags(IntFlag):
    NONE = 0x00
    LEAK_SUSPECTED = 0x01
    BACKFLOW = 0x02
    TAMPER_MAGNET = 0x04
    TAMPER_CASE = 0x08
    LOW_BATTERY = 0x10
    BURST = 0x20
    FROST_RISK = 0x40


@dataclass(frozen=True)
class Reading:
    """Un relevé décodé, en unités physiques."""

    message_type: MessageType
    #: Index cumulatif du compteur, en litres.
    index_l: int
    #: Débit moyen depuis le relevé précédent, en litres par heure.
    flow_lph: int
    #: Tension de la pile, en volts.
    battery_v: float
    flags: Flags
    #: Température du local technique, en degrés Celsius.
    temperature_c: int

    @property
    def index_m3(self) -> float:
        """Index en mètres cubes, l'unité des factures d'eau."""
        return self.index_l / 1000.0

    @property
    def has_alarm(self) -> bool:
        return self.flags is not Flags.NONE


def decode_uplink(payload: bytes) -> Reading:
    """Décode un relevé reçu sur le port 1 ou 2.

    Lève :class:`PayloadError` si le payload ne respecte pas la spécification —
    un nœud mal configuré ou un décodeur LNS mal réglé ne doit jamais produire
    silencieusement un relevé faux.
    """
    if len(payload) != UPLINK_SIZE:
        raise PayloadError(
            f"payload de {len(payload)} octets, {UPLINK_SIZE} attendus"
        )

    header = payload[0]
    version = header >> 4
    if version != PROTOCOL_VERSION:
        raise PayloadError(
            f"version de protocole {version} non supportée "
            f"(cette plateforme parle la version {PROTOCOL_VERSION})"
        )

    raw_type = header & 0x0F
    try:
        message_type = MessageType(raw_type)
    except ValueError as exc:
        raise PayloadError(f"type de message inconnu : 0x{raw_type:x}") from exc

    index_l, flow_lph, battery_raw, flags_raw, temperature_c = struct.unpack(
        ">IHBBb", payload[1:]
    )

    return Reading(
        message_type=message_type,
        index_l=index_l,
        flow_lph=flow_lph,
        battery_v=round(_BATTERY_OFFSET_V + battery_raw * _BATTERY_STEP_V, 2),
        flags=Flags(flags_raw & 0x7F),
        temperature_c=temperature_c,
    )


def encode_uplink(reading: Reading) -> bytes:
    """Encode un relevé. Utilisé par le simulateur et par les tests."""
    battery_raw = round((reading.battery_v - _BATTERY_OFFSET_V) / _BATTERY_STEP_V)
    if not 0 <= battery_raw <= 0xFF:
        raise PayloadError(
            f"tension batterie {reading.battery_v} V hors plage encodable "
            f"(2,00 – 4,55 V)"
        )
    if not 0 <= reading.index_l <= 0xFFFFFFFF:
        raise PayloadError(f"index {reading.index_l} L hors plage encodable")
    if not 0 <= reading.flow_lph <= 0xFFFF:
        raise PayloadError(f"débit {reading.flow_lph} L/h hors plage encodable")
    if not -128 <= reading.temperature_c <= 127:
        raise PayloadError(
            f"température {reading.temperature_c} °C hors plage encodable"
        )

    header = (PROTOCOL_VERSION << 4) | reading.message_type
    return bytes([header]) + struct.pack(
        ">IHBBb",
        reading.index_l,
        reading.flow_lph,
        battery_raw,
        int(reading.flags),
        reading.temperature_c,
    )


def encode_downlink_set_interval(minutes: int) -> bytes:
    """Downlink 0x01 — période d'émission des uplinks."""
    if not 1 <= minutes <= 0xFFFF:
        raise PayloadError(f"période {minutes} min hors plage (1 – 65535)")
    return b"\x01" + struct.pack(">H", minutes)


def encode_downlink_set_leak_threshold(flow_lph: int) -> bytes:
    """Downlink 0x02 — seuil de débit de fond déclenchant LEAK_SUSPECTED."""
    if not 0 <= flow_lph <= 0xFFFF:
        raise PayloadError(f"seuil {flow_lph} L/h hors plage (0 – 65535)")
    return b"\x02" + struct.pack(">H", flow_lph)


def encode_downlink_request_uplink() -> bytes:
    """Downlink 0x03 — demande d'uplink immédiat."""
    return b"\x03"


def encode_downlink_set_index(index_l: int) -> bytes:
    """Downlink 0x04 — recalage de l'index après remplacement de compteur."""
    if not 0 <= index_l <= 0xFFFFFFFF:
        raise PayloadError(f"index {index_l} L hors plage encodable")
    return b"\x04" + struct.pack(">I", index_l)
