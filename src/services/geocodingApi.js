const GEOCODING_URL = import.meta.env.VITE_GEOCODING_URL;
const NOMINATIM_URL = import.meta.env.VITE_NOMINATIM_URL;
const PAKISTAN_CODE=import.meta.env.VITE_PAKISTAN_CODE;






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
    countryCode: PAKISTAN_CODE,
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`);

  if (!response.ok) {
    throw new Error('Unable to search cities.');
  }

  const data = await response.json();

  return (data.results ?? []).filter(
    (place) => place.country_code?.toLowerCase() === PAKISTAN_CODE
  );
}

export async function searchPlaces(query) {
  const placeName = query.trim();

  if (placeName.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: placeName,
    format: 'jsonv2',
    addressdetails: '1',
    countrycodes: PAKISTAN_CODE,
    limit: '8',
  });

  const response = await fetch(
    `${NOMINATIM_URL}/search?${params}`,
    {
      headers: {
        'Accept-Language': 'en',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Unable to search places.');
  }

  const data = await response.json();

  return data.map((place) => {
    const address = place.address ?? {};

    return {
      id: place.place_id,
      name:
        place.name ||
        place.namedetails?.name ||
        place.display_name.split(',')[0],
      displayName: place.display_name,
      type: place.type,
      category: place.category,
      latitude: Number(place.lat),
      longitude: Number(place.lon),
      country: address.country || 'Pakistan',
      admin1: address.state || address.province || '',
      source: 'nominatim',
    };
  });
}


export async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "jsonv2",
    addressdetails: "1",
    namedetails: "1",
    zoom: "18",
  });

  const response = await fetch(
    `${NOMINATIM_URL}/reverse?${params}`,
    {
      headers: {
        "Accept-Language": "en",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to identify this location.");
  }

  const data = await response.json();
  const address = data.address ?? {};

  const specificName =
    address.amenity ||
    address.building ||
    address.tourism ||
    address.shop ||
    address.leisure ||
    address.neighbourhood ||
    address.suburb ||
    address.quarter ||
    address.city_district ||
    address.hamlet ||
    address.village ||
    address.town ||
    address.city ||
    address.municipality ||
    address.county ||
    data.name ||
    "Selected location";

  return {
    name: specificName,
    country: address.country || "",
    admin1: address.state || address.province || "",
    latitude: Number(latitude),
    longitude: Number(longitude),
    timezone: "Asia/Karachi",
  };
}
