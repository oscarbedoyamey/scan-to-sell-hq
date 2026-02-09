import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useWizardLabels } from './wizardLabels';
import type { Tables } from '@/integrations/supabase/types';

type Listing = Partial<Tables<'listings'>>;

interface StepPropertyProps {
  data: Listing;
  onChange: (patch: Listing) => void;
}

const propertyTypes = ['apartment', 'house', 'villa', 'land', 'commercial', 'office', 'garage', 'other'] as const;
const conditions = [
  { value: 'new', labelKey: 'condNew' },
  { value: 'good', labelKey: 'condGood' },
  { value: 'needs_renovation', labelKey: 'condRenov' },
] as const;

export const StepProperty = ({ data, onChange }: StepPropertyProps) => {
  const t = useWizardLabels();

  return (
    <div className="space-y-8">
      {/* Operation type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">{t('operationType')} *</Label>
        <div className="flex gap-3">
          {(['sale', 'rent'] as const).map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => onChange({ operation_type: op })}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                data.operation_type === op
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40'
              }`}
            >
              {t(op)}
            </button>
          ))}
        </div>
      </div>

      {/* Property type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">{t('propertyType')} *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {propertyTypes.map((pt) => (
            <button
              key={pt}
              type="button"
              onClick={() => onChange({ property_type: pt })}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                data.property_type === pt
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40'
              }`}
            >
              {t(pt)}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-semibold">{t('listingTitle')} *</Label>
        <Input
          id="title"
          value={data.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={t('titlePlaceholder')}
          maxLength={120}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold">{t('description')}</Label>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          maxLength={2000}
        />
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('price')} *</Label>
          <Input
            type="number"
            min={0}
            value={data.operation_type === 'rent' ? (data.price_rent ?? '') : (data.price_sale ?? '')}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              onChange(data.operation_type === 'rent' ? { price_rent: val } : { price_sale: val });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('currency')}</Label>
          <Select value={data.currency || 'EUR'} onValueChange={(v) => onChange({ currency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="CHF">CHF</SelectItem>
              <SelectItem value="PLN">PLN (zł)</SelectItem>
              <SelectItem value="CZK">CZK (Kč)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Characteristics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('bedrooms')}</Label>
          <Input type="number" min={0} value={data.bedrooms ?? ''} onChange={(e) => onChange({ bedrooms: e.target.value ? Number(e.target.value) : null })} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('bathrooms')}</Label>
          <Input type="number" min={0} value={data.bathrooms ?? ''} onChange={(e) => onChange({ bathrooms: e.target.value ? Number(e.target.value) : null })} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('builtArea')}</Label>
          <Input type="number" min={0} value={data.built_area_m2 ?? ''} onChange={(e) => onChange({ built_area_m2: e.target.value ? Number(e.target.value) : null })} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('plotArea')}</Label>
          <Input type="number" min={0} value={data.plot_area_m2 ?? ''} onChange={(e) => onChange({ plot_area_m2: e.target.value ? Number(e.target.value) : null })} />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">{t('address')}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input placeholder={t('street')} value={data.street || ''} onChange={(e) => onChange({ street: e.target.value })} />
          <Input placeholder={t('city')} value={data.city || ''} onChange={(e) => onChange({ city: e.target.value })} />
          <Input placeholder={t('postalCode')} value={data.postal_code || ''} onChange={(e) => onChange({ postal_code: e.target.value })} />
          <Input placeholder={t('region')} value={data.region || ''} onChange={(e) => onChange({ region: e.target.value })} />
          <Input placeholder={t('country')} value={data.country || ''} onChange={(e) => onChange({ country: e.target.value })} />
        </div>
      </div>

      {/* Condition + Year */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('condition')}</Label>
          <Select value={data.condition || ''} onValueChange={(v: any) => onChange({ condition: v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {conditions.map((c) => (
                <SelectItem key={c.value} value={c.value}>{t(c.labelKey)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('yearBuilt')}</Label>
          <Input type="number" min={1800} max={2030} value={data.year_built ?? ''} onChange={(e) => onChange({ year_built: e.target.value ? Number(e.target.value) : null })} />
        </div>
      </div>

      {/* Extras */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">{t('extras')}</Label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={data.elevator || false} onCheckedChange={(v) => onChange({ elevator: !!v })} />
            <span className="text-sm">{t('elevator')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={data.parking || false} onCheckedChange={(v) => onChange({ parking: !!v })} />
            <span className="text-sm">{t('parking')}</span>
          </label>
        </div>
      </div>
    </div>
  );
};
