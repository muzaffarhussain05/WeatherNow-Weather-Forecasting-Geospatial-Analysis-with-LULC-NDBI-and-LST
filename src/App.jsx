
import { useState,useEffect } from 'react';

import AppHeader from './components/Header';
import LocationSearch from './components/search/LocationSearch';
import { reverseGeocode } from './services/geocodingApi.js';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import LoadingState from './components/LoadingState';
import ErrorMessage from './components/ErrorMessage';

import useTheme from './hooks/useTheme';
import useSavedLocations from './hooks/useSavedLocations';
import useWeather from './hooks/useWeather';
import WeatherDashboard from './components/WeatherDashboard';

import SatelliteMap from './components/SatelliteMap';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  
  const [locationStatus, setLocationStatus] = useState('requesting');

  const {
    city,
    weather,
    loading,
    error,
    selectCity,
    retry,
  } = useWeather();

  const {
    savedLocations,
    isSaved,
    toggleSavedLocation,
    removeSavedLocation,
  } = useSavedLocations();

  const [unit, setUnit] = useState(() => {
    try {
      const savedUnit = localStorage.getItem('weather-unit');
      return savedUnit === 'F' ? 'F' : 'C';
    } catch {
      return 'C';
    }
  });

  function handleUnitChange(nextUnit) {
    setUnit(nextUnit);

    try {
      localStorage.setItem('weather-unit', nextUnit);
    } catch {
      // Temperature selection still works for this session.
    }
  }

  function handleLocationSelect(location) {
    selectCity(location);
  }
  useEffect(() => {
  if (!navigator.geolocation) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocationStatus('unsupported');
    return;
  }

  setLocationStatus('requesting');

  navigator.geolocation.getCurrentPosition(
   async (position) => {
  const { latitude, longitude } = position.coords;

  try {
    const location = await reverseGeocode(latitude, longitude);

    selectCity(location);
    setLocationStatus('success');
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    selectCity({
      name: 'My Location',
      latitude,
      longitude,
      timezone: 'Asia/Karachi',
    });

    setLocationStatus('success');
  }
},
    (error) => {
      setLocationStatus(
        error.code === error.PERMISSION_DENIED
          ? 'denied'
          : 'unavailable'
      );
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    }
  );
}, [selectCity]);

  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
      <AppHeader
        unit={unit}
        onUnitChange={handleUnitChange}
        theme={theme}
        onToggleTheme={toggleTheme}
        savedLocations={savedLocations}
        onSelectSavedLocation={handleLocationSelect}
        onRemoveSavedLocation={removeSavedLocation}
      />

      <main id="weather" className="mx-auto max-w-7xl pb-12">
        <LocationSearch
          onSelectLocation={handleLocationSelect}
          currentLocation={city}
          isSaved={isSaved}
          onToggleSavedLocation={toggleSavedLocation}
        />

        <section
          className="mt-6 space-y-6 px-4 sm:px-6 lg:px-8"
          aria-label="Weather dashboard"
        >
          {/* {loading && <LoadingState />} */}
          {(locationStatus === 'requesting' || loading) && (
  <LoadingState />
)}

          {locationStatus !== 'requesting' && !loading && error && (
            <ErrorMessage
              message={error}
              onRetry={retry}
            />
          )}

          {locationStatus !== 'requesting' && !loading && !error && weather && city && (
            <div className="space-y-1">
              <div className=" ">
                 <WeatherDashboard
    city={city}
    current={weather.current}
    daily={weather.daily}
    unit={unit}
    currentLocation={city}
          isSaved={isSaved}
          onToggleSavedLocation={toggleSavedLocation}
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
             <SatelliteMap
  latitude={city.latitude}
  longitude={city.longitude}
/>
            </div>
            
          )}







          {locationStatus !== 'requesting' && !loading && !error && !weather && (
            <div className="rounded-3xl border border-border bg-surface px-6 py-12 text-center">
              <h2 className="text-lg font-bold text-text-primary">
                Find your weather
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Search for a city above to load its current weather
                and forecast.
              </p>
            </div>
          )}
        </section>
        
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-text-muted">
        WeatherNow · Weather data by Open-Meteo
      </footer>
    </div>
  );
}
