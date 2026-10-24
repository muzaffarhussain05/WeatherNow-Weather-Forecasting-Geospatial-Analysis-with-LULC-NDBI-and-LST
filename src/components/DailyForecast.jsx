import { useEffect, useState } from 'react';
import { CalendarDays, Droplets } from 'lucide-react';
import {
  getWeatherInfo,
  formatTemperature,
} from '../utils/weather';

// Helper to determine icon color based on weather code
function getIconColor(code) {
  if (code === 0 || code === 1) return 'text-amber-500 fill-amber-500/20 dark:text-amber-400 dark:fill-amber-400/20';
  if (code >= 2 && code <= 48) return 'text-blue-400 fill-blue-400/20 dark:text-blue-300 dark:fill-blue-300/20';
  if (code >= 51 && code <= 67) return 'text-blue-600 fill-blue-600/20 dark:text-blue-500 dark:fill-blue-500/20';
  if (code >= 71 && code <= 77) return 'text-cyan-500 fill-cyan-500/20 dark:text-cyan-400 dark:fill-cyan-400/20';
  if (code >= 80 && code <= 82) return 'text-blue-600 fill-blue-600/20 dark:text-blue-500 dark:fill-blue-500/20';
  if (code >= 85 && code <= 86) return 'text-cyan-500 fill-cyan-500/20 dark:text-cyan-400 dark:fill-cyan-400/20';
  if (code >= 95 && code <= 99) return 'text-purple-500 fill-purple-500/20 dark:text-purple-400 dark:fill-purple-400/20';
  return 'text-slate-700 fill-transparent dark:text-slate-200';
}

// Helper to generate the multi-color gradient for the temperature bar
function getTemperatureGradient(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 'from-slate-300 to-slate-400';
  
  const avg = (min + max) / 2;
  
  if (avg <= 10) return 'from-blue-400 via-cyan-400 to-teal-400'; 
  if (avg <= 20) return 'from-teal-400 via-cyan-400 to-blue-400'; 
  if (avg <= 25) return 'from-cyan-400 via-yellow-400 to-orange-400'; 
  if (avg <= 30) return 'from-cyan-400 via-yellow-400 to-orange-500';
  if (avg <= 35) return 'from-cyan-400 via-orange-400 to-red-500';
  return 'from-orange-400 via-red-500 to-rose-600'; 
}

export default function DailyForecast({
  daily,
  unit = 'C',
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!daily?.time?.length) return null;

  const today = new Date().toLocaleDateString('en-CA');

  const sharedBgClass = "rounded-[2rem] border border-blue-100 dark:border-slate-700 bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-sm transition-all duration-500";

  return (
    <section className={`w-full p-4 sm:p-8 ${sharedBgClass}`}>
      
      {/* Header */}
      <div className="mb-5 flex items-center justify-between sm:mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100/50 dark:bg-blue-900/30 sm:h-8 sm:w-8">
            <CalendarDays size={16} className="text-blue-500 dark:text-blue-400 sm:size-[18px]" strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-slate-700 dark:text-slate-100 sm:text-xl">
            7-Day Extended Forecast
          </h2>
        </div>
        <span className="hidden rounded-full bg-slate-100/80 px-3 py-1 text-[11px] font-medium tracking-wide text-slate-400 sm:block dark:bg-slate-800 dark:text-slate-500">
          ECMWF High-Res
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {daily.time.map((date, index) => {
          const { label, Icon } = getWeatherInfo(daily.weather_code?.[index]);
          const isToday = date === today;
          
          const minTemp = daily.temperature_2m_min?.[index];
          const maxTemp = daily.temperature_2m_max?.[index];
          const precipitationProb = daily.precipitation_probability_max?.[index] || 0;

          const barWidth = getTemperatureBarWidth(
            minTemp,
            maxTemp,
            daily.temperature_2m_min,
            daily.temperature_2m_max
          );
          const barOffset = getTemperatureBarOffset(
            minTemp, 
            daily.temperature_2m_min, 
            daily.temperature_2m_max
          );
          const barGradient = getTemperatureGradient(minTemp, maxTemp);

          return (
            <article
              key={date}
              className={`group flex flex-col gap-3 rounded-2xl px-3 py-3 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-sm sm:grid sm:grid-cols-[1fr_1.5fr_auto] sm:items-center sm:gap-4 sm:px-4 sm:py-3.5 ${
                isToday 
                  ? 'bg-[#f0f3f8] dark:bg-slate-800/80' 
                  : 'hover:bg-white/60 dark:hover:bg-slate-800/40'
              } ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: `${mounted ? index * 75 : 0}ms` }}
            >
              
              {/* Row 1 (Mobile) / Column 1 (Desktop): Day & Date */}
              <div className="flex items-center justify-between sm:flex-col sm:items-start">
                <div className="flex flex-col">
                  <p className={`text-sm font-semibold sm:text-base ${isToday ? 'text-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {isToday ? 'Today' : formatDay(date)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 sm:text-[11px]">
                    {formatDate(date)}
                  </p>
                </div>

                {/* Mobile only: Max Temp preview on the right */}
                <span className="text-sm font-bold text-slate-900 dark:text-white sm:hidden">
                  {formatTemperature(maxTemp, unit)}
                </span>
              </div>

              {/* Row 2 (Mobile) / Column 2 (Desktop): Icon, Label, Precip */}
              <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                
                <div className="flex items-center gap-2.5 sm:w-[130px]">
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                    className={`shrink-0 transition-transform duration-300 group-hover:scale-110 sm:size-[22px] ${getIconColor(daily.weather_code?.[index])}`}
                    aria-label={label}
                  />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 sm:truncate sm:text-sm">
                    {label}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 dark:text-blue-400 sm:w-12 sm:gap-1.5 sm:text-xs">
                  <Droplets size={12} className="fill-blue-500/20 sm:size-[13px]" strokeWidth={2} />
                  <span>{precipitationProb}%</span>
                </div>
              </div>

              {/* Row 3 (Mobile) / Column 3 (Desktop): Temps & Bar */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-200/50 pt-3 dark:border-slate-700/50 sm:justify-end sm:border-0 sm:pt-0 sm:gap-4">
                
                <span className="w-6 text-left text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-right sm:text-sm">
                  {formatTemperature(minTemp, unit)}
                </span>

                <div className="relative h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/70 sm:w-16">
                  {/* Animated Gradient Bar */}
                  <div
                    className={`absolute top-0 h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-1000 ease-out`}
                    style={{
                      width: mounted ? `${barWidth}%` : '0%',
                      left: mounted ? `${barOffset}%` : '0%'
                    }}
                  />
                </div>

                <span className="w-6 text-right text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                  {formatTemperature(maxTemp, unit)}
                </span>
              </div>

            </article>
          );
        })}
      </div>
    </section>
  );
}

// Formatting Helpers
function formatDay(value) {
  const date = parseLocalDate(value);
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

function formatDate(value) {
  const date = parseLocalDate(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Math Helpers for the Temperature Bar
function getTemperatureBarWidth(min, max, allMins = [], allMaxes = []) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 0;
  const validMins = allMins.filter(Number.isFinite);
  const validMaxes = allMaxes.filter(Number.isFinite);
  if (!validMins.length || !validMaxes.length) return 50;

  const lowest = Math.min(...validMins);
  const highest = Math.max(...validMaxes);
  const range = highest - lowest;
  if (range === 0) return 100;

  const width = ((max - min) / range) * 100;
  return Math.max(15, Math.min(100, width)); 
}

function getTemperatureBarOffset(min, allMins = [], allMaxes = []) {
  if (!Number.isFinite(min)) return 0;
  const validMins = allMins.filter(Number.isFinite);
  const validMaxes = allMaxes.filter(Number.isFinite);
  if (!validMins.length || !validMaxes.length) return 0;

  const lowest = Math.min(...validMins);
  const highest = Math.max(...validMaxes);
  const range = highest - lowest;
  if (range === 0) return 0;

  const offset = ((min - lowest) / range) * 100;
  return Math.max(0, Math.min(85, offset)); 
}