
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
from datetime import date

from database import engine

router = APIRouter(prefix="/api/v1", tags=["Weather and Locations"])

LATEST_WEATHER = """
    SELECT
        c.id AS city_id,
        c.city_name,
        c.province,
        c.latitude,
        c.longitude,
        ws.temperature_c,
        ws.relative_humidity,
        ws.apparent_temperature_c,
        ws.wind_speed_kmh,
        ws.observed_at,
        ws.recorded_at
    FROM pakistan_cities c
    LEFT JOIN weather_snapshots ws
        ON ws.id = (
            SELECT ws2.id
            FROM weather_snapshots ws2
            WHERE ws2.city_id = c.id
            ORDER BY ws2.recorded_at DESC, ws2.id DESC
            LIMIT 1
        )
"""

def paginate(sql, params, page, page_size):
    count_sql = f"SELECT COUNT(*) FROM ({sql}) AS results"

    with engine.connect() as connection:
        total = connection.execute(
            text(count_sql), params
        ).scalar_one()

        rows = connection.execute(
            text(sql + """
                ORDER BY city_name ASC
                LIMIT :limit OFFSET :offset
            """),
            {
                **params,
                "limit": page_size,
                "offset": (page - 1) * page_size,
            },
        ).mappings().all()

    return {
        "success": True,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total,
            "total_pages": (total + page_size - 1) // page_size,
            "has_next": page * page_size < total,
            "has_previous": page > 1,
        },
        "data": [dict(row) for row in rows],
    }





@router.get("/weather")
def get_weather(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
):
    sql = LATEST_WEATHER
    params = {}
    conditions = []

    if start_date:
        conditions.append("ws.observed_at >= :start_date")
        params["start_date"] = start_date

    if end_date:
        conditions.append(
            "ws.observed_at < DATE_ADD(:end_date, INTERVAL 1 DAY)"
        )
        params["end_date"] = end_date

    if conditions:
        sql += " WHERE " + " AND ".join(conditions)

    sql += " ORDER BY ws.recorded_at DESC, ws.id DESC"

    with engine.connect() as connection:
        rows = connection.execute(
            text(sql), params
        ).mappings().all()

    return {
        "success": True,
        "count": len(rows),
        "filters": {
            "start_date": start_date,
            "end_date": end_date,
        },
        "data": [dict(row) for row in rows],
    }


@router.get("/weather/snapshots")
def get_weather_snapshots(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    max_rows: int = Query(1000, ge=1, le=1000000),
   
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date cannot be after end_date.",
        )

    conditions = []
    params = {"max_rows": max_rows}

    if start_date:
        conditions.append(
            "ws.recorded_at >= :start_date"
        )
        params["start_date"] = start_date

    if end_date:
        conditions.append(
            "ws.recorded_at < DATE_ADD(:end_date, INTERVAL 1 DAY)"
        )
        params["end_date"] = end_date

   

    where_clause = (
        "WHERE " + " AND ".join(conditions)
        if conditions
        else ""
    )

    sql = f"""
        SELECT
            ws.id AS weather_id,
            ws.city_id,
            c.city_name,
            c.province,
            c.latitude,
            c.longitude,
            ws.temperature_c,
            ws.relative_humidity,
            ws.apparent_temperature_c,
            ws.wind_speed_kmh,
            ws.observed_at,
            ws.recorded_at
        FROM weather_snapshots ws
        INNER JOIN pakistan_cities c
            ON c.id = ws.city_id
        {where_clause}
        ORDER BY ws.recorded_at DESC, ws.id DESC
        LIMIT :max_rows
    """

    count_sql = f"""
        SELECT COUNT(*)
        FROM weather_snapshots ws
        INNER JOIN pakistan_cities c
            ON c.id = ws.city_id
        {where_clause}
    """

    with engine.connect() as connection:
        total_matching = connection.execute(
            text(count_sql),
            {
                key: value
                for key, value in params.items()
                if key != "max_rows"
            },
        ).scalar_one()

        rows = connection.execute(
            text(sql), params
        ).mappings().all()

    return {
        "success": True,
        "filters": {
            "start_date": start_date,
            "end_date": end_date,
           
            "max_rows": max_rows,
        },
        "total_matching_rows": total_matching,
        "returned_rows": len(rows),
        "has_more": total_matching > len(rows),
        "data": [dict(row) for row in rows],
    }

@router.get("/weather/city/{city_id}")
def get_weather_by_city(city_id: int):
    sql = LATEST_WEATHER + " WHERE c.id = :city_id"

    with engine.connect() as connection:
        row = connection.execute(
            text(sql),
            {"city_id": city_id},
        ).mappings().first()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="City not found.",
        )

    return {"success": True, "data": dict(row)}


@router.get("/cities/search")
def search_cities(
    name: str = Query(..., min_length=1, max_length=150),
    limit: int | None = Query(None, ge=1, le=10000),
):
    sql = """
        SELECT
            c.id AS city_id,
            c.city_name,
            c.province,
            c.latitude,
            c.longitude,
            ws.id AS weather_id,
            ws.temperature_c,
            ws.relative_humidity,
            ws.apparent_temperature_c,
            ws.wind_speed_kmh,
            
            ws.observed_at,
            ws.recorded_at
        FROM pakistan_cities c
        LEFT JOIN weather_snapshots ws
            ON ws.city_id = c.id
        WHERE c.city_name LIKE :name
        ORDER BY c.city_name ASC, ws.recorded_at DESC, ws.id DESC
    """

    params = {"name": f"%{name.strip()}%"}

    if limit is not None:
        sql += " LIMIT :limit"
        params["limit"] = limit

    with engine.connect() as connection:
        rows = connection.execute(
            text(sql), params
        ).mappings().all()

    return {
        "success": True,
        "search": name.strip(),
        "count": len(rows),
        "limit": limit,
        "data": [dict(row) for row in rows],
    }

@router.get("/weather/coordinates")
def get_weather_by_coordinates(
    lat: float = Query(..., ge=23.5, le=37.5),
    lon: float = Query(..., ge=60.5, le=77.9),
    limit: int | None = Query(None, ge=1, le=10000),
):
    with engine.connect() as connection:
        city = connection.execute(
            text("""
                SELECT id, city_name, province, latitude, longitude
                FROM pakistan_cities
                WHERE latitude = :lat
                  AND longitude = :lon
                LIMIT 1
            """),
            {"lat": lat, "lon": lon},
        ).mappings().first()

        if city is None:
            return {
                "success": True,
                "count": 0,
                "city": None,
                "data": [],
                "message": "No city is registered at these exact coordinates.",
            }

        sql = """
            SELECT
                ws.id AS weather_id,
                c.id AS city_id,
                c.city_name,
                c.province,
                c.latitude,
                c.longitude,
                ws.temperature_c,
                ws.relative_humidity,
                ws.apparent_temperature_c,
              
                ws.wind_speed_kmh,
             
                ws.observed_at,
                ws.recorded_at
            FROM weather_snapshots ws
            JOIN pakistan_cities c ON c.id = ws.city_id
            WHERE c.id = :city_id
            ORDER BY ws.recorded_at DESC, ws.id DESC
        """

        params = {"city_id": city["id"]}

        if limit is not None:
            sql += " LIMIT :limit"
            params["limit"] = limit

        rows = connection.execute(
            text(sql), params
        ).mappings().all()

    return {
        "success": True,
        "count": len(rows),
        "city": dict(city),
        "limit": limit,
        "data": [dict(row) for row in rows],
    }
@router.get("/cities")
def get_cities(
    province: str | None = Query(default=None),
):
    sql = """
        SELECT
            id AS city_id,
            city_name,
            province,
            latitude,
            longitude
        FROM pakistan_cities
    """
    params = {}

    if province:
        sql += " WHERE province = :province"
        params["province"] = province.strip()

    sql += " ORDER BY city_name ASC"

    with engine.connect() as connection:
        rows = connection.execute(
            text(sql), params
        ).mappings().all()

    return {
        "success": True,
        "count": len(rows),
        "data": [dict(row) for row in rows],
    }


@router.get("/cities/{city_id}")
def get_city(city_id: int):
    with engine.connect() as connection:
        row = connection.execute(
            text("""
                SELECT
                    id AS city_id,
                    city_name,
                    province,
                    latitude,
                    longitude
                FROM pakistan_cities
                WHERE id = :city_id
            """),
            {"city_id": city_id},
        ).mappings().first()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="City not found.",
        )

    return {"success": True, "data": dict(row)}


@router.get("/provinces")
def get_provinces():
    with engine.connect() as connection:
        rows = connection.execute(
            text("""
                SELECT province, COUNT(*) AS city_count
                FROM pakistan_cities
                WHERE province IS NOT NULL
                  AND province <> ''
                GROUP BY province
                ORDER BY province
            """)
        ).mappings().all()

    return {
        "success": True,
        "count": len(rows),
        "data": [dict(row) for row in rows],
    }



@router.get("/weather/map")
def get_weather_for_map():
    sql = LATEST_WEATHER + """
        ORDER BY c.city_name ASC
    """

    with engine.connect() as connection:
        rows = connection.execute(text(sql)).mappings().all()

    return {
        "success": True,
        "count": len(rows),
        "data": [dict(row) for row in rows],
    }
