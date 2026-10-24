import { useEffect, useRef, useState } from "react";
import { Clock3, MapPin, Search, X, Navigation } from "lucide-react";

import {
  searchCities,
  searchPlaces,
  reverseGeocode,
} from "../../services/geocodingApi";

function normalizeLocation(location) {
  return {
    id:
      location.id ||
      `${location.latitude}:${location.longitude}`,
    name: location.name,
    displayName: location.displayName || "",
    country: location.country || "",
    admin1: location.admin1 || "",
    category: location.category || "",
    type: location.type || "",
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    timezone: location.timezone || "Asia/Karachi",
    source: location.source || "geocoding",
  };
}

function isWithinPakistanBounds(latitude, longitude) {
  return (
    latitude >= 23 &&
    latitude <= 38 &&
    longitude >= 60 &&
    longitude <= 78
  );
}

function isPakistaniLocation(location) {
  return (
    location.country?.trim().toLowerCase() === "pakistan" ||
    location.country_code?.trim().toLowerCase() === "pk"
  );
}

function isValidLocation(location) {
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  return (
    location.name &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= 23 &&
    latitude <= 38 &&
    longitude >= 60 &&
    longitude <= 78 &&
    isPakistaniLocation(location)
  );
}

function parseCoordinates(value) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/
  );

  if (!match) {
    return null;
  }

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return { invalid: true };
  }

  return { latitude, longitude };
}

function mergeResults(cities, places) {
  const results = [];
  const seen = new Set();

  for (const item of [...cities, ...places]) {
    if (!isValidLocation(item)) {
      continue;
    }

    const location = normalizeLocation(item);

    const key = [
      location.name.trim().toLowerCase(),
      location.latitude.toFixed(4),
      location.longitude.toFixed(4),
    ].join("|");

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    results.push(location);
  }

  return results.slice(0, 12);
}

function formatPlaceType(location) {
  const type = location.type || location.category;

  if (!type) {
    return "";
  }

  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function LocationSearch({ onSelectLocation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const coordinates = parseCoordinates(query.trim());
  const isCoordinateQuery = coordinates !== null;

  useEffect(() => {
    const searchTerm = query.trim();
    let cancelled = false;

    if (searchTerm.length < 2 || parseCoordinates(searchTerm)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setLoading(false);
      setError("");
      setActiveIndex(-1);
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const [citiesResult, placesResult] =
          await Promise.allSettled([
            searchCities(searchTerm),
            searchPlaces(searchTerm),
          ]);

        if (cancelled) {
          return;
        }

        const cities =
          citiesResult.status === "fulfilled"
            ? citiesResult.value
            : [];

        const places =
          placesResult.status === "fulfilled"
            ? placesResult.value
            : [];

        if (
          citiesResult.status === "rejected" &&
          placesResult.status === "rejected"
        ) {
          throw new Error("Both search services failed.");
        }

        setResults(mergeResults(cities || [], places || []));
        setActiveIndex(-1);
      } catch {
        if (cancelled) {
          return;
        }

        setResults([]);
        setError(
          "Unable to search locations. Check your connection and try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function selectLocation(location) {
    const selected = normalizeLocation(location);

    if (
      !Number.isFinite(selected.latitude) ||
      !Number.isFinite(selected.longitude) ||
      selected.latitude < -90 ||
      selected.latitude > 90 ||
      selected.longitude < -180 ||
      selected.longitude > 180 ||
      selected.country.trim().toLowerCase() !== "pakistan"
    ) {
      setError("Unable to verify this Pakistani location.");
      return;
    }

    setQuery("");
    setResults([]);
    setError("");
    setIsOpen(false);
    setActiveIndex(-1);

    onSelectLocation?.(selected);
  }

  async function submitCoordinates() {
    if (!coordinates || coordinates.invalid) {
      setError("Enter valid coordinates, e.g. 24.8607, 67.0011.");
      return;
    }

    const { latitude, longitude } = coordinates;

    if (!isWithinPakistanBounds(latitude, longitude)) {
      setError("Coordinates are outside Pakistan.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const place = await reverseGeocode(latitude, longitude);

      if (place?.country?.trim().toLowerCase() !== "pakistan") {
        setError(
          "Could not verify that these coordinates are in Pakistan."
        );
        return;
      }

      selectLocation({
        name: place.name || "Selected location",
        country: "Pakistan",
        admin1: place.admin1 || "",
        latitude,
        longitude,
        timezone: place.timezone || "Asia/Karachi",
      });
    } catch {
      setError(
        "Could not verify these coordinates. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (event.key === "Enter" && isCoordinateQuery) {
      event.preventDefault();

      if (!coordinates.invalid && !loading) {
        submitCoordinates();
      }

      return;
    }

    if (!results.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);

      setActiveIndex((index) =>
        index < results.length - 1 ? index + 1 : 0
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index > 0 ? index - 1 : results.length - 1
      );
    }

    if (
      event.key === "Enter" &&
      activeIndex >= 0 &&
      results[activeIndex]
    ) {
      event.preventDefault();
      selectLocation(results[activeIndex]);
    }
  }

  const showDropdown =
    isOpen &&
    query.trim().length >= 2 &&
    !isCoordinateQuery;

  return (
    <section
      ref={containerRef}
      className="mx-auto w-full max-w-3xl px-4 pt-7 sm:px-6 sm:pt-10"
    >
      <div className="text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Pakistan weather explorer
        </p>

        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
          How&apos;s the weather there?
        </h1>

        <p className="mt-2 text-sm text-text-muted sm:text-base">
          Search Pakistani cities, towns, schools, colleges, or coordinates.
        </p>
      </div>

      <div className="relative mt-6">
        <div
          className={`flex items-center gap-3 rounded-2xl border bg-surface px-4 py-3.5 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 ${
            showDropdown
              ? "rounded-b-none border-primary"
              : "border-border"
          }`}
        >
          {isCoordinateQuery ? (
            <Navigation
              size={21}
              className="shrink-0 text-text-muted"
            />
          ) : (
            <Search
              size={21}
              className="shrink-0 text-text-muted"
            />
          )}

          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-label="Search Pakistani places or coordinates"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="location-search-results"
            aria-activedescendant={
              activeIndex >= 0
                ? `location-option-${activeIndex}`
                : undefined
            }
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
              setError("");
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search a place or enter 24.8607, 67.0011"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted sm:text-base"
          />

          {loading && (
            <span
              className="size-5 shrink-0 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
              aria-label="Searching"
            />
          )}

          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setError("");
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-text-muted hover:bg-surface-hover"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}

          {isCoordinateQuery && !coordinates.invalid && (
            <button
              type="button"
              onClick={submitCoordinates}
              disabled={loading}
              className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Go
            </button>
          )}
        </div>

        {isCoordinateQuery && (
          <p
            className={`mt-2 text-xs ${
              coordinates.invalid ||
              !isWithinPakistanBounds(
                coordinates.latitude,
                coordinates.longitude
              )
                ? "text-danger"
                : "text-text-muted"
            }`}
          >
            {coordinates.invalid
              ? "Enter valid latitude and longitude values."
              : !isWithinPakistanBounds(
                    coordinates.latitude,
                    coordinates.longitude
                  )
                ? "Coordinates are outside the supported Pakistan region."
                : `Coordinates detected: ${coordinates.latitude}, ${coordinates.longitude}. Country verification required.`}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-2 text-xs text-danger">
            {error}
          </p>
        )}

        {showDropdown && (
          <div
            id="location-search-results"
            role="listbox"
            aria-label="Pakistani place search results"
            className="absolute left-0 right-0 top-full z-30 overflow-hidden rounded-b-2xl border border-t-0 border-primary/30 bg-surface shadow-xl shadow-slate-900/10"
          >
            {error ? (
              <p className="px-4 py-4 text-sm text-danger">
                {error}
              </p>
            ) : loading ? (
              <p className="px-4 py-4 text-sm text-text-muted">
                Searching Pakistani locations...
              </p>
            ) : results.length > 0 ? (
              <ul className="max-h-72 overflow-y-auto p-2">
                {results.map((location, index) => {
                  const placeType = formatPlaceType(location);

                  return (
                    <li key={location.id}>
                      <button
                        id={`location-option-${index}`}
                        type="button"
                        role="option"
                        aria-selected={activeIndex === index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectLocation(location)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                          activeIndex === index
                            ? "bg-surface-hover"
                            : "hover:bg-surface-muted"
                        }`}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <MapPin size={18} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-text-primary">
                            {location.name}
                          </span>

                          <span className="block truncate text-xs text-text-muted">
                            {[
                              placeType,
                              location.admin1,
                              location.country,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-4 py-4 text-sm text-text-muted">
                No matching Pakistani places found.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-center gap-2 text-xs font-medium text-text-muted">
          <Clock3 size={14} />
          <span>Search a location to get started</span>
        </div>
      </div>
    </section>
  );
}