
import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { getErrorMessage } from '../utils/errorMessage';
import 'leaflet/dist/leaflet.css';
import { getSatelliteLayers ,retryEarthEngineConnection} from '../services/earthEngineApi';

const { Overlay } = LayersControl;

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL 
)

function RecenterMap({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 11);
  }, [map, latitude, longitude]);

  return null;
}

function WeatherMarkers() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 
useEffect(() => {
  const controller = new AbortController();
  let active = true;
  let intervalId;

  async function loadWeather() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/weather/map`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error('Unable to load city weather.');
      }

      if (active) {
        setCities(result.data || []);
        setError('');
      }
    } catch (err) {
      if (active && err.name !== 'AbortError') {
        setError(
      getErrorMessage(
        err,
        'Failed to load city weather. Please try again.'
      )
    );
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  setLoading(true);
  loadWeather();

  intervalId = setInterval(loadWeather, 5000);

  return () => {
    active = false;
    controller.abort();
    clearInterval(intervalId);
  };
}, []);


  function createWeatherIcon(temperature) {
    const label =
      temperature == null ? '--' : `${Number(temperature).toFixed(0)}°`;

    return L.divIcon({
      className: 'weather-marker-wrapper',
      html: `
        <div style="
          background: #ffffff;
          color: #172033;
          border: 2px solid #0d9488;
          border-radius: 16px;
          padding: 4px 7px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          text-align: center;
        ">${label}</div>
      `,
      iconSize: [48, 30],
      iconAnchor: [24, 15],
    });
  }

  return (
    <>
      <MarkerClusterGroup chunkedLoading>
        {cities.map((city) => {
          const latitude = Number(city.latitude);
          const longitude = Number(city.longitude);

          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < 23.5 ||
            latitude > 37.5 ||
            longitude < 60.5 ||
            longitude > 77.9
          ) {
            return null;
          }

          const hasWeather = city.temperature_c != null;

          return (
            <Marker
              key={city.city_id}
              position={[latitude, longitude]}
              icon={createWeatherIcon(city.temperature_c)}
            >
              <Popup>
                <div className="min-w-44 space-y-1 text-sm">
                  <h3 className="text-base font-bold">
                    {city.city_name}
                  </h3>

                  <p className="text-gray-500">
                    {city.province || 'Pakistan'}
                  </p>

                  {hasWeather ? (
                    <>
                      <p>
                        Temperature:{' '}
                        <strong>{city.temperature_c} °C</strong>
                      </p>

                      <p>
                        Feels like:{' '}
                        {city.apparent_temperature_c ?? '--'} °C
                      </p>

                      <p>
                        Humidity:{' '}
                        {city.relative_humidity ?? '--'}%
                      </p>

                      <p>
                        Wind speed:{' '}
                        {city.wind_speed_kmh ?? '--'} km/h
                      </p>

                      <p className="text-xs text-gray-500">
                        Observed:{' '}
                        {city.observed_at
                          ? new Date(city.observed_at).toLocaleString()
                          : 'Unavailable'}
                      </p>
                    </>
                  ) : (
                    <p className="text-amber-700">
                      Weather data is not available yet.
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>

      <WeatherStatus
        loading={loading}
        error={error}
        count={cities.length}
      />
    </>
  );
}

function WeatherStatus({ loading, error, count }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: 'bottomleft' });

    control.onAdd = () => {
      const container = L.DomUtil.create(
        'div',
        'leaflet-bar'
      );

      container.style.cssText =
        'background:white;padding:7px 10px;border-radius:6px;' +
        'font-size:12px;box-shadow:0 1px 5px #0003;';

      const update = () => {
        container.textContent = loading
          ? 'Loading city weather...'
          : error
            ? 'Weather unavailable'
            : `${count} cities loaded`;
      };

      update();

      return container;
    };

    control.addTo(map);

    return () => control.remove();
  }, [map, loading, error, count]);

  return null;
}

function Spinner({ className = '' }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function MapSkeleton() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-gray-100/80 backdrop-blur-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200">
        <Spinner className="h-6 w-6 text-emerald-600" />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          Loading satellite imagery
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          Fetching tiles for this location…
        </p>
      </div>

      <div className="mt-1 h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full w-1/3 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-emerald-500" />
      </div>
    </div>
  );
}

export default function SatelliteMap({
  latitude = 33.6844,
  longitude = 73.0479,
}) {
  const [tiles, setTiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);

  
async function handleRetryConnection() {
  setRetrying(true);
  setError('');
  setLoading(true);

  try {
    await retryEarthEngineConnection();

    const result = await getSatelliteLayers(latitude, longitude);
    setTiles(result.tiles);
  } catch (err) {
    setError(
      getErrorMessage(
        err,
        'Earth Engine reconnection failed. Please try again.'
      )
    );
  } finally {
    setRetrying(false);
    setLoading(false);
  }
}


  useEffect(() => {
    let cancelled = false;

    async function loadLayers() {
      setLoading(true);
      setError('');
      setTiles(null);

      try {
        const result = await getSatelliteLayers(
          latitude,
          longitude
        );

        if (!cancelled) {
          setTiles(result.tiles);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
      getErrorMessage(
        err,
        'Unable to load satellite imagery. Please try again.'
      )
    );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLayers();

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return (
    <section className="mt-6 w-full">
     
{error && (
  <div
    role="alert"
    className="mb-3 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <p className="font-semibold">
        Satellite imagery unavailable
      </p>
      <p className="mt-1 break-words">{error}</p>
    </div>

    <button
      type="button"
      onClick={handleRetryConnection}
      disabled={retrying}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {retrying && <Spinner className="h-4 w-4" />}
      {retrying ? 'Reconnecting...' : 'Retry Connection'}
    </button>
  </div>
)}


      <div className="relative">
        {loading && <MapSkeleton />}

        <MapContainer
          center={[latitude, longitude]}
          zoom={11}
          className="z-0 h-[500px] w-full overflow-hidden rounded-lg shadow-md"
        >
          <RecenterMap
            latitude={latitude}
            longitude={longitude}
          />

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <WeatherMarkers />

          {tiles && (
            <LayersControl position="topright">
              <Overlay checked={false} name="LULC">
                <TileLayer
                  url={tiles.lulc}
                  opacity={0.75}
                  maxZoom={18}
                />
              </Overlay>

              <Overlay checked={false} name="NDBI">
                <TileLayer
                  url={tiles.ndbi}
                  opacity={0.75}
                  maxZoom={18}
                />
              </Overlay>

              <Overlay checked={false} name="LST (°C)">
                <TileLayer
                  url={tiles.lst}
                  opacity={0.75}
                  maxZoom={18}
                />
              </Overlay>
            </LayersControl>
          )}
        </MapContainer>
      </div>
    </section>
  );
}
