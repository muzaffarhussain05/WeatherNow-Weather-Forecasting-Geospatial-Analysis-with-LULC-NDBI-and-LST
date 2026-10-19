
import { Search, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ onSearch, searching }) {
  const [query, setQuery] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (query.trim().length >= 2) {
      onSearch(query.trim());
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <Search size={20} />

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search city, e.g. Karachi"
        aria-label="Search city"
        minLength={2}
        required
      />

      <button type="submit" disabled={searching}>
        {searching ? (
          <LoaderCircle className="spin" size={18} />
        ) : (
          'Search'
        )}
      </button>
    </form>
  );
}
