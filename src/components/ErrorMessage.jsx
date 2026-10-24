
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div
      className="flex flex-col gap-4 rounded-3xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          size={22}
          className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          aria-hidden="true"
        />

        <div>
          <h2 className="font-semibold text-red-800 dark:text-red-300">
            Unable to load weather
          </h2>

          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-400">
            {message}
          </p>
        </div>
      </div>

      {typeof onRetry === 'function' && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 sm:self-auto"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
