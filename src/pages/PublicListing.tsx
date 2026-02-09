import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import zignoLogo from '@/assets/zigno-logo.png';

const PublicListing = () => {
  const { signCode } = useParams();

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <header className="border-b border-border bg-card">
        <div className="container-wide flex items-center h-14">
          <a href="/">
            <img src={zignoLogo} alt="ZIGNO" className="h-7 w-auto" />
          </a>
        </div>
      </header>

      <main className="section-padding">
        <div className="container-tight text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Listing: {signCode}
          </h1>
          <div className="bg-card rounded-2xl border border-border p-12 text-muted-foreground">
            <p>The public listing page will be implemented in Phase 4.</p>
            <p className="text-sm mt-2">URL: /s/{signCode}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicListing;
