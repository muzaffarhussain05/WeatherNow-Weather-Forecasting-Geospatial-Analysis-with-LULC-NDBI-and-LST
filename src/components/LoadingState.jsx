import { LoaderCircle } from 'lucide-react';

export default function LoadingState() {
  return (
    <div
      className="relative flex min-h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 px-6 py-12 text-center shadow-sm transition-colors duration-300 dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 sm:min-h-[400px]"
      role="status"
      aria-live="polite"
    >
      {/* Decorative background blobs to match the app's aesthetic */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-orange-200/30 blur-3xl dark:bg-orange-900/20" />

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Animated Loader Container */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
          {/* Pulsing outer rings */}
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/10 dark:bg-blue-400/10" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-2 animate-pulse rounded-full bg-blue-500/20 dark:bg-blue-400/20" />
          
          {/* Glassmorphism circle behind the icon */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-white/70 shadow-sm backdrop-blur-md dark:border-slate-600/60 dark:bg-slate-800/70">
            <LoaderCircle
              size={28}
              strokeWidth={2.5}
              className="animate-spin text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Text Content with subtle shimmer effect */}
        <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white sm:text-xl">
          Gathering your forecast...
        </h2>

        <p className="mt-2 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
          Connecting to the live weather sensors to fetch the latest conditions.
        </p>

        {/* A subtle visual indicator (shimmer bar) */}
        <div className="mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700/60">
          <div className="h-full w-full animate-pulse bg-blue-500/50 dark:bg-blue-400/50 rounded-full" />
        </div>
      </div>

      <span className="sr-only">
        Please wait while weather data loads.
      </span>
    </div>
  );
}