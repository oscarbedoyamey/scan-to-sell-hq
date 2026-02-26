import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useWizardLabels } from './wizardLabels';
import { CountryCodeSelect } from './CountryCodeSelect';
import { Home, MapPin, Bed, Bath, Ruler, AlertCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Listing = Partial<Tables<'listings'>>;

interface StepContactProps {
  data: Listing;
  onChange: (patch: Listing) => void;
}

/** Extract country code prefix from a full phone string, e.g. "+34612…" → "+34" */
const extractCountryCode = (phone: string | null | undefined): string => {
  if (!phone) return '+34';
  const match = phone.match(/^(\+\d{1,4})/);
  return match ? match[1] : '+34';
};

/** Extract phone number without country code */
const extractLocalNumber = (phone: string | null | undefined, countryCode: string): string => {
  if (!phone) return '';
  if (phone.startsWith(countryCode)) return phone.slice(countryCode.length).trim();
  // fallback: strip any leading +XX
  return phone.replace(/^\+\d{1,4}\s?/, '').trim();
};

export const StepContact = ({ data, onChange }: StepContactProps) => {
  const t = useWizardLabels();
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(
    data.contact_whatsapp === data.contact_phone && !!data.contact_phone
  );
  const [waCountryCode, setWaCountryCode] = useState(() => extractCountryCode(data.contact_whatsapp));
  const [waLocalNumber, setWaLocalNumber] = useState(() => extractLocalNumber(data.contact_whatsapp, extractCountryCode(data.contact_whatsapp)));

  const price = data.operation_type === 'rent' ? data.price_rent : data.price_sale;
  const currencySymbol: Record<string, string> = { EUR: '€', GBP: '£', CHF: 'CHF', PLN: 'zł', CZK: 'Kč' };

  const showPhone = data.show_phone ?? false;
  const showEmail = data.show_email ?? true;
  const showWhatsapp = data.show_whatsapp ?? false;
  const showForm = data.lead_form_enabled ?? true;

  const hasAtLeastOne = showPhone || showEmail || showWhatsapp || showForm;

  const phoneNeeded = (showPhone || showWhatsapp) && !data.contact_phone?.trim();
  const emailNeeded = showEmail && !data.contact_email?.trim();

  const handleWhatsappToggle = (same: boolean) => {
    setWhatsappSameAsPhone(same);
    if (same) {
      onChange({ contact_whatsapp: data.contact_phone || '' });
    } else {
      // Build from country code + local
      const full = waCountryCode + waLocalNumber;
      onChange({ contact_whatsapp: full });
    }
  };

  const handlePhoneChange = (phone: string) => {
    const patch: Listing = { contact_phone: phone };
    if (whatsappSameAsPhone) {
      patch.contact_whatsapp = phone;
    }
    onChange(patch);
  };

  const handleWaCountryCode = (code: string) => {
    setWaCountryCode(code);
    const full = code + waLocalNumber;
    onChange({ contact_whatsapp: full });
  };

  const handleWaLocalNumber = (num: string) => {
    setWaLocalNumber(num);
    const full = waCountryCode + num;
    onChange({ contact_whatsapp: full });
  };

  return (
    <div className="space-y-8">
      {/* Contact fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t('contactName')} *</Label>
            <Input value={data.contact_name || ''} onChange={(e) => onChange({ contact_name: e.target.value })} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t('contactPhone')} {(showPhone || showWhatsapp) && '*'}</Label>
            <Input
              type="tel"
              value={data.contact_phone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={20}
              className={phoneNeeded ? 'border-destructive' : ''}
            />
            {phoneNeeded && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {t('phoneRequiredForOption')}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t('contactEmail')} {showEmail && '*'}</Label>
            <Input
              type="email"
              value={data.contact_email || ''}
              onChange={(e) => onChange({ contact_email: e.target.value })}
              maxLength={100}
              className={emailNeeded ? 'border-destructive' : ''}
            />
            {emailNeeded && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {t('emailRequiredForOption')}
              </p>
            )}
          </div>
        </div>

        {/* WhatsApp number field (only when whatsapp enabled and not same as phone) */}
        {showWhatsapp && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">{t('whatsappNumber')}</Label>
              {data.contact_phone?.trim() && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={whatsappSameAsPhone}
                    onCheckedChange={handleWhatsappToggle}
                    className="scale-90"
                  />
                  <span className="text-xs text-muted-foreground">{t('sameAsPhone')}</span>
                </div>
              )}
            </div>
            {!whatsappSameAsPhone && (
              <div className="flex gap-2">
                <CountryCodeSelect value={waCountryCode} onChange={handleWaCountryCode} />
                <Input
                  type="tel"
                  value={waLocalNumber}
                  onChange={(e) => handleWaLocalNumber(e.target.value)}
                  maxLength={15}
                  placeholder="612 345 678"
                  className="flex-1"
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('agencyName')}</Label>
          <Input value={data.agency_name || ''} onChange={(e) => onChange({ agency_name: e.target.value })} maxLength={100} />
        </div>
      </div>

      {/* Visibility toggles */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={showPhone} onCheckedChange={(v) => onChange({ show_phone: !!v })} />
            <span className="text-sm">{t('showPhone')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={showEmail} onCheckedChange={(v) => onChange({ show_email: !!v })} />
            <span className="text-sm">{t('showEmail')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={showWhatsapp} onCheckedChange={(v) => {
              const checked = !!v;
              onChange({ show_whatsapp: checked });
              if (checked && whatsappSameAsPhone) {
                onChange({ show_whatsapp: true, contact_whatsapp: data.contact_phone || '' });
              }
            }} />
            <span className="text-sm">{t('showWhatsapp')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={showForm} onCheckedChange={(v) => onChange({ lead_form_enabled: !!v })} />
            <span className="text-sm">{t('showContactForm')}</span>
          </label>
        </div>

        {!hasAtLeastOne && (
          <p className="text-sm text-destructive flex items-center gap-1 bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" /> {t('atLeastOneContact')}
          </p>
        )}
      </div>

      <Separator />

      {/* Review summary */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-foreground">{t('review')}</h3>
        <div className="bg-secondary/50 rounded-xl p-6 space-y-4">
          {data.title && (
            <h4 className="font-display text-xl font-bold text-foreground">{data.title}</h4>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {data.property_type && (
              <span className="flex items-center gap-1"><Home className="w-4 h-4" /> {t(data.property_type)}</span>
            )}
            {data.city && (
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.city}{data.country ? `, ${data.country}` : ''}</span>
            )}
            {data.bedrooms != null && (
              <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {data.bedrooms}</span>
            )}
            {data.bathrooms != null && (
              <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {data.bathrooms}</span>
            )}
            {data.built_area_m2 != null && (
              <span className="flex items-center gap-1"><Ruler className="w-4 h-4" /> {data.built_area_m2} m²</span>
            )}
          </div>
          {price != null && (
            <p className="text-2xl font-display font-bold text-foreground">
              {currencySymbol[data.currency || 'EUR'] || '€'}{Number(price).toLocaleString()}
              {data.operation_type === 'rent' ? '/mo' : ''}
            </p>
          )}
          {data.cover_image_url && (
            <img src={data.cover_image_url} alt="Cover" className="w-full max-h-48 object-cover rounded-lg" />
          )}
          {data.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{data.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
