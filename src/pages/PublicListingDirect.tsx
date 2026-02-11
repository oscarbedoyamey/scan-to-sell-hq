import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import zignoLogo from '@/assets/zigno-logo.png';
import { detectPublicLang, publicListingT, type PublicListingLang } from '@/i18n/publicListingTranslations';
import PublicListingView from '@/components/listing/PublicListingView';

/**
 * /l/{listingCode} — Direct listing page (QR-only, no sign involved).
 * Resolves a listing by its unique listing_code.
 */
const PublicListingDirect = () => {
  const { listingCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [translation, setTranslation] = useState<{ title?: string | null; description?: string | null } | null>(null);
  const [lang, setLang] = useState(() => detectPublicLang());
  const t = publicListingT[lang];

  useEffect(() => {
    if (!listingCode) return;
    const load = async () => {
      try {
        const { data: listingData } = await (supabase as any)
          .from('listings_public')
          .select('*')
          .eq('listing_code', listingCode)
          .maybeSingle();

        if (!listingData) { setNotFound(true); setLoading(false); return; }
        setListing(listingData);

        // Record scan without a sign_id
        await (supabase as any).from('scans').insert({
          sign_id: null,
          listing_id: listingData.id,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          device: /Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        });

        // Fetch translation
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
  }, [listingCode, lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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

export default PublicListingDirect;
