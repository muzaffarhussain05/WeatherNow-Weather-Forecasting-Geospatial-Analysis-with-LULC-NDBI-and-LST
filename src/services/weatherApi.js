const WEATHER_URL = import.meta.env.VITE_WEATHER_URL;


const REQUEST_TIMEOUT = import.meta.env.VITE_REQUEST_TIMEOUT;

export async function getWeather(latitude, longitude) {
  if (!WEATHER_URL) {
    throw new Error(
      'Weather API URL is missing. Check your .env file.'
    );
  }

  if (
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude)) ||
    Number(latitude) < -90 ||
    Number(latitude) > 90 ||
    Number(longitude) < -180 ||
    Number(longitude) > 180
  ) {
    throw new Error('Invalid location coordinates.');
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),

    // ADDED: uv_index, surface_pressure, visibility, wind_direction_10m, wind_gusts_10m, dew_point_2m
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m', // <-- Added for Wind Direction
      'wind_gusts_10m',     // <-- Added for Wind Gusts
      'dew_point_2m',       // <-- Added for Dew Point
      'uv_index',           // <-- Added for UV Index
      'surface_pressure',   // <-- Added for Pressure (QNH)
      'visibility',         // <-- Added for Visibility
    ].join(','),

    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'weather_code',
    ].join(','),

    // ADDED: precipitation_probability_max (used for the Precipitation description)
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'precipitation_probability_max', // <-- Added for Precipitation %
    ].join(','),

    timezone: 'auto',
    forecast_days: '7',
    forecast_hours: '24',
  });

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(
      `${WEATHER_URL}?${params.toString()}`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error(
        `Weather service returned an error (${response.status}).`
      );
    }

    const data = await response.json();

    if (!data.current || !data.hourly || !data.daily) {
      throw new Error('The weather service returned incomplete data.');
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'Weather request timed out. Please try again.', { cause: error }
      );
    }

    if (error.message?.includes('Weather service returned')) {
      throw error;
    }

    if (
      error.message?.includes('incomplete data') ||
      error instanceof SyntaxError
    ) {
      throw new Error(
        'Invalid response from the weather service. Please try again.', { cause: error }
      );
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error(
        'No internet connection. Please check your network and try again.', { cause: error }
      );
    }

    throw new Error(
      'Unable to connect to the weather service. Please try again.', { cause: error }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}