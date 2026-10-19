
const weatherConditions = {
  0: { label: 'Clear sky', icon: 'sun' },
  1: { label: 'Mainly clear', icon: 'sun' },
  2: { label: 'Partly cloudy', icon: 'cloud-sun' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Foggy', icon: 'cloud-fog' },
  48: { label: 'Rime fog', icon: 'cloud-fog' },
  51: { label: 'Light drizzle', icon: 'cloud-drizzle' },
  53: { label: 'Drizzle', icon: 'cloud-drizzle' },
  55: { label: 'Heavy drizzle', icon: 'cloud-drizzle' },
  56: { label: 'Freezing drizzle', icon: 'cloud-snow' },
  57: { label: 'Heavy freezing drizzle', icon: 'cloud-snow' },
  61: { label: 'Light rain', icon: 'cloud-rain' },
  63: { label: 'Rain', icon: 'cloud-rain' },
  65: { label: 'Heavy rain', icon: 'cloud-rain' },
  66: { label: 'Freezing rain', icon: 'cloud-snow' },
  67: { label: 'Heavy freezing rain', icon: 'cloud-snow' },
  71: { label: 'Light snow', icon: 'cloud-snow' },
  73: { label: 'Snow', icon: 'cloud-snow' },
  75: { label: 'Heavy snow', icon: 'cloud-snow' },
  77: { label: 'Snow grains', icon: 'snowflake' },
  80: { label: 'Light rain showers', icon: 'cloud-rain' },
  81: { label: 'Rain showers', icon: 'cloud-rain' },
  82: { label: 'Heavy rain showers', icon: 'cloud-rain' },
  85: { label: 'Snow showers', icon: 'cloud-snow' },
  86: { label: 'Heavy snow showers', icon: 'cloud-snow' },
  95: { label: 'Thunderstorm', icon: 'cloud-lightning' },
  96: { label: 'Thunderstorm with hail', icon: 'cloud-lightning' },
  99: { label: 'Heavy thunderstorm with hail', icon: 'cloud-lightning' },
};

export function getWeatherCondition(code) {
  return weatherConditions[code] ?? {
    label: 'Unknown conditions',
    icon: 'cloud',
  };
}
