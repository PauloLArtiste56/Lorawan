"""Modèle d'uplink unifié et interface commune aux serveurs de réseau.

ChirpStack et The Things Stack publient tous deux les uplinks en MQTT, mais avec
des topics et des schémas JSON incompatibles. Chaque adaptateur traduit le
format de son LNS vers :class:`Uplink` ; en aval, plus aucun code de la
plateforme ne sait quel serveur de réseau est utilisé.
"""

from __future__ import annotations

import re
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import UTC, datetime


class UplinkParseError(ValueError):
    """Message MQTT non conforme au schéma attendu du LNS."""


@dataclass(frozen=True)
class Uplink:
    """Un uplink normalisé, indépendant du serveur de réseau d'origine."""

    #: DevEUI en hexadécimal minuscule sans séparateur, l'identifiant pivot du parc.
    dev_eui: str
    #: Nom lisible attribué au nœud dans le LNS.
    device_name: str
    received_at: datetime
    f_port: int
    f_cnt: int
    #: Payload applicatif brut, à passer au codec.
    payload: bytes
    #: RSSI de la meilleure passerelle l'ayant reçu, en dBm.
    rssi: int | None
    #: SNR de la meilleure passerelle, en dB — l'indicateur utile en sous-sol.
    snr: float | None
    spreading_factor: int | None
    #: Nombre de passerelles ayant reçu le message ; 1 = aucune redondance radio.
    gateway_count: int
    #: Identifiant du LNS d'origine ("chirpstack" ou "ttn"), pour la traçabilité.
    source: str


class LnsAdapter(ABC):
    """Traduit les messages MQTT d'un serveur de réseau vers :class:`Uplink`."""

    #: Identifiant reporté dans ``Uplink.source``.
    name: str

    @abstractmethod
    def uplink_topic(self) -> str:
        """Filtre MQTT à souscrire pour recevoir les uplinks de l'application."""

    @abstractmethod
    def parse_uplink(self, topic: str, message: dict) -> Uplink:
        """Convertit un message MQTT décodé en JSON vers un :class:`Uplink`."""

    @abstractmethod
    def downlink_topic(self, dev_eui: str, device_name: str) -> str:
        """Topic MQTT sur lequel publier un downlink vers ce nœud."""

    @abstractmethod
    def build_downlink(self, payload: bytes, f_port: int, confirmed: bool) -> dict:
        """Construit le corps JSON du downlink attendu par ce LNS."""


_NON_HEX = re.compile(r"[^0-9a-f]")


def normalise_eui(raw: str) -> str:
    """Ramène un EUI à sa forme canonique : 16 caractères hexadécimaux minuscules.

    Les LNS et les étiquettes constructeur écrivent le même EUI de toutes les
    façons possibles — ``00:80:E1:15:00:0A:BC:DE``, ``0080e115000abcde``,
    ``00-80-E1-15-00-0A-BC-DE``. Sans normalisation, le même nœud apparaîtrait
    en plusieurs exemplaires dans la base.
    """
    cleaned = _NON_HEX.sub("", raw.strip().lower())
    if len(cleaned) != 16:
        raise UplinkParseError(f"EUI invalide : {raw!r}")
    return cleaned


def parse_timestamp(raw: str | None) -> datetime:
    """Analyse un horodatage ISO 8601 en provenance d'un LNS.

    The Things Stack horodate à la nanoseconde (neuf décimales), ce que
    ``datetime.fromisoformat`` n'accepte pas : on tronque à la microseconde.
    """
    if not raw:
        return datetime.now(UTC)

    text = raw.strip().replace("Z", "+00:00")
    if "." in text:
        head, _, tail = text.partition(".")
        fraction = tail
        suffix = ""
        for marker in ("+", "-"):
            if marker in fraction:
                fraction, _, offset = fraction.partition(marker)
                suffix = marker + offset
                break
        text = f"{head}.{fraction[:6]}{suffix}"

    try:
        parsed = datetime.fromisoformat(text)
    except ValueError as exc:
        raise UplinkParseError(f"horodatage illisible : {raw!r}") from exc

    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)
