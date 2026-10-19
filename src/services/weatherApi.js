
const WEATHER_URL = import.meta.env.VITE_WEATHER_URL;
const REQUEST_TIMEOUT = 8000;

export async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),

    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
    ].join(','),

    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'weather_code',
    ].join(','),

    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
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
    const response = await fetch(`${WEATHER_URL}?${params}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error('Unable to load weather data. Please try again.');
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'Weather request timed out. Please check your internet connection and try again.', { cause: error }
      );
    }

    if (!navigator.onLine) {
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
