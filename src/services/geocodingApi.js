
const GEOCODING_URL = import.meta.env.VITE_GEOCODING_URL;

export async function searchCities(query) {
  const cityName = query.trim();

  if (cityName.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    name: cityName,
    count: '5',
    language: 'en',
    format: 'json',
  });

  const response = await fetch(
    `${GEOCODING_URL}?${params}`
  );

  if (!response.ok) {
    throw new Error('Unable to search cities.');
  }

  const data = await response.json();

  return data.results ?? [];
}
