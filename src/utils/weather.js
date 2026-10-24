
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from 'lucide-react';

export function getWeatherInfo(code, isDay = 1) {
  if (code === 0) {
    return {
      label: 'Clear sky',
      Icon: isDay ? Sun : Moon,
    };
  }

  if (code === 1) {
    return {
      label: 'Mainly clear',
      Icon: isDay ? CloudSun : CloudMoon,
    };
  }

  if (code === 2) {
    return {
      label: 'Partly cloudy',
      Icon: isDay ? CloudSun : CloudMoon,
    };
  }

  if (code === 3) {
    return { label: 'Overcast', Icon: Cloud };
  }

  if ([45, 48].includes(code)) {
    return { label: 'Fog', Icon: CloudFog };
  }

  if ([51, 53, 55].includes(code)) {
    return { label: 'Drizzle', Icon: CloudDrizzle };
  }

  if ([56, 57].includes(code)) {
    return { label: 'Freezing drizzle', Icon: CloudDrizzle };
  }

  if ([61, 63, 65].includes(code)) {
    return { label: 'Rain', Icon: CloudRain };
  }

  if ([66, 67].includes(code)) {
    return { label: 'Freezing rain', Icon: CloudRain };
  }

  if ([71, 73, 75, 77].includes(code)) {
    return { label: 'Snow', Icon: CloudSnow };
  }

  if ([80, 81, 82].includes(code)) {
    return { label: 'Rain showers', Icon: CloudRain };
  }

  if ([85, 86].includes(code)) {
    return { label: 'Snow showers', Icon: CloudSnow };
  }

  if ([95, 96, 99].includes(code)) {
    return { label: 'Thunderstorm', Icon: CloudLightning };
  }

  return { label: 'Unknown conditions', Icon: Cloud };
}

export function formatTemperature(value, unit = 'C') {
  if (value == null || !Number.isFinite(Number(value))) {
    return '--';
  }

  const temperature =
    unit === 'F' ? (Number(value) * 9) / 5 + 32 : Number(value);

  return `${Math.round(temperature)}°`;
}

export function formatWindSpeed(value) {
  if (value == null || !Number.isFinite(Number(value))) {
    return '--';
  }

  // Open-Meteo returns wind speed in km/h by default.
  return `${Math.round(Number(value))} km/h`;
}
