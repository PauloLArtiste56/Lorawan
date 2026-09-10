"""Adaptateur ChirpStack v4.

Format des événements : https://www.chirpstack.io/docs/chirpstack/integrations/mqtt.html
"""

from __future__ import annotations

import base64

from app.ingest.base import LnsAdapter, Uplink, UplinkParseError, normalise_eui, parse_timestamp


class ChirpStackAdapter(LnsAdapter):
    name = "chirpstack"

    def __init__(self, application_id: str) -> None:
        self.application_id = application_id

    def uplink_topic(self) -> str:
        return f"application/{self.application_id}/device/+/event/up"

    def parse_uplink(self, topic: str, message: dict) -> Uplink:
        device_info = message.get("deviceInfo")
        if not isinstance(device_info, dict) or "devEui" not in device_info:
            raise UplinkParseError("champ deviceInfo.devEui absent")

        raw_payload = message.get("data")
        if raw_payload is None:
            raise UplinkParseError("champ data absent")
        try:
            payload = base64.b64decode(raw_payload, validate=True)
        except Exception as exc:
            raise UplinkParseError(f"champ data non base64 : {exc}") from exc

        rx_info = [rx for rx in message.get("rxInfo") or [] if isinstance(rx, dict)]
        best = _best_gateway(rx_info)

        return Uplink(
            dev_eui=normalise_eui(device_info["devEui"]),
            device_name=device_info.get("deviceName", ""),
            received_at=parse_timestamp(message.get("time")),
            f_port=int(message.get("fPort", 0)),
            f_cnt=int(message.get("fCnt", 0)),
            payload=payload,
            rssi=_as_int(best.get("rssi")) if best else None,
            snr=_as_float(best.get("snr")) if best else None,
            spreading_factor=_spreading_factor(message.get("txInfo")),
            gateway_count=len(rx_info),
            source=self.name,
        )

    def downlink_topic(self, dev_eui: str, device_name: str) -> str:
        return f"application/{self.application_id}/device/{dev_eui}/command/down"

    def build_downlink(self, payload: bytes, f_port: int, confirmed: bool) -> dict:
        return {
            "devEui": "",  # renseigné par le client au moment de la publication
            "confirmed": confirmed,
            "fPort": f_port,
            "data": base64.b64encode(payload).decode("ascii"),
        }


def _best_gateway(rx_info: list[dict]) -> dict | None:
    """Retient la passerelle au meilleur SNR.

    Un même uplink est reçu par toutes les passerelles à portée. Le SNR prime
    sur le RSSI : c'est lui qui conditionne la démodulation en limite de portée,
    donc c'est lui qui reflète la vraie qualité de la liaison.
    """
    if not rx_info:
        return None
    return max(rx_info, key=lambda rx: _as_float(rx.get("snr")) or float("-inf"))


def _spreading_factor(tx_info: object) -> int | None:
    if not isinstance(tx_info, dict):
        return None
    lora = tx_info.get("modulation", {}).get("lora")
    if not isinstance(lora, dict):
        return None
    return _as_int(lora.get("spreadingFactor"))


def _as_int(value: object) -> int | None:
    return int(value) if isinstance(value, (int, float)) else None


def _as_float(value: object) -> float | None:
    return float(value) if isinstance(value, (int, float)) else None
