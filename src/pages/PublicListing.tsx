import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Bed, Bath, Ruler, Phone, Mail, MessageCircle, Building2, Calendar, Zap, Car, ArrowUpFromDot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PropertyGallery } from '@/components/listing/PropertyGallery';
import { LeadForm } from '@/components/listing/LeadForm';
import zignoLogo from '@/assets/zigno-logo.png';
import type { Tables } from '@/integrations/supabase/types';

type Listing = Tables<'listings'>;
type Sign = Tables<'signs'>;

const formatPrice = (price: number | null, currency: string | null) => {
  if (!price) return null;
  return new Intl.NumberFormat('en', { style: 'currency', currency: currency || 'EUR', maximumFractionDigits: 0 }).format(price);
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment', house: 'House', villa: 'Villa', land: 'Land',
  commercial: 'Commercial', office: 'Office', garage: 'Garage', other: 'Other',
};

const CONDITION_LABELS: Record<string, string> = {
  new: 'New build', good: 'Good condition', needs_renovation: 'Needs renovation',
};

const PublicListing = () => {
  const { signCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<Listing | null>(null);
  const [sign, setSign] = useState<Sign | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!signCode) return;

    const load = async () => {
      // Record scan (fire-and-forget)
      const recordScan = async (signId: string, listingId: string) => {
        await (supabase as any).from('scans').insert({
          sign_id: signId,
          listing_id: listingId,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          device: /Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        });
      };

      try {
        const { data: signData } = await (supabase as any)
          .from('signs')
          .select('*')
          .eq('sign_code', signCode)
          .maybeSingle();

        if (!signData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setSign(signData);

        const { data: listingData } = await (supabase as any)
          .from('listings')
          .select('*')
          .eq('id', signData.listing_id)
          .maybeSingle();

        if (!listingData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setListing(listingData);

        // Fire scan
        recordScan(signData.id, listingData.id);
      } catch (err) {
        console.error('Load listing error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [signCode]);

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
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">Property not found</h1>
            <p className="text-muted-foreground">This listing may no longer be available.</p>
          </div>
        </main>
      </div>
    );
  }

  const galleryUrls = Array.isArray(listing.gallery_urls) ? (listing.gallery_urls as string[]) : [];
  const price = listing.operation_type === 'rent' ? listing.price_rent : listing.price_sale;
  const priceLabel = formatPrice(price, listing.currency);
  const address = [listing.street, listing.number].filter(Boolean).join(' ');
  const location = [listing.city, listing.region, listing.postal_code].filter(Boolean).join(', ');
  const fullLocation = [address, location].filter(Boolean).join(' · ');

  const features: { icon: React.ReactNode; label: string; value: string }[] = [];
  if (listing.bedrooms) features.push({ icon: <Bed className="w-4 h-4" />, label: 'Bedrooms', value: String(listing.bedrooms) });
  if (listing.bathrooms) features.push({ icon: <Bath className="w-4 h-4" />, label: 'Bathrooms', value: String(listing.bathrooms) });
  if (listing.built_area_m2) features.push({ icon: <Ruler className="w-4 h-4" />, label: 'Built area', value: `${listing.built_area_m2} m²` });
  if (listing.plot_area_m2) features.push({ icon: <Ruler className="w-4 h-4" />, label: 'Plot', value: `${listing.plot_area_m2} m²` });
  if (listing.year_built) features.push({ icon: <Calendar className="w-4 h-4" />, label: 'Year built', value: String(listing.year_built) });
  if (listing.energy_rating) features.push({ icon: <Zap className="w-4 h-4" />, label: 'Energy', value: listing.energy_rating });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container-wide flex items-center justify-between h-14">
          <a href="/"><img src={zignoLogo} alt="ZIGNO" className="h-7 w-auto" /></a>
          {listing.agency_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {listing.agency_logo_url && (
                <img src={listing.agency_logo_url} alt={listing.agency_name} className="h-6 w-auto" />
              )}
              <span>{listing.agency_name}</span>
            </div>
          )}
        </div>
      </header>

      <main className="container-wide py-6 sm:py-10">
        {/* Gallery */}
        <PropertyGallery coverUrl={listing.cover_image_url} galleryUrls={galleryUrls} />

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & price row */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {listing.operation_type && (
                  <Badge variant={listing.operation_type === 'sale' ? 'default' : 'secondary'} className="uppercase text-xs">
                    {listing.operation_type === 'sale' ? 'For Sale' : 'For Rent'}
                  </Badge>
                )}
                {listing.property_type && (
                  <Badge variant="outline" className="text-xs">
                    {PROPERTY_TYPE_LABELS[listing.property_type] || listing.property_type}
                  </Badge>
                )}
                {listing.condition && (
                  <Badge variant="outline" className="text-xs">
                    {CONDITION_LABELS[listing.condition] || listing.condition}
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                {listing.title || 'Property listing'}
              </h1>
              {fullLocation && (
                <p className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4 shrink-0" /> {listing.hide_exact_address ? location : fullLocation}
                </p>
              )}
              {listing.show_price && priceLabel && (
                <p className="font-display text-3xl font-bold text-accent mt-3">
                  {priceLabel}
                  {listing.operation_type === 'rent' && <span className="text-lg font-normal text-muted-foreground"> /month</span>}
                </p>
              )}
            </div>

            {/* Key features */}
            {features.length > 0 && (
              <>
                <Separator />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <div className="text-muted-foreground">{f.icon}</div>
                      <div>
                        <p className="text-xs text-muted-foreground">{f.label}</p>
                        <p className="font-semibold text-foreground">{f.value}</p>
                      </div>
                    </div>
                  ))}
                  {listing.elevator && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <ArrowUpFromDot className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Elevator</p>
                        <p className="font-semibold text-foreground">Yes</p>
                      </div>
                    </div>
                  )}
                  {listing.parking && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Parking</p>
                        <p className="font-semibold text-foreground">Yes</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Description */}
            {listing.description && (
              <>
                <Separator />
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">Description</h2>
                  <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {listing.description}
                  </div>
                </div>
              </>
            )}

            {/* Reference code */}
            {listing.reference_code && (
              <p className="text-xs text-muted-foreground">Ref: {listing.reference_code}</p>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact card */}
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-20">
              {listing.contact_name && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {listing.contact_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{listing.contact_name}</p>
                    {listing.agency_name && (
                      <p className="text-xs text-muted-foreground">{listing.agency_name}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact buttons */}
              <div className="space-y-2 mb-6">
                {listing.show_phone && listing.contact_phone && (
                  <a
                    href={`tel:${listing.contact_phone}`}
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-dark transition-colors"
                  >
                    <Phone className="w-4 h-4" /> {listing.contact_phone}
                  </a>
                )}
                {listing.show_email && listing.contact_email && (
                  <a
                    href={`mailto:${listing.contact_email}`}
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
                  >
                    <Mail className="w-4 h-4" /> {listing.contact_email}
                  </a>
                )}
                {listing.show_whatsapp && listing.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${listing.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-success text-success-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>

              {/* Lead form */}
              {listing.lead_form_enabled && (
                <>
                  <Separator className="mb-4" />
                  <h3 className="font-display font-bold text-foreground mb-3">Request information</h3>
                  <LeadForm listingId={listing.id} signId={sign?.id || null} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container-wide flex items-center justify-between">
          <a href="/"><img src={zignoLogo} alt="ZIGNO" className="h-5 w-auto opacity-60" /></a>
          <p className="text-xs text-muted-foreground">Powered by ZIGNO</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicListing;
