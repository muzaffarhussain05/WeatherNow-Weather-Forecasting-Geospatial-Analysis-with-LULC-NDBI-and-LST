
import { MapPin } from 'lucide-react';

export default function SearchResults({
  results,
  onSelect,
  message,
}) {
  if (!results.length && !message) {
    return null;
  }

  return (
    <div className="search-results">
      {message && <p className="search-message">{message}</p>}

      {results.map((location) => (
        <button
  key={`${location.id}-${location.latitude}-${location.longitude}`}
  className="search-result"
  onClick={() => onSelect(location)}
>
          <MapPin size={18} />

          <span>
            <strong>{location.name}</strong>
            <small>
              {[location.admin1, location.country]
                .filter(Boolean)
                .join(', ')}
            </small>
          </span>
        </button>
      ))}
    </div>
  );
}
