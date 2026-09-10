"""Tests du codec de payload — voir docs/lorawan-payload.md."""

import pytest

from app.codec import (
    Flags,
    MessageType,
    PayloadError,
    Reading,
    decode_uplink,
    encode_downlink_request_uplink,
    encode_downlink_set_index,
    encode_downlink_set_interval,
    encode_downlink_set_leak_threshold,
    encode_uplink,
)


def test_decode_releve_periodique():
    # v1 / PERIODIC | index 123456 L | 250 L/h | 3,60 V | aucun défaut | 18 °C
    payload = bytes.fromhex("10" "0001e240" "00fa" "a0" "00" "12")

    reading = decode_uplink(payload)

    assert reading.message_type is MessageType.PERIODIC
    assert reading.index_l == 123456
    assert reading.index_m3 == 123.456
    assert reading.flow_lph == 250
    assert reading.battery_v == 3.60
    assert reading.flags is Flags.NONE
    assert reading.temperature_c == 18
    assert not reading.has_alarm


def test_decode_alarme_multiple():
    payload = bytes.fromhex("11" "000f4240" "07d0" "50" "21" "05")

    reading = decode_uplink(payload)

    assert reading.message_type is MessageType.ALARM
    assert reading.index_l == 1_000_000
    assert Flags.LEAK_SUSPECTED in reading.flags
    assert Flags.BURST in reading.flags
    assert Flags.BACKFLOW not in reading.flags
    assert reading.has_alarm


def test_decode_temperature_negative():
    """La température est signée : un local technique peut geler."""
    payload = bytes.fromhex("10" "00000000" "0000" "a0" "40" "fb")

    reading = decode_uplink(payload)

    assert reading.temperature_c == -5
    assert Flags.FROST_RISK in reading.flags


def test_decode_refuse_taille_incorrecte():
    with pytest.raises(PayloadError, match="9 octets"):
        decode_uplink(bytes(9))


def test_decode_refuse_version_inconnue():
    payload = bytes([0x20]) + bytes(9)

    with pytest.raises(PayloadError, match="version de protocole 2"):
        decode_uplink(payload)


def test_decode_refuse_type_inconnu():
    payload = bytes([0x1F]) + bytes(9)

    with pytest.raises(PayloadError, match="type de message inconnu"):
        decode_uplink(payload)


def test_decode_ignore_bit_reserve():
    """Le bit 7 est réservé : sa mise à 1 ne doit pas casser le décodage."""
    payload = bytes.fromhex("10" "00000000" "0000" "a0" "81" "00")

    reading = decode_uplink(payload)

    assert reading.flags is Flags.LEAK_SUSPECTED


@pytest.mark.parametrize(
    "reading",
    [
        Reading(MessageType.PERIODIC, 0, 0, 2.00, Flags.NONE, 0),
        Reading(MessageType.BOOT, 4_294_967_295, 65_535, 4.55, Flags.NONE, 127),
        Reading(
            MessageType.ALARM,
            999_999,
            42,
            3.31,
            Flags.LEAK_SUSPECTED | Flags.LOW_BATTERY,
            -40,
        ),
    ],
    ids=["minimums", "maximums", "cas courant"],
)
def test_encode_decode_aller_retour(reading):
    assert decode_uplink(encode_uplink(reading)) == reading


def test_encode_refuse_batterie_hors_plage():
    reading = Reading(MessageType.PERIODIC, 0, 0, 5.0, Flags.NONE, 20)

    with pytest.raises(PayloadError, match="hors plage"):
        encode_uplink(reading)


def test_downlinks_de_configuration():
    assert encode_downlink_set_interval(60).hex() == "01003c"
    assert encode_downlink_set_leak_threshold(5).hex() == "020005"
    assert encode_downlink_request_uplink().hex() == "03"
    assert encode_downlink_set_index(123456).hex() == "040001e240"


def test_downlink_refuse_periode_nulle():
    with pytest.raises(PayloadError, match="hors plage"):
        encode_downlink_set_interval(0)
