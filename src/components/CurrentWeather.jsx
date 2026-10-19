
import {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Snowflake,
} from 'lucide-react';
import { getWeatherCondition } from '../utils/weatherCodes';
import { formatTemperature, formatDate } from '../utils/formatters';

const icons = {
  sun: Sun,
  cloud: Cloud,
  'cloud-sun': CloudSun,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
  snowflake: Snowflake,
};

export function WeatherIcon({ code, size = 48, className = '' }) {
  const condition = getWeatherCondition(code);
  const Icon = icons[condition.icon] ?? Cloud;

  return (
    <Icon
      size={size}
      className={`weather-icon ${className}`}
      aria-hidden="true"
    />
  );
}

export default function CurrentWeather({ city, current, daily, unit }) {
  if (!current || !daily) {
    return null;
  }

  const condition = getWeatherCondition(current.weather_code);

  return (
    <section className="current-weather panel">
      <div className="current-heading">
        <div>
          <p className="eyebrow">
            {city.name}, {city.country}
          </p>
          <p className="date-text">{formatDate(current.time)}</p>
        </div>

        <WeatherIcon
          code={current.weather_code}
          size={76}
        />
      </div>

      <div className="temperature-block">
        <h1>{formatTemperature(current.temperature_2m, unit)}</h1>
        <h2>{condition.label}</h2>
        <p>
          Feels like {formatTemperature(current.apparent_temperature, unit)}
        </p>
      </div>

      <div className="high-low">
        <span>
          High {formatTemperature(daily.temperature_2m_max[0], unit)}
        </span>
        <span>
          Low {formatTemperature(daily.temperature_2m_min[0], unit)}
        </span>
      </div>
    </section>
  );
}
