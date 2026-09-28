#!/usr/bin/env python3
"""Pont entre ChirpStack et PostgreSQL.

Écoute les trames montantes publiées par ChirpStack sur MQTT et enregistre
une ligne par couple trame/passerelle, de sorte qu'une trame reçue par trois
passerelles donne trois lignes. C'est ce qui permet de tracer une courbe de
RSSI par passerelle, là où ChirpStack ne montre que la meilleure.
"""

import json
import pathlib
import sys
from datetime import datetime, timezone

import paho.mqtt.client as mqtt
import psycopg2

MQTT_HOTE = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "application/+/device/+/event/up"

BASE = {
    "host": "localhost",
    "dbname": "propagation",
    "user": "lorawan",
    "password": "admin",
}

# Lu à chaque trame : on peut changer d'emplacement sans redémarrer le pont.
FICHIER_EMPLACEMENT = pathlib.Path(__file__).with_name("emplacement.txt")

INSERTION = """
INSERT INTO mesures_radio
  (horodatage, trame_id, dev_eui, nom_appareil, emplacement,
   gateway_id, rssi, snr, sf, frequence, f_cnt, nb_passerelles)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""


def emplacement_courant():
    try:
        return FICHIER_EMPLACEMENT.read_text(encoding="utf-8").strip() or None
    except FileNotFoundError:
        return None


def lignes_de(trame):
    """Une ligne par passerelle ayant reçu la trame."""
    recus = trame.get("rxInfo") or []
    if not recus:
        return []

    infos = trame.get("deviceInfo") or {}
    tx = trame.get("txInfo") or {}
    lora = (tx.get("modulation") or {}).get("lora") or {}
    horodatage = trame.get("time") or datetime.now(timezone.utc).isoformat()
    lieu = emplacement_courant()

    return [
        (
            horodatage,
            trame.get("deduplicationId"),
            infos.get("devEui"),
            infos.get("deviceName"),
            lieu,
            recu.get("gatewayId"),
            recu.get("rssi"),
            recu.get("snr"),
            lora.get("spreadingFactor"),
            tx.get("frequency"),
            trame.get("fCnt"),
            len(recus),
        )
        for recu in recus
    ]


def sur_message(client, donnees, message):
    try:
        trame = json.loads(message.payload)
    except json.JSONDecodeError:
        print("trame illisible, ignorée", file=sys.stderr)
        return

    lignes = lignes_de(trame)
    if not lignes:
        return

    cnx = donnees["cnx"]
    with cnx, cnx.cursor() as curseur:
        curseur.executemany(INSERTION, lignes)

    premiere = lignes[0]
    print(
        f"{premiere[0]}  {premiere[3]}  fCnt={premiere[10]}  "
        f"SF{premiere[8]}  {len(lignes)} passerelle(s)  "
        f"lieu={premiere[4] or '-'}",
        flush=True,
    )


def main():
    cnx = psycopg2.connect(**BASE)
    client = mqtt.Client(userdata={"cnx": cnx})
    client.on_message = sur_message
    client.connect(MQTT_HOTE, MQTT_PORT, 60)
    client.subscribe(MQTT_TOPIC)
    print(f"abonné à {MQTT_TOPIC}, en attente de trames", flush=True)
    client.loop_forever()


if __name__ == "__main__":
    main()
