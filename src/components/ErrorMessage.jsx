
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-message" role="alert">
      <AlertCircle size={22} />
      <p>{message}</p>

      <button onClick={onRetry}>
        <RefreshCw size={16} />
        Retry
      </button>
    </div>
  );
}
