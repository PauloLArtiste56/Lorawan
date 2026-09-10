"""Tests des adaptateurs de serveur de réseau.

Les messages d'exemple reprennent la structure réelle des événements MQTT de
ChirpStack v4 et de The Things Stack v3, réduite aux champs consommés.
"""

from datetime import UTC

import pytest

from app.codec import decode_uplink
from app.ingest import ChirpStackAdapter, TtnAdapter, UplinkParseError, build_adapter
from app.ingest.base import normalise_eui, parse_timestamp

# Relevé v1/PERIODIC : 123456 L, 250 L/h, 3,60 V, aucun défaut, 18 °C
PAYLOAD_B64 = "EAAB4kAA+qAAEg=="


def chirpstack_message(**overrides):
    message = {
        "deviceInfo": {
            "devEui": "0080E115000ABCDE",
            "deviceName": "compteur-batA-rdc",
            "applicationId": "app-1",
        },
        "time": "2026-09-10T08:00:00+00:00",
        "fPort": 1,
        "fCnt": 42,
        "data": PAYLOAD_B64,
        "rxInfo": [
            {"gatewayId": "gw-nord", "rssi": -112, "snr": -8.5},
            {"gatewayId": "gw-sud", "rssi": -95, "snr": 6.25},
        ],
        "txInfo": {"modulation": {"lora": {"spreadingFactor": 9, "bandwidth": 125000}}},
    }
    message.update(overrides)
    return message


def ttn_message(**overrides):
    message = {
        "end_device_ids": {
            "device_id": "compteur-batA-rdc",
            "dev_eui": "0080E115000ABCDE",
            "application_ids": {"application_id": "app-1"},
        },
        "received_at": "2026-09-10T08:00:00.123456789Z",
        "uplink_message": {
            "f_port": 1,
            "f_cnt": 42,
            "frm_payload": PAYLOAD_B64,
            "received_at": "2026-09-10T08:00:00.123456789Z",
            "rx_metadata": [
                {"gateway_ids": {"gateway_id": "gw-nord"}, "rssi": -112, "snr": -8.5},
                {"gateway_ids": {"gateway_id": "gw-sud"}, "rssi": -95, "snr": 6.25},
            ],
            "settings": {"data_rate": {"lora": {"spreading_factor": 9}}},
        },
    }
    message.update(overrides)
    return message


@pytest.mark.parametrize(
    ("adapter", "message", "topic"),
    [
        (
            ChirpStackAdapter("app-1"),
            chirpstack_message(),
            "application/app-1/device/0080e115000abcde/event/up",
        ),
        (
            TtnAdapter("app-1"),
            ttn_message(),
            "v3/app-1@ttn/devices/compteur-batA-rdc/up",
        ),
    ],
    ids=["chirpstack", "ttn"],
)
def test_les_deux_lns_produisent_le_meme_uplink(adapter, message, topic):
    """Le cœur de l'abstraction : deux formats d'entrée, un seul modèle en sortie."""
    uplink = adapter.parse_uplink(topic, message)

    assert uplink.dev_eui == "0080e115000abcde"
    assert uplink.device_name == "compteur-batA-rdc"
    assert uplink.f_port == 1
    assert uplink.f_cnt == 42
    assert uplink.spreading_factor == 9
    assert uplink.gateway_count == 2
    assert uplink.received_at.astimezone(UTC).hour == 8

    # La meilleure passerelle est celle au meilleur SNR, pas au meilleur RSSI.
    assert uplink.snr == 6.25
    assert uplink.rssi == -95

    # Et le payload traverse la chaîne intact.
    reading = decode_uplink(uplink.payload)
    assert reading.index_l == 123456
    assert reading.flow_lph == 250


def test_topics_de_souscription():
    assert ChirpStackAdapter("app-1").uplink_topic() == (
        "application/app-1/device/+/event/up"
    )
    assert TtnAdapter("app-1").uplink_topic() == "v3/app-1@ttn/devices/+/up"


def test_uplink_sans_passerelle():
    """Cas dégradé : le LNS n'a pas joint de métadonnées radio."""
    uplink = ChirpStackAdapter("app-1").parse_uplink("t", chirpstack_message(rxInfo=[]))

    assert uplink.gateway_count == 0
    assert uplink.rssi is None
    assert uplink.snr is None


@pytest.mark.parametrize(
    ("adapter", "message"),
    [
        (ChirpStackAdapter("app-1"), chirpstack_message(deviceInfo={})),
        (ChirpStackAdapter("app-1"), chirpstack_message(data=None)),
        (ChirpStackAdapter("app-1"), chirpstack_message(data="pas du base64 !")),
        (TtnAdapter("app-1"), ttn_message(end_device_ids={})),
        (TtnAdapter("app-1"), ttn_message(uplink_message=None)),
    ],
    ids=["cs sans eui", "cs sans data", "cs data invalide", "ttn sans eui", "ttn sans uplink"],
)
def test_message_malforme_leve_une_erreur(adapter, message):
    with pytest.raises(UplinkParseError):
        adapter.parse_uplink("t", message)


@pytest.mark.parametrize(
    "raw",
    [
        "0080E115000ABCDE",
        "00:80:e1:15:00:0a:bc:de",
        "00-80-E1-15-00-0A-BC-DE",
        " 0080e115000abcde ",
    ],
)
def test_normalisation_des_eui(raw):
    assert normalise_eui(raw) == "0080e115000abcde"


@pytest.mark.parametrize("raw", ["", "0080e115000abc", "pas un eui du tout"])
def test_eui_invalide_rejete(raw):
    with pytest.raises(UplinkParseError):
        normalise_eui(raw)


def test_horodatage_nanoseconde_de_ttn():
    """TTN horodate à la nanoseconde, que fromisoformat n'accepte pas."""
    parsed = parse_timestamp("2026-09-10T08:00:00.123456789Z")

    assert parsed.microsecond == 123456
    assert parsed.tzinfo is not None


def test_horodatage_absent_utilise_maintenant():
    assert parse_timestamp(None).tzinfo is not None


def test_build_adapter():
    assert isinstance(build_adapter("chirpstack", "app-1"), ChirpStackAdapter)
    assert isinstance(build_adapter("TTN", "app-1"), TtnAdapter)

    with pytest.raises(ValueError, match="serveur de réseau inconnu"):
        build_adapter("loriot", "app-1")


def test_downlink_par_lns():
    payload = bytes.fromhex("01003c")

    cs = ChirpStackAdapter("app-1").build_downlink(payload, f_port=10, confirmed=True)
    assert cs["fPort"] == 10 and cs["confirmed"] is True

    ttn = TtnAdapter("app-1").build_downlink(payload, f_port=10, confirmed=True)
    assert ttn["downlinks"][0]["f_port"] == 10
