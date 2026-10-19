
import {  CloudRain,  } from 'lucide-react';
import { WeatherIcon } from './CurrentWeather';
import { formatTemperature, formatHour } from '../utils/formatters';

export default function HourlyForecast({ hourly, unit }) {
  if (!hourly) {
    return null;
  }

  return (
    <section className="panel">
      <h2 className="section-title">Hourly forecast</h2>

      <div className="hourly-list">
        {hourly.time.slice(0, 24).map((time, index) => (
          <article className="hour-card" key={time}>
            <span>{index === 0 ? 'Now' : formatHour(time)}</span>

            <WeatherIcon
              code={hourly.weather_code[index]}
              size={30}
            />

            <strong>
              {formatTemperature(hourly.temperature_2m[index], unit)}
            </strong>

            <small>
              <CloudRain size={13} />
              {hourly.precipitation_probability?.[index] ?? 0}%
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}
 