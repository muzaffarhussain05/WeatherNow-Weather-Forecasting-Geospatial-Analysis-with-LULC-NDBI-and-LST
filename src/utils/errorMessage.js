
export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (typeof error === 'string') {
    return error.trim() || fallback;
  }

  if (error == null) {
    return fallback;
  }

  if (Array.isArray(error)) {
    const messages = error
      .map((item) => getErrorMessage(item, ''))
      .filter(Boolean);

    return messages.length ? messages.join(', ') : fallback;
  }

  if (typeof error === 'object') {
    const detail = error.response?.data?.detail
      ?? error.response?.data?.message
      ?? error.detail
      ?? error.message
      ?? error.error;

    if (detail != null && detail !== error) {
      return getErrorMessage(detail, fallback);
    }

    if (typeof error.msg === 'string') {
      const location = Array.isArray(error.loc)
        ? error.loc.filter((part) => part !== 'body').join(' → ')
        : '';

      return location
        ? `${location}: ${error.msg}`
        : error.msg;
    }

    try {
      const serialized = JSON.stringify(error);

      if (serialized && serialized !== '{}') {
        return serialized;
      }
    } catch {
      // Handle circular objects.
    }
  }

  return fallback;
}
