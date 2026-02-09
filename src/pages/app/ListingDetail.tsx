import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ListingDetail = () => {
  const { id } = useParams();

  return (
    <div className="max-w-5xl">
      <Link to="/app/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Listing Detail</h1>

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <p className="text-muted-foreground">Listing <code className="bg-secondary px-2 py-1 rounded text-sm">{id}</code> — Coming in Phase 3</p>
      </div>
    </div>
  );
};

export default ListingDetail;
