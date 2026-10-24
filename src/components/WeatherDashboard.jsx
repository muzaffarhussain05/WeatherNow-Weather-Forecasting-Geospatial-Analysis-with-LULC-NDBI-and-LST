import { useEffect, useState } from 'react';
import {
  MapPin,
  Bookmark,
  Check,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Compass,
  Eye,
  Sunrise,
  Sunset,
  
} from 'lucide-react';

import {
  getWeatherInfo,
  formatTemperature,
} from '../utils/weather';

// Helpers...
function formatValue(value, suffix = '') {
  if (value == null || !Number.isFinite(Number(value))) return '--';
  return `${value}${suffix}`;
}
function getWindDirection(degrees) {
  if (degrees == null) return '--';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
}
function getUVInfo(uvIndex) {
  if (uvIndex == null) return { label: '--', progress: 0, color: 'bg-slate-400' };
  const uv = Number(uvIndex);
  if (uv <= 2) return { label: 'Low', progress: (uv / 11) * 100, color: 'bg-green-500' };
  if (uv <= 5) return { label: 'Moderate', progress: (uv / 11) * 100, color: 'bg-yellow-500' };
  if (uv <= 7) return { label: 'High', progress: (uv / 11) * 100, color: 'bg-orange-500' };
  if (uv <= 10) return { label: 'Very High', progress: (uv / 11) * 100, color: 'bg-red-500' };
  return { label: 'Extreme', progress: 100, color: 'bg-purple-600' };
}
function formatTime(isoString) {
  if (!isoString) return '--:--';
  return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function WeatherDashboard({
  city,
  current,
  daily,
  unit = 'C',
  isSaved = () => false,
  onToggleSavedLocation,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!current) return null;

  const { label, Icon } = getWeatherInfo(current.weather_code, current.is_day);
  const high = daily?.temperature_2m_max?.[0];
  const low = daily?.temperature_2m_min?.[0];

  const locationName = [city?.name, city?.admin1, city?.country].filter(Boolean).join(', ');
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(now);
  const formattedTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(now);
  const coords = city?.latitude && city?.longitude ? `${city.latitude}° ${city.longitude}°` : '';

  const saved = city ? isSaved(city) : false;

  const uvData = getUVInfo(current.uv_index);
  const windDir = getWindDirection(current.wind_direction_10m);
  const windProgress = Math.min((current.wind_speed_10m / 50) * 100, 100);

  const sunriseTime = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]) : null;
  const sunsetTime = daily?.sunset?.[0] ? new Date(daily.sunset[0]) : null;
  let remainingDaylight = '--';
  let sunProgress = 0;
  
  if (sunriseTime && sunsetTime) {
    const totalDaylightMs = sunsetTime - sunriseTime;
    const elapsedMs = now - sunriseTime;
    const remainingMs = sunsetTime - now;
    if (remainingMs > 0) {
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      remainingDaylight = `${hours}h ${minutes}m`;
    } else {
      remainingDaylight = '0h 0m';
    }
    sunProgress = Math.min(Math.max((elapsedMs / totalDaylightMs) * 100, 0), 100);
  }

  const topDetails = [
    {
      label: 'HUMIDITY',
      value: formatValue(current.relative_humidity_2m, '%'),
      description: current.relative_humidity_2m > 60 ? 'Humid' : 'Comfortable',
      Icon: Droplets,
      iconColor: 'text-blue-500 dark:text-blue-400',
      iconBg: 'bg-blue-100/50 dark:bg-blue-900/30',
      progress: current.relative_humidity_2m || 0,
      progressColor: 'bg-blue-500',
    },
    {
      label: 'WIND SPEED',
      value: formatValue(current.wind_speed_10m, ' km/h'),
      description: <span className="flex items-center gap-1 truncate">Dir: {windDir} • Gusts {formatValue(current.wind_gusts_10m, ' km/h')}</span>,
      Icon: Wind,
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      iconBg: 'bg-indigo-100/50 dark:bg-indigo-900/30',
      progress: windProgress,
      progressColor: 'bg-indigo-600',
    },
    {
      label: 'PRECIPITATION',
      value: formatValue(current.precipitation, ' mm'),
      description: `Probability: ${formatValue(daily?.precipitation_probability_max?.[0], '%')}`,
      Icon: CloudRain,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-100/50 dark:bg-cyan-900/30',
      progress: current.precipitation > 0 ? 100 : 0,
      progressColor: 'bg-cyan-600',
    },
    {
      label: 'UV INDEX',
      value: formatValue(current.uv_index),
      description: 'Sun protection advised',
      Icon: Sun,
      iconColor: 'text-orange-500 dark:text-orange-400',
      iconBg: 'bg-orange-100/50 dark:bg-orange-900/30',
      progress: uvData.progress,
      progressColor: uvData.color,
      badge: uvData.label,
    },
  ];

  const sharedBgClass = "rounded-[2rem] border border-blue-100 dark:border-slate-700 bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-sm transition-all duration-500 hover:shadow-md";

  return (
    <div className="mx-auto w-full max-w-[1400px] p-3 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12 items-stretch">
        
        {/* LEFT SIDE: CURRENT WEATHER HERO CARD */}
        <div className={`xl:col-span-5 flex flex-col transition-all duration-1000 ease-out ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <section className={`relative flex h-full flex-col justify-between overflow-hidden p-4 sm:p-8 ${sharedBgClass}`}>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-orange-50/30 dark:from-orange-900/10 to-transparent" />

            <div className="relative z-10 flex flex-col h-full gap-4 sm:gap-6">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 shrink-0 text-slate-800 dark:text-slate-200 sm:h-6 sm:w-6" strokeWidth={2.5} />
                    <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white sm:text-2xl">
                      {locationName || 'Selected location'}
                    </h1>
                  </div>
                  
                  {city && (
                    <button
                      type="button"
                      onClick={() => onToggleSavedLocation?.(city)}
                      className={`shrink-0 rounded-full p-1.5 transition-all duration-300 hover:scale-105 active:scale-90 sm:p-2 ${
                        saved 
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/70' 
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300'
                      }`}
                      aria-label={saved ? "Remove from saved locations" : "Save location"}
                    >
                      {saved ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:mt-2 sm:gap-x-3 sm:text-xs">
                  <span>{formattedDate} • {formattedTime}</span>
                  {coords && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>{coords}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Main Temp Display */}
              <div className="flex flex-1 items-center gap-4 sm:gap-6">
                <div className="relative shrink-0 flex items-center justify-center">
                  {/* Animated Glowing Background */}
                  <div className="absolute inset-0 scale-150 rounded-full bg-orange-400/20 blur-2xl dark:bg-orange-500/20 animate-pulse" />
                  {/* Icon with Scale In/Out Breathing Animation */}
                  <Icon 
                    className="relative h-20 w-20 fill-orange-400 text-orange-400 drop-shadow-md sm:h-28 sm:w-28 dark:fill-orange-500 dark:text-orange-500 animate-[breathe_4s_ease-in-out_infinite]" 
                    strokeWidth={1} 
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-6xl font-bold tracking-tighter text-slate-900 dark:text-white sm:text-7xl lg:text-8xl">
                      {formatTemperature(current.temperature_2m, unit).replace('°', '')}
                      <span className="align-top text-3xl text-slate-400 sm:text-4xl dark:text-slate-500">°</span>
                    </span>
                    <div className="mt-2 sm:mt-3">
                      <span className="text-lg font-bold text-blue-600 sm:text-2xl dark:text-blue-400">{label}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500 sm:mt-2 sm:text-sm dark:text-slate-400">
                    Feels like {formatTemperature(current.apparent_temperature, unit)}
                  </p>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-3 gap-1.5 sm:gap-3">
                <div className="group flex flex-col items-center justify-center rounded-xl bg-white/60 dark:bg-slate-800/60 px-1 py-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 sm:px-3 sm:py-2.5 border border-white/50 dark:border-slate-700/50 dark:hover:bg-slate-800/90">
                
                  <span className="text-[9px] font-bold text-slate-500 transition-colors group-hover:text-slate-700 sm:text-[10px] dark:text-slate-400 dark:group-hover:text-slate-200 uppercase">High</span>
                  <span className="text-xs font-bold text-slate-900 sm:text-sm dark:text-white">{formatTemperature(high, unit)}</span>
                </div>
                <div className="group flex flex-col items-center justify-center rounded-xl bg-white/60 dark:bg-slate-800/60 px-1 py-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 sm:px-3 sm:py-2.5 border border-white/50 dark:border-slate-700/50 dark:hover:bg-slate-800/90">
                
                  <span className="text-[9px] font-bold text-slate-500 transition-colors group-hover:text-slate-700 sm:text-[10px] dark:text-slate-400 dark:group-hover:text-slate-200 uppercase">Low</span>
                  <span className="text-xs font-bold text-slate-900 sm:text-sm dark:text-white">{formatTemperature(low, unit)}</span>
                </div>
                <div className="group flex flex-col items-center justify-center rounded-xl bg-white/60 dark:bg-slate-800/60 px-1 py-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 sm:px-3 sm:py-2.5 border border-white/50 dark:border-slate-700/50 dark:hover:bg-slate-800/90">
                  <span className="text-[9px] font-bold text-slate-500 transition-colors group-hover:text-slate-700 sm:text-[10px] dark:text-slate-400 dark:group-hover:text-slate-200 uppercase">Dew Pt</span>
                  <span className="text-xs font-bold text-slate-900 sm:text-sm dark:text-white">{formatValue(current.dew_point_2m, '°')}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT SIDE: WEATHER HIGHLIGHTS */}
        <div className={`xl:col-span-7 flex flex-col transition-all duration-1000 ease-out delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <section className={`flex h-full w-full flex-col p-4 sm:p-8 ${sharedBgClass}`}>
            <div className="mb-4 flex items-center justify-between sm:mb-5">
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="h-1.5 w-1.5 rounded-sm bg-blue-600 sm:h-2 sm:w-2"></div>
                  <div className="h-1.5 w-1.5 rounded-sm bg-blue-400 sm:h-2 sm:w-2"></div>
                  <div className="h-1.5 w-1.5 rounded-sm bg-blue-400 sm:h-2 sm:w-2"></div>
                  <div className="h-1.5 w-1.5 rounded-sm bg-blue-600 sm:h-2 sm:w-2"></div>
                </div>
                <h2 className="text-lg font-bold text-slate-800 sm:text-xl dark:text-white">Today's Highlights</h2>
              </div>
              <span className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 sm:block">Real-time Sensor Feed</span>
            </div>

            {/* Top 4 Cards Grid */}
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {topDetails.map(({ label, value, description, Icon, iconColor, iconBg, progress, progressColor, badge }, index) => (
                <article 
                  key={label} 
                  className={`group flex flex-col justify-between rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/70 p-3 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/90 hover:shadow-md dark:hover:bg-slate-800/90 sm:rounded-3xl sm:p-4 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                  style={{ transitionDelay: `${mounted ? 300 + index * 100 : 0}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase sm:text-[11px]">{label}</p>
                    <div className={`rounded-full p-1 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 sm:p-1.5 ${iconBg}`}>
                      <Icon size={14} className={`sm:size-4 ${iconColor}`} />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <div className="flex items-baseline gap-1.5 sm:gap-2">
                      <p className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{value}</p>
                      {badge && <span className={`rounded-md px-1 py-0.5 text-[9px] font-semibold text-white sm:px-1.5 sm:text-[10px] ${progressColor}`}>{badge}</span>}
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 sm:mt-1 sm:text-[11px]">{description}</p>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/50 dark:bg-slate-700/50 sm:mt-4">
                    <div 
                      className={`h-full rounded-full ${progressColor} transition-all duration-1000 ease-out`} 
                      style={{ width: mounted ? `${progress}%` : '0%' }}
                    ></div>
                  </div>
                </article>
              ))}
            </div>

            {/* Bottom 3 Cards Grid */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-3">
              
              {/* Pressure */}
              <article className={`group flex items-center gap-3 rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/70 p-4 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/90 hover:shadow-md dark:hover:bg-slate-800/90 sm:gap-4 sm:rounded-3xl sm:p-5 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: '700ms' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100/50 transition-colors duration-300 group-hover:bg-blue-100/50 dark:bg-slate-700/50 dark:group-hover:bg-blue-900/30 sm:h-12 sm:w-12">
                  <Compass size={20} className="text-slate-500 transition-all duration-300 group-hover:rotate-45 group-hover:text-blue-500 dark:text-slate-400 dark:group-hover:text-blue-400 sm:size-[22px]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase sm:text-[11px]">PRESSURE (QNH)</p>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <p className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">{current.surface_pressure ? Math.round(current.surface_pressure).toLocaleString() : '--'}</p>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">hPa</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 sm:mt-1 sm:text-[11px]">Barometric pressure</p>
                </div>
              </article>

              {/* Visibility */}
              <article className={`group flex items-center gap-3 rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/70 p-4 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/90 hover:shadow-md dark:hover:bg-slate-800/90 sm:gap-4 sm:rounded-3xl sm:p-5 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: '800ms' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100/50 transition-colors duration-300 group-hover:bg-blue-100/50 dark:bg-slate-700/50 dark:group-hover:bg-blue-900/30 sm:h-12 sm:w-12">
                  <Eye size={20} className="text-slate-500 transition-colors duration-300 group-hover:text-blue-500 dark:text-slate-400 dark:group-hover:text-blue-400 sm:size-[22px]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase sm:text-[11px]">VISIBILITY</p>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <p className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">{current.visibility ? (current.visibility / 1000).toFixed(1) : '--'}</p>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">km</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 sm:mt-1 sm:text-[11px]">Clear horizon distance</p>
                </div>
              </article>

              {/* Solar Ephemeris */}
              <article className={`group flex flex-col justify-between rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-800/70 p-4 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/90 hover:shadow-md dark:hover:bg-slate-800/90 sm:rounded-3xl sm:p-5 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                style={{ transitionDelay: '900ms' }}>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase sm:text-[11px]">SOLAR EPHEMERIS</p>
                  <p className="text-[10px] font-medium text-orange-500 transition-all duration-500 dark:text-orange-400 sm:text-xs">
                    Remaining: {remainingDaylight}
                  </p>
                </div>
                <div className="my-1 px-1 sm:px-2">
                  <svg viewBox="0 0 200 30" className="w-full h-6 sm:h-8 overflow-visible">
                    <path d="M 10 25 Q 100 -10 190 25" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                    <circle 
                      cx={mounted ? (10 + (sunProgress / 100) * 180) : 10} 
                      cy={mounted ? (25 - Math.sin((sunProgress / 100) * Math.PI) * 35) : 25} 
                      r="4" 
                      fill="#f59e0b" 
                      className="transition-all duration-1000 ease-out" 
                    />
                    {sunProgress < 100 && mounted && (
                      <path 
                        d={`M ${10 + (sunProgress / 100) * 180} ${25 - Math.sin((sunProgress / 100) * Math.PI) * 35} Q 170 18 190 25`} 
                        fill="none" 
                        stroke="#cbd5e1" 
                        className="dark:stroke-slate-600" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeDasharray="4 4" 
                      />
                    )}
                  </svg>
                </div>
                <div className="flex items-center justify-between mt-1 sm:mt-0">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Sunrise size={12} className="text-orange-400 sm:size-[14px]" />
                    <div>
                      <p className="text-[8px] text-slate-500 dark:text-slate-400 uppercase sm:text-[9px]">Rise</p>
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 sm:text-xs">{formatTime(daily?.sunrise?.[0])}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Sunset size={12} className="text-blue-500 dark:text-blue-400 sm:size-[14px]" />
                    <div>
                      <p className="text-[8px] text-slate-500 dark:text-slate-400 uppercase sm:text-[9px]">Set</p>
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 sm:text-xs">{formatTime(daily?.sunset?.[0])}</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}