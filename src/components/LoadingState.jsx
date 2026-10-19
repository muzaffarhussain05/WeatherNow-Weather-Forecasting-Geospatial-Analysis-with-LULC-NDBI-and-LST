
import { LoaderCircle } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="status-message" role="status">
      <LoaderCircle className="spin" size={30} />
      <p>Loading weather...</p>
    </div>
  );
}
