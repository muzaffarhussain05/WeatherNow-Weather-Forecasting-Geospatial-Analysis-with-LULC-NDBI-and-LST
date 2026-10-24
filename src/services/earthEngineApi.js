
const API_URL = import.meta.env.VITE_API_BASE_URL;

import { getErrorMessage } from "../utils/errorMessage";

export async function retryEarthEngineConnection() {
  const response = await fetch(`${API_URL}/api/earth/reconnect`, {
    method: "POST",
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Earth Engine connection failed. Please try again."
    );
  }

  return data;
}

export async function getSatelliteLayers(latitude, longitude) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    start: "2025-01-01",
    end: "2026-01-01",
  });

  const response = await fetch(
    `${API_URL}/api/earth/layers?${params}`,
    { cache: "no-store" }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        `Satellite API request failed (${response.status}).`
      )
    );
  }

  return data;
}
