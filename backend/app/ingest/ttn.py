"""Adaptateur The Things Stack v3 (TTN / TTI).

Format des messages : https://www.thethingsindustries.com/docs/integrations/mqtt/
"""

from __future__ import annotations

import base64

from app.ingest.base import LnsAdapter, Uplink, UplinkParseError, normalise_eui, parse_timestamp


class TtnAdapter(LnsAdapter):
    name = "ttn"

    def __init__(self, application_id: str, tenant_id: str = "ttn") -> None:
        self.application_id = application_id
        self.tenant_id = tenant_id

    @property
    def _app_scope(self) -> str:
        return f"{self.application_id}@{self.tenant_id}"

    def uplink_topic(self) -> str:
        return f"v3/{self._app_scope}/devices/+/up"

    def parse_uplink(self, topic: str, message: dict) -> Uplink:
        ids = message.get("end_device_ids")
        if not isinstance(ids, dict) or "dev_eui" not in ids:
            raise UplinkParseError("champ end_device_ids.dev_eui absent")

        uplink = message.get("uplink_message")
        if not isinstance(uplink, dict):
            raise UplinkParseError("champ uplink_message absent")

        raw_payload = uplink.get("frm_payload")
        if raw_payload is None:
            raise UplinkParseError("champ uplink_message.frm_payload absent")
        try:
            payload = base64.b64decode(raw_payload, validate=True)
        except Exception as exc:
            raise UplinkParseError(f"champ frm_payload non base64 : {exc}") from exc

        rx_metadata = [
            rx for rx in uplink.get("rx_metadata") or [] if isinstance(rx, dict)
        ]
        best = _best_gateway(rx_metadata)

        return Uplink(
            dev_eui=normalise_eui(ids["dev_eui"]),
            device_name=ids.get("device_id", ""),
            # received_at existe au niveau racine et dans uplink_message ; celui
            # de l'uplink est l'horodatage du message, l'autre celui du relais.
            received_at=parse_timestamp(
                uplink.get("received_at") or message.get("received_at")
            ),
            f_port=int(uplink.get("f_port", 0)),
            f_cnt=int(uplink.get("f_cnt", 0)),
            payload=payload,
            rssi=_as_int(best.get("rssi")) if best else None,
            snr=_as_float(best.get("snr")) if best else None,
            spreading_factor=_spreading_factor(uplink.get("settings")),
            gateway_count=len(rx_metadata),
            source=self.name,
        )

    def downlink_topic(self, dev_eui: str, device_name: str) -> str:
        return f"v3/{self._app_scope}/devices/{device_name}/down/push"

    def build_downlink(self, payload: bytes, f_port: int, confirmed: bool) -> dict:
        return {
            "downlinks": [
                {
                    "f_port": f_port,
                    "frm_payload": base64.b64encode(payload).decode("ascii"),
                    "priority": "NORMAL",
                    "confirmed": confirmed,
                }
            ]
        }


def _best_gateway(rx_metadata: list[dict]) -> dict | None:
    """Retient la passerelle au meilleur SNR — voir l'adaptateur ChirpStack."""
    if not rx_metadata:
        return None
    return max(rx_metadata, key=lambda rx: _as_float(rx.get("snr")) or float("-inf"))


def _spreading_factor(settings: object) -> int | None:
    if not isinstance(settings, dict):
        return None
    lora = settings.get("data_rate", {}).get("lora")
    if not isinstance(lora, dict):
        return None
    return _as_int(lora.get("spreading_factor"))


def _as_int(value: object) -> int | None:
    return int(value) if isinstance(value, (int, float)) else None


def _as_float(value: object) -> float | None:
    return float(value) if isinstance(value, (int, float)) else None
