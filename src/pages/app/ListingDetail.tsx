import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, QrCode, FileText, Download, RefreshCw, ExternalLink, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Listing = Tables<'listings'>;
type Sign = Tables<'signs'>;

const ListingDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [signs, setSigns] = useState<Sign[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [{ data: l }, { data: s }] = await Promise.all([
        supabase.from('listings').select('*').eq('id', id).single(),
        supabase.from('signs').select('*').eq('listing_id', id).order('created_at', { ascending: false }),
      ]);
      setListing(l);
      setSigns(s || []);
      setLoading(false);
    };
    load();
  }, [id]);

  const generateAssets = async (signId: string) => {
    setGenerating(signId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await supabase.functions.invoke('generate-sign-assets', {
        body: { sign_id: signId },
      });

      if (res.error) throw new Error(res.error.message);

      toast({ title: 'Assets generated', description: 'QR and PDF have been created successfully.' });

      // Refresh signs
      const { data: updated } = await supabase.from('signs').select('*').eq('listing_id', id!).order('created_at', { ascending: false });
      setSigns(updated || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const getPublicUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('generated-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-5xl">
        <Link to="/app/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>
        <p className="text-muted-foreground">Listing not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <Link to="/app/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      {/* Listing header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{listing.title || 'Untitled listing'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {[listing.city, listing.region].filter(Boolean).join(', ') || 'No location'}
          </p>
        </div>
        <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="uppercase text-xs">
          {listing.status}
        </Badge>
      </div>

      <Separator className="mb-8" />

      {/* Signs section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <QrCode className="h-5 w-5" /> Signs & QR Codes
          </h2>
        </div>

        {signs.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <QrCode className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-1">No signs created yet for this listing.</p>
            <p className="text-xs text-muted-foreground">Signs are created when you purchase a plan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {signs.map((sign) => {
              const qrUrl = getPublicUrl(sign.qr_image_path);
              const pdfUrl = getPublicUrl(sign.sign_pdf_path);
              const isGenerating = generating === sign.id;

              return (
                <div key={sign.id} className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* QR preview */}
                    <div className="shrink-0">
                      {qrUrl ? (
                        <img src={qrUrl} alt="QR Code" className="w-32 h-32 rounded-xl border border-border" />
                      ) : (
                        <div className="w-32 h-32 rounded-xl border border-dashed border-border flex items-center justify-center bg-muted/50">
                          <QrCode className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Sign info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="bg-secondary px-2 py-0.5 rounded text-xs font-mono">{sign.sign_code}</code>
                        <Badge variant="outline" className="text-xs">{sign.size || 'A4'}</Badge>
                        <Badge variant="outline" className="text-xs">{sign.orientation || 'portrait'}</Badge>
                      </div>

                      {sign.headline_text && (
                        <p className="text-sm font-semibold text-foreground mb-1">{sign.headline_text}</p>
                      )}

                      {sign.public_url && (
                        <a
                          href={sign.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> {sign.public_url.replace('https://', '')}
                        </a>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => generateAssets(sign.id)}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : sign.qr_image_path ? (
                            <RefreshCw className="h-4 w-4 mr-1" />
                          ) : (
                            <QrCode className="h-4 w-4 mr-1" />
                          )}
                          {sign.qr_image_path ? 'Regenerate' : 'Generate assets'}
                        </Button>

                        {qrUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={qrUrl} download={`qr-${sign.sign_code}.png`}>
                              <Download className="h-4 w-4 mr-1" /> QR PNG
                            </a>
                          </Button>
                        )}

                        {pdfUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={pdfUrl} download={`sign-${sign.sign_code}.pdf`}>
                              <FileText className="h-4 w-4 mr-1" /> PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
