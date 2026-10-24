# WeatherNow – Weather Forecasting & Geospatial Analysis

A full-stack weather and geospatial analysis application built with **React, FastAPI, Python, MySQL, and Google Earth Engine**. WeatherNow combines real-time weather information with satellite-based environmental analysis to explore weather conditions, land use patterns, built-up areas, and land surface temperature.

## Features

### 🌦️ Weather Forecasting

- Fetch weather data using the Open-Meteo API.
- Display current weather conditions and forecasts.
- Explore weather information for supported cities and locations.
- Store weather observations in a MySQL database.
- Retrieve historical weather snapshots using date filters.
- Run background tasks for periodic weather data collection.

### 🛰️ Geospatial & Satellite Analysis

**1. Land Use/Land Cover (LULC)**

- Analyze land use and land cover patterns.
- Explore land categories using satellite imagery and geospatial processing.
- Support environmental monitoring and land-use assessment.

**2. Normalized Difference Built-up Index (NDBI)**

- Analyze built-up areas using satellite data.
- Identify urban development patterns and built-up surfaces.
- Support urbanization and land-cover studies.

**3. Land Surface Temperature (LST)**

- Analyze land surface temperature using satellite imagery.
- Explore spatial temperature variations across selected areas.
- Support environmental studies and urban heat analysis.

### 🗺️ Additional Capabilities

- Interactive weather and geospatial dashboard.
- Backend API endpoints built with FastAPI.
- Database integration using MySQL and SQLAlchemy.
- Integration with Google Earth Engine for satellite-based analysis.
- Modular backend structure for weather services and API routes.

## Technology Stack

| Category                  | Technologies                 |
| ------------------------- | ---------------------------- |
| Frontend                  | React, JavaScript, HTML, CSS |
| Backend                   | Python, FastAPI              |
| Database                  | MySQL, SQLAlchemy            |
| Weather Data              | Open-Meteo API               |
| Geospatial Analysis       | Google Earth Engine          |
| Remote Sensing            | LULC, NDBI, LST              |
| API Communication         | REST API                     |
| Environment Configuration | Python dotenv                |

##

## Data Sources

### Open-Meteo

Used to retrieve weather information and forecast data.

Website: [https://open-meteo.com/](https://open-meteo.com/)

### Google Earth Engine

Used for satellite data access and geospatial analysis supporting LULC, NDBI, and LST workflows.

Website: [https://earthengine.google.com/](https://earthengine.google.com/)

## Applications

WeatherNow can support a range of weather and environmental monitoring use cases:

- Weather monitoring and forecasting.
- Urban growth and built-up area analysis.
- Land use and land cover assessment.
- Land surface temperature mapping.
- Environmental and climate-related research.
- Geospatial data exploration and visualization.

## Future Improvements

- Interactive maps with selectable analysis regions.
- Satellite-derived LULC classification maps and legends.
- NDBI visualization with configurable date ranges.
- LST maps with temperature legends and statistics.
- City-wise historical weather charts.
- Comparison of weather and land surface temperature.
- Exportable geospatial analysis results.
- Improved caching and background processing.

##


---

**WeatherNow** — Connecting weather forecasting with satellite-based geospatial insights.
