import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import zignoLogo from '@/assets/zigno-logo.png';
import { detectPublicLang, publicListingT, type PublicListingLang } from '@/i18n/publicListingTranslations';
import PublicListingView from '@/components/listing/PublicListingView';

/**
 * /listing/{listingId} — Public listing page accessed after scanning an activated sign.
 * No authentication required. Shows 404 for draft listings.
 */
const PublicListingById = () => {
  const { listingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [translation, setTranslation] = useState<{ title?: string | null; description?: string | null } | null>(null);
  const [lang, setLang] = useState(() => detectPublicLang());
  const t = publicListingT[lang];

  useEffect(() => {
    if (!listingId) return;
    const load = async () => {
      try {
        const { data: listingData } = await (supabase as any)
          .from('listings_public')
          .select('*')
          .eq('id', listingId)
          .maybeSingle();

        if (!listingData) { setNotFound(true); setLoading(false); return; }

        if (listingData.status === 'draft') {
          setIsDraft(true);
          setLoading(false);
          return;
        }

        setListing(listingData);

        // Record scan without a sign
        await (supabase as any).from('scans').insert({
          sign_id: null,
          listing_id: listingData.id,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          device: /Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        });

        // Fetch translation if needed
        if (lang !== (listingData.base_language || 'es')) {
          const { data: trans } = await (supabase as any)
            .from('listing_translations')
            .select('title, description')
            .eq('listing_id', listingData.id)
            .eq('language', lang)
            .maybeSingle();
          setTranslation(trans);
        }
      } catch (err) {
        console.error('Load listing error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [listingId, lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isDraft) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container-wide flex items-center h-14">
            <a href="/"><img src={zignoLogo} alt="ZIGNO" className="h-7 w-auto" /></a>
          </div>
        </header>
        <main className="section-padding">
          <div className="container-tight text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">Inmueble no disponible aún</h1>
            <p className="text-muted-foreground">El propietario aún no ha publicado la información de este inmueble. Vuelve a escanear el cartel más tarde.</p>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container-wide flex items-center h-14">
            <a href="/"><img src={zignoLogo} alt="ZIGNO" className="h-7 w-auto" /></a>
          </div>
        </header>
        <main className="section-padding">
          <div className="container-tight text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">{t.notFound}</h1>
            <p className="text-muted-foreground">{t.notFoundSub}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <PublicListingView
      listing={listing}
      sign={null}
      translation={translation}
      lang={lang}
      onLangChange={(l) => setLang(l as PublicListingLang)}
    />
  );
};

export default PublicListingById;
