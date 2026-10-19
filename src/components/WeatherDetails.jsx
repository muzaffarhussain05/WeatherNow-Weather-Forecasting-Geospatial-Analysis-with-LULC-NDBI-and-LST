
import { Droplets, Wind, CloudRain, Sunrise, Sunset } from 'lucide-react';
import { formatTemperature } from '../utils/formatters';

export default function WeatherDetails({ current, daily, unit }) {
  if (!current || !daily) {
    return null;
  }

  const details = [
    {
      label: 'Humidity',
      value: `${current.relative_humidity_2m}%`,
      icon: Droplets,
    },
    {
      label: 'Wind speed',
      value: `${current.wind_speed_10m} km/h`,
      icon: Wind,
    },
    {
      label: 'Precipitation',
      value: `${current.precipitation} mm`,
      icon: CloudRain,
    },
    {
      label: 'Sunrise',
      value: new Date(daily.sunrise[0]).toLocaleTimeString('en', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon: Sunrise,
    },
    {
      label: 'Sunset',
      value: new Date(daily.sunset[0]).toLocaleTimeString('en', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      icon: Sunset,
    },
  ];

  return (
    <section className="panel">
      <h2 className="section-title">Weather details</h2>

      <div className="details-grid">
        {details.map(({ label, value, icon: Icon }) => (
          <div className="detail-item" key={label}>
            <Icon size={21} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}

        <div className="detail-item">
          <Droplets size={21} />
          <span>Feels like</span>
          <strong>{formatTemperature(current.apparent_temperature, unit)}</strong>
        </div>
      </div>
    </section>
  );
}
