import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useWizardLabels } from './wizardLabels';
import { Home, MapPin, Bed, Bath, Ruler } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Listing = Partial<Tables<'listings'>>;

interface StepContactProps {
  data: Listing;
  onChange: (patch: Listing) => void;
}

export const StepContact = ({ data, onChange }: StepContactProps) => {
  const t = useWizardLabels();

  const price = data.operation_type === 'rent' ? data.price_rent : data.price_sale;
  const currencySymbol: Record<string, string> = { EUR: '€', GBP: '£', CHF: 'CHF', PLN: 'zł', CZK: 'Kč' };

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
            <Label className="text-sm font-semibold">{t('contactPhone')}</Label>
            <Input type="tel" value={data.contact_phone || ''} onChange={(e) => onChange({ contact_phone: e.target.value })} maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t('contactEmail')}</Label>
            <Input type="email" value={data.contact_email || ''} onChange={(e) => onChange({ contact_email: e.target.value })} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t('contactWhatsapp')}</Label>
            <Input type="tel" value={data.contact_whatsapp || ''} onChange={(e) => onChange({ contact_whatsapp: e.target.value })} maxLength={20} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('agencyName')}</Label>
          <Input value={data.agency_name || ''} onChange={(e) => onChange({ agency_name: e.target.value })} maxLength={100} />
        </div>
      </div>

      {/* Visibility toggles */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={data.show_phone ?? true} onCheckedChange={(v) => onChange({ show_phone: !!v })} />
            <span className="text-sm">{t('showPhone')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={data.show_email ?? true} onCheckedChange={(v) => onChange({ show_email: !!v })} />
            <span className="text-sm">{t('showEmail')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={data.show_whatsapp ?? false} onCheckedChange={(v) => onChange({ show_whatsapp: !!v })} />
            <span className="text-sm">{t('showWhatsapp')}</span>
          </label>
        </div>
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
