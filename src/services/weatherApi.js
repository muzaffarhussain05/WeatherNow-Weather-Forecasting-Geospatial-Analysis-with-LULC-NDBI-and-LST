
const WEATHER_URL = import.meta.env.VITE_WEATHER_URL;

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

  const response = await fetch(
    `${WEATHER_URL}?${params}`
  );

  if (!response.ok) {
    throw new Error('Unable to load weather data.');
  }

  return response.json();
}
