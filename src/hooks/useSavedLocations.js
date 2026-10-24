
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'weathernow-saved-locations';

function readSavedLocations() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]',
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function getLocationId(location) {
  return `${location.latitude}:${location.longitude}`;
}

export default function useSavedLocations() {
  const [savedLocations, setSavedLocations] = useState(
    readSavedLocations,
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedLocations),
      );
    } catch {
      // Bookmarks remain usable during this session.
    }
  }, [savedLocations]);

  function isSaved(location) {
    return savedLocations.some(
      (saved) =>
        getLocationId(saved) === getLocationId(location),
    );
  }

  function toggleSavedLocation(location) {
    setSavedLocations((current) => {
      const exists = current.some(
        (saved) =>
          getLocationId(saved) === getLocationId(location),
      );

      if (exists) {
        return current.filter(
          (saved) =>
            getLocationId(saved) !== getLocationId(location),
        );
      }

      return [
        ...current,
        {
          id: getLocationId(location),
          name: location.name,
          country: location.country || '',
          admin1: location.admin1 || '',
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        },
      ];
    });
  }

  function removeSavedLocation(location) {
    setSavedLocations((current) =>
      current.filter(
        (saved) =>
          getLocationId(saved) !== getLocationId(location),
      ),
    );
  }

  return {
    savedLocations,
    isSaved,
    toggleSavedLocation,
    removeSavedLocation,
  };
}
