import asyncio
import logging
import time
from datetime import datetime

import httpx
from sqlalchemy import text

from database import engine
import os
from dotenv import load_dotenv
logger = logging.getLogger(__name__)
load_dotenv()

WEATHER_URL = os.getenv(
    "WEATHER_URL"
)

SNAPSHOT_INTERVAL = 5
WEATHER_REFRESH_INTERVAL = 5
BATCH_SIZE = 50

WEATHER_FIELDS = (
    "temperature_2m,"
    "relative_humidity_2m,"
    "apparent_temperature,"
    "precipitation,"
    "wind_speed_10m,"
  
)


def get_cities():
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT id, city_name, latitude, longitude
                FROM pakistan_cities
                ORDER BY id
            """)
        )

        return [dict(row) for row in result.mappings().all()]


async def fetch_weather(client, cities):
    weather_by_city = {}

    for start in range(0, len(cities), BATCH_SIZE):
        batch = cities[start:start + BATCH_SIZE]

        params = {
            "latitude": ",".join(str(city["latitude"]) for city in batch),
            "longitude": ",".join(str(city["longitude"]) for city in batch),
            "current": WEATHER_FIELDS,
            "timezone": "Asia/Karachi",
        }

        response = await client.get(WEATHER_URL, params=params)
        response.raise_for_status()

        data = response.json()

        # Open-Meteo returns an object for one location
        # and a list of objects for multiple locations.
        if isinstance(data, dict):
            data = [data]

        if len(data) != len(batch):
            raise ValueError("Weather response count does not match city count")

        for city, item in zip(batch, data):
            current = item.get("current")

            if not current:
                continue

            weather_by_city[city["id"]] = {
                "temperature_c": current.get("temperature_2m"),
                "relative_humidity": current.get("relative_humidity_2m"),
                
                "apparent_temperature_c": current.get(
                    "apparent_temperature"
                ),
               
                "wind_speed_kmh": current.get("wind_speed_10m"),
                
                "observed_at": datetime.fromisoformat(
                    current["time"]
                ).replace(tzinfo=None),
            }
            print("data ",weather_by_city)

    return weather_by_city


def save_snapshots(weather_by_city):
    if not weather_by_city:
        return 0

    rows = [
        {"city_id": city_id, **weather}
        for city_id, weather in weather_by_city.items()
    ]

    with engine.begin() as connection:
        connection.execute(
            text("""
                INSERT INTO weather_snapshots (
                    city_id,
                    temperature_c,
                    relative_humidity,
                    apparent_temperature_c,
                   
                    wind_speed_kmh,
                 
                    observed_at
                )
                VALUES (
                    :city_id,
                    :temperature_c,
                    :relative_humidity,
                    :apparent_temperature_c,
                   
                    :wind_speed_kmh,
                    
                    :observed_at
                )
            """),
            rows,
        )

    return len(rows)
async def weather_worker():
    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            cycle_started = time.monotonic()

            try:
                cities = await asyncio.to_thread(get_cities)

                if not cities:
                    logger.warning("No cities found in pakistan_cities")
                else:
                    # Fetch fresh weather every cycle
                    fresh_weather = await fetch_weather(client, cities)

                    # Save only the weather fetched in this cycle
                    saved = await asyncio.to_thread(
                        save_snapshots, fresh_weather
                    )

                    logger.info(
                        "Fetched weather for %s cities and saved %s snapshots",
                        len(fresh_weather),
                        saved,
                    )

            except asyncio.CancelledError:
                raise

            except Exception:
                logger.exception("Weather collection cycle failed")

            elapsed = time.monotonic() - cycle_started
            await asyncio.sleep(max(0, SNAPSHOT_INTERVAL - elapsed))