
import { CloudSun, Moon, Sun } from 'lucide-react';

export default function Header({ unit, onUnitChange, dark, onThemeChange }) {
  return (
    <header className="header">
      <a className="brand" href="/" aria-label="WeatherNow home">
        <CloudSun size={30} />
        <span>WeatherNow</span>
      </a>

      <div className="header-actions">
        <div className="unit-toggle" aria-label="Temperature unit">
          <button
            className={unit === 'C' ? 'active' : ''}
            onClick={() => onUnitChange('C')}
            aria-pressed={unit === 'C'}
          >
            °C
          </button>

          <button
            className={unit === 'F' ? 'active' : ''}
            onClick={() => onUnitChange('F')}
            aria-pressed={unit === 'F'}
          >
            °F
          </button>
        </div>

        <button
          className="icon-button"
          onClick={onThemeChange}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
