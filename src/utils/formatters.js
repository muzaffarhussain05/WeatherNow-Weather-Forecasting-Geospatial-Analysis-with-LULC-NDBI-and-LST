
export function formatTemperature(value, unit = 'C') {
  if (value == null || !Number.isFinite(Number(value))) {
    return '--°';
  }

  const temperature =
    unit === 'F'
      ? (Number(value) * 9) / 5 + 32
      : Number(value);

  return `${Math.round(temperature)}°`;
}

export function formatHour(dateTime) {
  return new Date(dateTime).toLocaleTimeString('en', {
    hour: 'numeric',
    hour12: true,
  });
}

export function formatDay(dateTime, index) {
  if (index === 0) {
    return 'Today';
  }

  return new Date(`${dateTime}T12:00:00`).toLocaleDateString(
    'en',
    { weekday: 'short' }
  );
}

export function formatDate(dateTime) {
  return new Date(dateTime).toLocaleDateString('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
