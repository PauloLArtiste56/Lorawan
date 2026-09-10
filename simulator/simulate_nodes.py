#!/usr/bin/env python3
"""Simulateur de parc de compteurs d'eau LoRaWAN.

Publie sur MQTT des uplinks au format exact de ChirpStack ou de The Things Stack,
ce qui permet de développer et de démontrer toute la plateforme avant la
livraison du matériel — et de rejouer à volonté des scénarios (fuite nocturne,
rupture de canalisation, pile faible) qu'on ne peut pas provoquer sur le terrain.

Exemples :

    # Aperçu console, sans courtier MQTT : 48 h en accéléré
    python simulator/simulate_nodes.py --dry-run --hours 48

    # Vers un ChirpStack local, en temps réel
    python simulator/simulate_nodes.py --lns chirpstack --host localhost

    # Injecter une fuite sur un compteur pour tester la détection
    python simulator/simulate_nodes.py --dry-run --hours 72 --leak compteur-batA-rdc
"""

from __future__ import annotations

import argparse
import base64
import json
import random
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.codec import Flags, MessageType, Reading, encode_uplink  # noqa: E402

#: Profil horaire de consommation d'un bâtiment d'enseignement, en fraction de la
#: pointe. Deux pics — arrivée du matin et pause déjeuner — et un creux nocturne
#: quasi nul : c'est ce creux qui rend la détection de fuite possible.
PROFIL_HORAIRE = [
    0.02, 0.01, 0.01, 0.01, 0.01, 0.02,  # 00 h – 05 h
    0.08, 0.35, 0.80, 0.65, 0.60, 0.70,  # 06 h – 11 h
    1.00, 0.85, 0.60, 0.60, 0.65, 0.45,  # 12 h – 17 h
    0.25, 0.12, 0.06, 0.04, 0.03, 0.02,  # 18 h – 23 h
]


@dataclass
class Noeud:
    """Un compteur simulé."""

    dev_eui: str
    nom: str
    #: Consommation à l'heure de pointe, en litres.
    pointe_lph: int
    index_l: int = 0
    battery_v: float = 3.60
    #: Débit de fuite constant en L/h ; 0 = pas de fuite.
    fuite_lph: int = 0
    f_cnt: int = field(default=0)

    def releve(self, horodatage: datetime) -> Reading:
        """Produit le relevé de l'heure écoulée et avance l'index."""
        facteur = PROFIL_HORAIRE[horodatage.hour]
        if horodatage.weekday() >= 5:  # week-end : campus quasi désert
            facteur *= 0.12

        usage = self.pointe_lph * facteur * random.uniform(0.75, 1.25)
        debit = int(round(usage)) + self.fuite_lph
        self.index_l += debit
        self.f_cnt += 1

        # Décharge lente de la pile, avec le bruit d'une mesure réelle.
        self.battery_v = max(2.40, self.battery_v - random.uniform(0.0, 0.00025))

        flags = Flags.NONE
        # Le nœud lève lui-même un doute quand le creux nocturne n'est pas nul.
        if self.fuite_lph and horodatage.hour in (2, 3, 4):
            flags |= Flags.LEAK_SUSPECTED
        if debit > self.pointe_lph * 3:
            flags |= Flags.BURST
        if self.battery_v < 2.90:
            flags |= Flags.LOW_BATTERY

        temperature = 18 + int(round(random.uniform(-2, 2)))
        if temperature < 3:
            flags |= Flags.FROST_RISK

        return Reading(
            message_type=MessageType.ALARM if flags else MessageType.PERIODIC,
            index_l=self.index_l,
            flow_lph=min(debit, 0xFFFF),
            battery_v=round(self.battery_v, 2),
            flags=flags,
            temperature_c=temperature,
        )


PARC_PAR_DEFAUT = [
    Noeud("0080e115000abcde", "compteur-batA-rdc", pointe_lph=420),
    Noeud("0080e115000abcdf", "compteur-batA-etage1", pointe_lph=260),
    Noeud("0080e115000abce0", "compteur-batB-sanitaires", pointe_lph=610),
    Noeud("0080e115000abce1", "compteur-labos", pointe_lph=180),
    Noeud("0080e115000abce2", "compteur-restaurant", pointe_lph=950),
    Noeud("0080e115000abce3", "compteur-general", pointe_lph=2400),
]


def message_chirpstack(noeud: Noeud, reading: Reading, horodatage: datetime, app_id: str) -> tuple[str, dict]:
    snr, rssi, sf = qualite_radio(noeud)
    topic = f"application/{app_id}/device/{noeud.dev_eui}/event/up"
    message = {
        "deduplicationId": f"sim-{noeud.dev_eui}-{noeud.f_cnt}",
        "time": horodatage.isoformat(),
        "deviceInfo": {
            "applicationId": app_id,
            "deviceName": noeud.nom,
            "devEui": noeud.dev_eui,
        },
        "fPort": 2 if reading.has_alarm else 1,
        "fCnt": noeud.f_cnt,
        "data": base64.b64encode(encode_uplink(reading)).decode("ascii"),
        "rxInfo": [{"gatewayId": "gw-campus", "rssi": rssi, "snr": snr}],
        "txInfo": {"modulation": {"lora": {"spreadingFactor": sf, "bandwidth": 125000}}},
    }
    return topic, message


def message_ttn(noeud: Noeud, reading: Reading, horodatage: datetime, app_id: str) -> tuple[str, dict]:
    snr, rssi, sf = qualite_radio(noeud)
    topic = f"v3/{app_id}@ttn/devices/{noeud.nom}/up"
    message = {
        "end_device_ids": {
            "device_id": noeud.nom,
            "dev_eui": noeud.dev_eui,
            "application_ids": {"application_id": app_id},
        },
        "received_at": horodatage.isoformat(),
        "uplink_message": {
            "f_port": 2 if reading.has_alarm else 1,
            "f_cnt": noeud.f_cnt,
            "frm_payload": base64.b64encode(encode_uplink(reading)).decode("ascii"),
            "received_at": horodatage.isoformat(),
            "rx_metadata": [
                {"gateway_ids": {"gateway_id": "gw-campus"}, "rssi": rssi, "snr": snr}
            ],
            "settings": {"data_rate": {"lora": {"spreading_factor": sf, "bandwidth": 125000}}},
        },
    }
    return topic, message


def qualite_radio(noeud: Noeud) -> tuple[float, int, int]:
    """Qualité radio plausible, dégradée pour les compteurs en sous-sol.

    Les nœuds mal couverts montent en facteur d'étalement : c'est exactement le
    comportement que la supervision du parc doit rendre visible.
    """
    en_sous_sol = noeud.nom.endswith(("rdc", "general", "sanitaires"))
    if en_sous_sol:
        return round(random.uniform(-14.0, -4.0), 2), random.randint(-120, -105), random.choice([10, 11, 12])
    return round(random.uniform(0.0, 9.0), 2), random.randint(-100, -80), random.choice([7, 8, 9])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--lns", choices=["chirpstack", "ttn"], default="chirpstack")
    parser.add_argument("--host", default="localhost", help="hôte du courtier MQTT")
    parser.add_argument("--port", type=int, default=1883)
    parser.add_argument("--app-id", default="ecam-eau")
    parser.add_argument("--hours", type=int, default=0, help="nombre d'heures à simuler (0 = sans fin)")
    parser.add_argument("--interval", type=float, default=1.0, help="secondes réelles par heure simulée")
    parser.add_argument("--leak", action="append", default=[], metavar="NOM", help="injecte une fuite sur ce compteur (répétable)")
    parser.add_argument("--leak-lph", type=int, default=45, help="débit de la fuite injectée, en L/h")
    parser.add_argument("--dry-run", action="store_true", help="affiche les messages sans publier")
    parser.add_argument("--seed", type=int, help="graine aléatoire, pour un scénario reproductible")
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    parc = PARC_PAR_DEFAUT
    inconnus = set(args.leak) - {n.nom for n in parc}
    if inconnus:
        parser.error(f"compteur(s) inconnu(s) : {', '.join(sorted(inconnus))}")
    for noeud in parc:
        if noeud.nom in args.leak:
            noeud.fuite_lph = args.leak_lph

    # Index de départ plausibles : des compteurs déjà en service.
    for noeud in parc:
        noeud.index_l = random.randint(500_000, 4_000_000)

    client = None
    if not args.dry_run:
        try:
            import paho.mqtt.client as mqtt
        except ImportError:
            print("paho-mqtt requis pour publier ; utilisez --dry-run.", file=sys.stderr)
            return 1
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        client.connect(args.host, args.port, keepalive=60)
        client.loop_start()
        print(f"Connecté à mqtt://{args.host}:{args.port} — format {args.lns}")

    formatter = message_chirpstack if args.lns == "chirpstack" else message_ttn
    horodatage = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    heures = 0

    try:
        while args.hours == 0 or heures < args.hours:
            for noeud in parc:
                reading = noeud.releve(horodatage)
                topic, message = formatter(noeud, reading, horodatage, args.app_id)

                if client is not None:
                    client.publish(topic, json.dumps(message), qos=1)
                else:
                    alarmes = f"  ⚠ {reading.flags.name}" if reading.has_alarm else ""
                    print(
                        f"{horodatage:%Y-%m-%d %H:%M}  {noeud.nom:<26} "
                        f"index {reading.index_m3:>10.3f} m³  débit {reading.flow_lph:>5} L/h  "
                        f"pile {reading.battery_v:.2f} V{alarmes}"
                    )

            horodatage += timedelta(hours=1)
            heures += 1
            if client is not None or args.interval:
                time.sleep(args.interval if client is not None else 0)
    except KeyboardInterrupt:
        print("\nArrêt du simulateur.")
    except BrokenPipeError:
        # Sortie tronquée par un `| head` : ce n'est pas une erreur.
        sys.stderr.close()
    finally:
        if client is not None:
            client.loop_stop()
            client.disconnect()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
