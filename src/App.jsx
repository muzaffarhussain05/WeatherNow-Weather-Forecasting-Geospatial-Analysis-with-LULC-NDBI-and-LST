
import { useEffect, useState } from 'react';

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import CurrentWeather from './components/CurrentWeather';
import WeatherDetails from './components/WeatherDetails';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import LoadingState from './components/LoadingState';
import ErrorMessage from './components/ErrorMessage';

import useWeather from './hooks/useWeather';

export default function App() {
  const {
    city,
    weather,
    results,
    loading,
    searching,
    error,
    searchMessage,
    searchCity,
    selectCity,
    retry,
  } = useWeather();

  const [unit, setUnit] = useState(
    () => localStorage.getItem('weather-unit') || 'C'
  );

  const [dark, setDark] = useState(
    () => localStorage.getItem('weather-theme') === 'dark'
  );

  useEffect(() => {
    localStorage.setItem('weather-unit', unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem('weather-theme', dark ? 'dark' : 'light');
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <main className="app-container">
      <Header
        unit={unit}
        onUnitChange={setUnit}
        dark={dark}
        onThemeChange={() => setDark((previous) => !previous)}
      />

      <section className="welcome">
        <h1>Weather forecast</h1>
        <p>Find out what the weather is like wherever you go.</p>
      </section>

      <SearchBar onSearch={searchCity} searching={searching} />

      <SearchResults
        results={results}
        onSelect={selectCity}
        message={searchMessage}
      />

      {loading && <LoadingState />}

      <ErrorMessage message={error} onRetry={retry} />

      {!loading && !error && weather && city && (
        <div className="weather-dashboard">
          <div className="top-grid">
            <CurrentWeather
              city={city}
              current={weather.current}
              daily={weather.daily}
              unit={unit}
            />

            <WeatherDetails
              current={weather.current}
              daily={weather.daily}
              unit={unit}
            />
          </div>

          <HourlyForecast
            hourly={weather.hourly}
            unit={unit}
          />

          <DailyForecast
            daily={weather.daily}
            unit={unit}
          />
        </div>
      )}

      <footer className="footer">
        WeatherNow · Weather data by Open-Meteo
      </footer>
    </main>
  );
}
