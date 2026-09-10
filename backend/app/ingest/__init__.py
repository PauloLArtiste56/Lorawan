"""Ingestion des uplinks depuis le serveur de réseau LoRaWAN."""

from app.ingest.base import LnsAdapter, Uplink, UplinkParseError, normalise_eui
from app.ingest.chirpstack import ChirpStackAdapter
from app.ingest.ttn import TtnAdapter

__all__ = [
    "ChirpStackAdapter",
    "LnsAdapter",
    "TtnAdapter",
    "Uplink",
    "UplinkParseError",
    "normalise_eui",
    "build_adapter",
]


def build_adapter(lns: str, application_id: str, tenant_id: str = "ttn") -> LnsAdapter:
    """Instancie l'adaptateur correspondant au LNS configuré."""
    match lns.lower():
        case "chirpstack":
            return ChirpStackAdapter(application_id=application_id)
        case "ttn" | "tts":
            return TtnAdapter(application_id=application_id, tenant_id=tenant_id)
        case _:
            raise ValueError(
                f"serveur de réseau inconnu : {lns!r} (attendu : chirpstack, ttn)"
            )
