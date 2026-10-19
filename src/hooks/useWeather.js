
import { useCallback, useEffect, useState } from 'react';
import { searchCities } from '../services/geocodingApi';
import { getWeather } from '../services/weatherApi';

export default function useWeather() {
  const [city, setCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  const loadWeather = useCallback(async (location) => {
    setCity(location);
  setLoading(true);
  setError('');
  setWeather(null);

    try {
      const data = await getWeather(
        location.latitude,
        location.longitude
      );

      setCity(location);
      setWeather(data);

      localStorage.setItem(
        'weather-city',
        JSON.stringify(location)
      );
    } catch {
      setError('Could not load weather. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCity = useCallback(async (query) => {
    setSearching(true);
    setError('');
    setSearchMessage('');
    setResults([]);

    try {
      const cities = await searchCities(query);

      if (cities.length === 0) {
        setSearchMessage('No matching cities found.');
      } else {
        setResults(cities);
      }
    } catch {
      setSearchMessage(
        'City search failed. Check your connection and try again.'
      );
    } finally {
      setSearching(false);
    }
  }, []);

  const selectCity = useCallback((location) => {
    setResults([]);
    setSearchMessage('');
    loadWeather(location);
  }, [loadWeather]);

  const retry = useCallback(() => {
    if (city) {
      loadWeather(city);
    }
  }, [city, loadWeather]);

useEffect(() => {
  async function initializeWeather() {
    let initialCity = {
      name: 'Islamabad',
      country: 'Pakistan',
      latitude: 33.6844,
      longitude: 73.0479,
      timezone: 'Asia/Karachi',
    };

    try {
      const saved = localStorage.getItem('weather-city');

      if (saved) {
        initialCity = JSON.parse(saved);
      }
    } catch {
      localStorage.removeItem('weather-city');
    }

    await loadWeather(initialCity);
  }

  initializeWeather();
}, [loadWeather]);

  return {
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
  };
}
