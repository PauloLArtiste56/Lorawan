"""Vérifie que le décodeur JavaScript et le codec Python sont d'accord.

Le payload est décodé à deux endroits : dans le LNS (JavaScript, pour l'affichage
et les intégrations tierces) et dans la plateforme (Python, qui fait foi). Ces
deux implémentations peuvent diverger silencieusement au premier changement de
format — ce test les compare sur les mêmes octets pour l'empêcher.
"""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from app.codec import Flags, MessageType, Reading, encode_uplink

DECODER_JS = Path(__file__).resolve().parents[2] / "decoders" / "water_meter_decoder.js"

pytestmark = pytest.mark.skipif(
    shutil.which("node") is None, reason="Node.js absent de l'environnement"
)


def decode_with_node(payload: bytes) -> dict:
    script = f"""
    const {{ decodeUplink }} = require({str(DECODER_JS)!r});
    const result = decodeUplink({{ bytes: {list(payload)}, fPort: 1 }});
    console.log(JSON.stringify(result));
    """
    completed = subprocess.run(
        ["node", "-e", script], capture_output=True, text=True, check=True
    )
    return json.loads(completed.stdout)


@pytest.mark.parametrize(
    "reading",
    [
        Reading(MessageType.PERIODIC, 123_456, 250, 3.60, Flags.NONE, 18),
        Reading(MessageType.BOOT, 0, 0, 2.00, Flags.NONE, 0),
        # Index au-delà de 2^31 : le piège classique du décalage de bits signé
        # en JavaScript, que le décodeur contourne par une multiplication.
        Reading(MessageType.PERIODIC, 4_000_000_000, 65_535, 4.55, Flags.NONE, 127),
        Reading(
            MessageType.ALARM,
            999_999,
            1_200,
            3.31,
            Flags.LEAK_SUSPECTED | Flags.BURST | Flags.LOW_BATTERY,
            -12,
        ),
        Reading(MessageType.PERIODIC, 42, 0, 2.55, Flags.FROST_RISK, -40),
    ],
    ids=["courant", "minimums", "index > 2^31", "alarmes multiples", "gel"],
)
def test_les_deux_decodeurs_sont_d_accord(reading):
    payload = encode_uplink(reading)

    js = decode_with_node(payload)["data"]

    assert js["message_type"] == reading.message_type.name
    assert js["index_l"] == reading.index_l
    assert js["flow_lph"] == reading.flow_lph
    assert js["battery_v"] == pytest.approx(reading.battery_v)
    assert js["temperature_c"] == reading.temperature_c
    assert sorted(js["active_flags"]) == sorted(
        flag.name.lower() for flag in Flags if flag is not Flags.NONE and flag in reading.flags
    )


def test_le_js_rejette_aussi_les_payloads_invalides():
    assert "errors" in decode_with_node(bytes(9))
    assert "errors" in decode_with_node(bytes([0x20]) + bytes(9))
