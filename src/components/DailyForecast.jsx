
import { WeatherIcon } from './CurrentWeather';
import { formatTemperature, formatDay } from '../utils/formatters';

export default function DailyForecast({ daily, unit }) {
  if (!daily) {
    return null;
  }

  return (
    <section className="panel">
      <h2 className="section-title">7-day forecast</h2>

      <div className="daily-list">
        {daily.time.map((date, index) => (
          <article className="daily-row" key={date}>
            <span className="day-name">
              {formatDay(date, index)}
            </span>

            <WeatherIcon
              code={daily.weather_code[index]}
              size={28}
            />

            <div className="daily-condition">
              <span>Daily forecast</span>
            </div>

            <div className="daily-temperatures">
              <strong>
                {formatTemperature(daily.temperature_2m_max[index], unit)}
              </strong>

              <span>
                {formatTemperature(daily.temperature_2m_min[index], unit)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
