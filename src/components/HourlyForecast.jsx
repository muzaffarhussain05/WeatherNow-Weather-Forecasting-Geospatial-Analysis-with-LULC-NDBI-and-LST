/* eslint-disable react-hooks/purity */
import { useMemo, useState, useRef, useEffect } from 'react';
import {
  Droplets,
  Clock3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  getWeatherInfo,
  formatTemperature,
} from '../utils/weather';

// Helper to determine icon color based on weather code
function getIconColor(code, isCurrentHour) {
  if (isCurrentHour) return 'text-white fill-white/20';
  
  if (code === 0 || code === 1) {
    return 'text-yellow-500 fill-yellow-500/20 dark:text-yellow-400 dark:fill-yellow-400/20';
  }
  if (code >= 2 && code <= 48) {
    return 'text-blue-400 fill-blue-400/20 dark:text-blue-300 dark:fill-blue-300/20';
  }
  if (code >= 51 && code <= 67) {
    return 'text-blue-600 fill-blue-600/20 dark:text-blue-500 dark:fill-blue-500/20';
  }
  if (code >= 71 && code <= 77) {
    return 'text-cyan-500 fill-cyan-500/20 dark:text-cyan-400 dark:fill-cyan-400/20';
  }
  if (code >= 80 && code <= 82) {
    return 'text-blue-600 fill-blue-600/20 dark:text-blue-500 dark:fill-blue-500/20';
  }
  if (code >= 85 && code <= 86) {
    return 'text-cyan-500 fill-cyan-500/20 dark:text-cyan-400 dark:fill-cyan-400/20';
  }
  if (code >= 95 && code <= 99) {
    return 'text-purple-500 fill-purple-500/20 dark:text-purple-400 dark:fill-purple-400/20';
  }
  
  return 'text-slate-700 fill-transparent dark:text-slate-200';
}

export default function HourlyForecast({
  hourly,
  unit = 'C',
}) {
  const [metric, setMetric] = useState('temperature');
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const hours = useMemo(() => {
    if (!hourly?.time) return [];

    const now = Date.now();

    return hourly.time
      .map((time, index) => ({
        time,
        temperature: hourly.temperature_2m?.[index],
        precipitationProbability:
          hourly.precipitation_probability?.[index],
        weatherCode: hourly.weather_code?.[index],
        index,
      }))
      .filter((hour) => {
        const timestamp = new Date(hour.time).getTime();
        return (
          Number.isFinite(timestamp) &&
          timestamp >= now - 60 * 60 * 1000
        );
      })
      .slice(0, 24);
  }, [hourly]);

  if (!hours.length) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const sharedBgClass = "rounded-[2rem] border border-blue-100 dark:border-slate-700 bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-sm transition-all duration-500";

  return (
    <section className={`w-full p-4 mb-7 sm:p-8 ${sharedBgClass}`}>
      
      {/* Header Section */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100/50 dark:bg-blue-900/30 mt-0.5">
            <Clock3 size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
              Hourly Outlook
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Continuous 24-hour sensor telemetry projection
            </p>
          </div>
        </div>

        {/* Toggle Pills */}
        <div className="flex w-full rounded-xl bg-gray-100 p-1 backdrop-blur-sm border border-white/60 dark:bg-slate-800/50 dark:border-slate-700/60 sm:w-fit">
          <button
            type="button"
            onClick={() => setMetric('temperature')}
            aria-pressed={metric === 'temperature'}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 sm:flex-none sm:px-4 sm:text-sm ${
              metric === 'temperature'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Temperature
          </button>
          <button
            type="button"
            onClick={() => setMetric('rain')}
            aria-pressed={metric === 'rain'}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 sm:flex-none sm:px-4 sm:text-sm ${
              metric === 'rain'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Precipitation %
          </button>
        </div>
      </div>

      {/* Scrollable Hourly List */}
      <div className="relative mt-6 group/scroll">
        
        <button 
          onClick={() => scroll('left')}
          className="absolute -left-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-md transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95 sm:flex dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 opacity-0 group-hover/scroll:opacity-100"
        >
          <ChevronLeft size={18} />
        </button>

        <div 
          ref={scrollRef}
          className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 snap-x sm:mx-0 sm:gap-3 sm:px-1"
        >
          {hours.map((hour, index) => {
            const { label, Icon } = getWeatherInfo(hour.weatherCode);
            const isCurrentHour = index === 0;
            
            const iconColorClass = getIconColor(hour.weatherCode, isCurrentHour);

            return (
              <article
                key={hour.time}
                className={`group/card flex w-[88px] shrink-0 snap-start flex-col items-center rounded-3xl p-3 transition-all duration-500 ease-out sm:w-[100px] sm:p-4 ${
                  isCurrentHour
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 dark:bg-blue-500'
                    : 'bg-white/60 dark:bg-slate-800/60 border border-white/60 dark:border-slate-700/60 shadow-sm hover:-translate-y-1 hover:bg-white/90 hover:shadow-md dark:hover:bg-slate-800/90'
                } ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: `${mounted ? index * 50 : 0}ms` }}
              >
                <p className={`text-[10px] font-semibold tracking-wider uppercase sm:text-[11px] ${
                  isCurrentHour ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {isCurrentHour ? 'NOW' : formatHour(hour.time)}
                </p>

                <Icon
                  size={24}
                  strokeWidth={1.6}
                  className={`my-3 transition-transform duration-300 group-hover/card:scale-110 sm:my-4 sm:size-[26px] ${iconColorClass}`}
                  aria-label={label}
                />

                {/* Animated Metric Text */}
                <div className="relative h-7 w-full overflow-hidden flex justify-center items-center">
                  <p 
                    key={metric}
                    className={`absolute text-lg font-bold transition-all duration-300 animate-[slideUpFade_0.3s_ease-out] sm:text-xl ${
                      isCurrentHour ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {metric === 'temperature' 
                      ? formatTemperature(hour.temperature, unit)
                      : (hour.precipitationProbability == null ? '--' : `${hour.precipitationProbability}%`)
                    }
                  </p>
                </div>

                <div className={`mt-1 flex items-center gap-1 text-[11px] font-medium sm:mt-2 sm:text-xs ${
                  isCurrentHour ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  <Droplets size={11} className={isCurrentHour ? 'text-blue-200' : 'text-blue-500'} />
                  <span>{hour.precipitationProbability || 0}%</span>
                </div>
              </article>
            );
          })}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-md transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95 sm:flex dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 opacity-0 group-hover/scroll:opacity-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

function formatHour(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleTimeString([], { hour: 'numeric' });
}