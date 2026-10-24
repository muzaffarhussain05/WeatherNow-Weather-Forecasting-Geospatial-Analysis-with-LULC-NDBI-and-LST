import { useState } from 'react';
import {
  Bookmark,
  CloudSun,
  Moon,
  Sun,
  Trash2,
  X,
} from 'lucide-react';

export default function AppHeader({
  unit = 'C',
  onUnitChange,
  theme = 'light',
  onToggleTheme,
  savedLocations = [],
  onSelectSavedLocation,
  onRemoveSavedLocation,
}) {
  const [showSaved, setShowSaved] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="WeatherNow home"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <CloudSun size={24} strokeWidth={2.2} />
          </span>

          <span className="min-w-0 max-sm:hidden">
            <span className="block text-lg font-extrabold tracking-tight text-text-primary sm:text-xl">
              Weather<span className="text-primary">Now</span>
            </span>
            <span className="hidden text-xs text-text-muted sm:block">
              Your weather, at a glance
            </span>
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className="flex items-center rounded-full border border-border bg-surface p-1"
            aria-label="Temperature unit"
          >
            <button
              type="button"
              onClick={() => onUnitChange?.('C')}
              aria-pressed={unit === 'C'}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                unit === 'C'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              °C
            </button>

            <button
              type="button"
              onClick={() => onUnitChange?.('F')}
              aria-pressed={unit === 'F'}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                unit === 'F'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              °F
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSaved((v) => !v)}
              className="relative flex size-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:bg-surface-hover"
              aria-label="Saved locations"
              aria-expanded={showSaved}
            >
              <Bookmark size={19} />
              {savedLocations.length > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white">
                  {savedLocations.length}
                </span>
              )}
            </button>

            {showSaved && (
              <div
                className="
                  fixed left-1/2 top-16 z-50 -translate-x-1/2
                  w-[calc(100vw-1.5rem)] max-w-sm
                  overflow-hidden rounded-2xl border border-border bg-surface
                  shadow-xl shadow-slate-900/10
                  sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[min(21rem,calc(100vw-2rem))] sm:translate-x-0
                "
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <h2 className="font-bold text-text-primary">
                      Saved locations
                    </h2>
                    <p className="text-xs text-text-muted">
                      Your bookmarked places
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSaved(false)}
                    className="rounded-full p-2 text-text-muted hover:bg-surface-hover active:bg-surface-hover"
                    aria-label="Close saved locations"
                  >
                    <X size={17} />
                  </button>
                </div>

                {savedLocations.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bookmark
                      size={25}
                      className="mx-auto mb-2 text-text-muted"
                    />
                    <p className="text-sm font-medium text-text-primary">
                      No saved locations yet
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Bookmark a city to find it here.
                    </p>
                  </div>
                ) : (
                  <ul className="max-h-[min(18rem,60vh)] overflow-y-auto overscroll-contain p-2">
                    {savedLocations.map((location) => (
                      <li
                        key={
                          location.id ||
                          `${location.latitude}:${location.longitude}`
                        }
                        className="flex items-center gap-2 rounded-xl hover:bg-surface-muted active:bg-surface-muted"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSavedLocation?.(location);
                            setShowSaved(false);
                          }}
                          className="min-w-0 flex-1 px-3 py-3 text-left"
                        >
                          <span className="block truncate text-sm font-semibold text-text-primary">
                            {location.name}
                          </span>
                          <span className="block truncate text-xs text-text-muted">
                            {[location.admin1, location.country]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemoveSavedLocation?.(location)}
                          className="mr-1 rounded-full p-2 text-text-muted hover:bg-surface-hover hover:text-danger active:bg-surface-hover"
                          aria-label={`Remove ${location.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:bg-surface-hover"
            aria-label={
              theme === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
            title={
              theme === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </div>
    </header>
  );
}