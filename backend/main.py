
import json
import logging
import os
from datetime import date
from pathlib import Path
from sqlalchemy import text
from database import engine
import ee
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from contextlib import asynccontextmanager
from services.weather_service import weather_worker
from routers.weather import router as weather_router
from database_init import init_database
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)




PROJECT_ID = os.getenv("EE_PROJECT_ID", "").strip()

KEY_FILE = os.getenv(
    "EE_SERVICE_ACCOUNT_FILE"
)

FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
)



@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing WeatherNow backend...")

    # Create missing database tables before serving requests.
    await asyncio.to_thread(init_database)
    logger.info("Database tables initialized successfully.")

    # Start background tasks.
    ee_task = asyncio.create_task(earth_engine_retry_worker())
    weather_task = asyncio.create_task(weather_worker())

    app.state.ee_retry_task = ee_task
    app.state.weather_task = weather_task

    logger.info("WeatherNow backend started.")

    try:
        yield
    finally:
        # Stop background tasks when the application shuts down.
        tasks = [ee_task, weather_task]

        for task in tasks:
            task.cancel()

        await asyncio.gather(*tasks, return_exceptions=True)

        logger.info("WeatherNow background tasks stopped.")



app = FastAPI(title="WeatherNow Satellite Layers API", lifespan=lifespan)
app.include_router(weather_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
ee_initialized = False
initialization_error = None

ee_initialization_lock = asyncio.Lock()
def initialize_earth_engine():
    global ee_initialized, initialization_error

    try:
        if not PROJECT_ID:
            raise RuntimeError("EE_PROJECT_ID is missing from .env")

        if not KEY_FILE:
            raise RuntimeError(
                "EE_SERVICE_ACCOUNT_FILE is missing from .env"
            )

        key_path = Path(KEY_FILE).expanduser()

        if not key_path.is_absolute():
            key_path = Path(__file__).resolve().parent / key_path

        key_path = key_path.resolve()

        if not key_path.is_file():
            raise FileNotFoundError(
                f"Service-account JSON not found: {key_path}"
            )

        with key_path.open("r", encoding="utf-8") as file:
            key_data = json.load(file)

        if key_data.get("type") != "service_account":
            raise ValueError(
                "The JSON file is not a service-account key"
            )

        email = key_data.get("client_email")

        if not email:
            raise ValueError(
                "Missing client_email in service-account JSON"
            )

        credentials = ee.ServiceAccountCredentials(
            email,
            str(key_path),
        )

        ee.Initialize(credentials, project=PROJECT_ID)

        # Confirm authentication with a real EE computation.
        result = ee.Number(1).add(1).getInfo()

        if result != 2:
            raise RuntimeError(
                "Earth Engine authentication test failed"
            )

        ee_initialized = True
        initialization_error = None

        logger.info(
            "Earth Engine initialized successfully using service account."
        )

    except Exception as exc:
        ee_initialized = False
        initialization_error = str(exc)

        logger.exception(
            "Earth Engine initialization failed."
        )




async def earth_engine_retry_worker():
    retry_interval = 60

    while not ee_initialized:
        logger.info("Attempting to initialize Google Earth Engine...")

        async with ee_initialization_lock:
            if not ee_initialized:
                await asyncio.to_thread(initialize_earth_engine)

        if ee_initialized:
            logger.info("Earth Engine is ready.")
            return

        logger.warning(
            "Earth Engine is unavailable. "
            "Retrying in %s seconds. Backend remains running.",
            retry_interval,
        )

        await asyncio.sleep(retry_interval)










def make_tile_url(image, visualization):
    map_info = image.getMapId(visualization)
    return map_info["tile_fetcher"].url_format


def validate_dates(start, end):
    try:
        start_date = date.fromisoformat(start)
        end_date = date.fromisoformat(end)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="Dates must use YYYY-MM-DD format.",
        ) from exc

    if start_date >= end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date must be before end date.",
        )

    return start_date, end_date


def build_layers(latitude, longitude, start, end):
    point = ee.Geometry.Point([longitude, latitude])
    area = point.buffer(10000)

    # Land use / land cover: Dynamic World.
    dynamic_world = (
        ee.ImageCollection("GOOGLE/DYNAMICWORLD/V1")
        .filterBounds(area)
        .filterDate(start, end)
    )

    lulc = (
        dynamic_world.select("label")
        .mode()
        .clip(area)
    )

    lulc_vis = {
        "min": 0,
        "max": 8,
        "palette": [
            "419BDF",
            "397D49",
            "88B053",
            "7A87C6",
            "E49635",
            "DFC35A",
            "C4281B",
            "A59B8F",
            "B39FE1",
        ],
    }

    # NDBI: Sentinel-2 surface reflectance.
    def mask_sentinel(image):
        scl = image.select("SCL")

        mask = (
            scl.neq(3)
            .And(scl.neq(8))
            .And(scl.neq(9))
            .And(scl.neq(10))
            .And(scl.neq(11))
        )

        return image.updateMask(mask)

    sentinel = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(area)
        .filterDate(start, end)
        .filter(
            ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 40)
        )
        .map(mask_sentinel)
    )

    composite = sentinel.median()

    ndbi = (
        composite.normalizedDifference(["B11", "B8"])
        .rename("NDBI")
        .clip(area)
    )

    ndbi_vis = {
        "min": -0.5,
        "max": 0.5,
        "palette": [
            "2166AC",
            "F7F7F7",
            "B2182B",
        ],
    }

    # Land Surface Temperature: Landsat 9, Celsius.
    landsat = (
        ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
        .filterBounds(area)
        .filterDate(start, end)
        .filter(
            ee.Filter.eq("PROCESSING_LEVEL", "L2SP")
        )
        .filter(
            ee.Filter.lt("CLOUD_COVER", 60)
        )
    )

    def convert_temperature(image):
        qa = image.select("QA_PIXEL")

        # Mask fill, dilated cloud, cirrus, cloud,
        # cloud shadow and snow.
        clear = qa.bitwiseAnd(63).eq(0)

        temperature = (
            image.select("ST_B10")
            .multiply(0.00341802)
            .add(149.0)
            .subtract(273.15)
        )

        return (
            temperature
            .updateMask(clear)
            .rename("LST")
            .copyProperties(
                image,
                ["system:time_start"],
            )
        )

    lst = (
        landsat.map(convert_temperature)
        .median()
        .clip(area)
    )

    lst_vis = {
        "min": 10,
        "max": 50,
        "palette": [
            "313695",
            "74ADD1",
            "FFFFBF",
            "F46D43",
            "A50026",
        ],
    }

    return {
        "lulc": make_tile_url(lulc, lulc_vis),
        "ndbi": make_tile_url(ndbi, ndbi_vis),
        "lst": make_tile_url(lst, lst_vis),
    }


@app.get("/")
def root():
    return {
        "service": "WeatherNow Satellite Layers API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "earth_engine_initialized": ee_initialized,
        "initialization_error": initialization_error,
    }


@app.get("/api/earth/layers")
def get_satellite_layers(
    lat: float = Query(..., ge=-80, le=80),
    lon: float = Query(..., ge=-180, le=180),
    start: str = "2025-01-01",
    end: str = "2026-01-01",
):
    if not ee_initialized:
        raise HTTPException(
            status_code=503,
            detail={
                "message": (
                    "Earth Engine has not been initialized."
                ),
                "error": initialization_error,
            },
        )

    validate_dates(start, end)

    try:
        tiles = build_layers(
            lat,
            lon,
            start,
            end,
        )

        return {
            "success": True,
            "center": {
                "lat": lat,
                "lon": lon,
            },
            "radius_meters": 10000,
            "date_range": {
                "start": start,
                "end": end,
            },
            "tiles": tiles,
        }

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "Earth Engine layer generation failed."
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Earth Engine could not generate the requested "
                "layers. Check backend logs and try a different "
                "date range or location."
            ),
        ) from exc



@app.post("/api/earth/reconnect")
async def reconnect_earth_engine():
    global ee_initialized, initialization_error

    async with ee_initialization_lock:
        # Another request or the background worker may
        # already have restored the connection.
        if ee_initialized:
            return {
                "success": True,
                "connected": True,
                "message": "Earth Engine is already connected.",
            }

        await asyncio.to_thread(initialize_earth_engine)

        if ee_initialized:
            logger.info("Earth Engine reconnected through API.")

            return {
                "success": True,
                "connected": True,
                "message": "Earth Engine connected successfully.",
            }

        logger.warning(
            "Manual Earth Engine reconnection failed: %s",
            initialization_error,
        )

        raise HTTPException(
            status_code=503,
            detail={
                "message": "Earth Engine connection failed.",
                "error": initialization_error,
            },
        )
