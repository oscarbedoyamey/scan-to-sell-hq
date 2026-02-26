import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useWizardLabels } from './wizardLabels';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// We use `any` for dynamic fields not yet in generated types
type Listing = Record<string, any>;

interface StepPropertyProps {
  data: Listing;
  onChange: (patch: Listing) => void;
}

const propertyTypes = ['apartment', 'house', 'villa', 'land', 'commercial', 'office', 'garage', 'warehouse', 'other'] as const;

const isResidential = (pt: string | null) =>
  ['apartment', 'house', 'villa'].includes(pt || '');

const conditions = [
  { value: 'needs_renovation', labelKey: 'condRenov' },
  { value: 'good', labelKey: 'condGood' },
  { value: 'renovated', labelKey: 'condRenovated' },
  { value: 'new', labelKey: 'condNew' },
] as const;

/* ── Tiny helper components ── */

const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <Label className="text-sm font-semibold">
    {label} {required && <span className="text-destructive">*</span>}
  </Label>
);

const NumberField = ({
  label, value, onChange, required, min, max, placeholder,
}: {
  label: string; value: any; onChange: (v: number | null) => void;
  required?: boolean; min?: number; max?: number; placeholder?: string;
}) => (
  <div className="space-y-2">
    <FieldLabel label={label} required={required} />
    <Input
      type="number"
      min={min ?? 0}
      max={max}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    />
  </div>
);

const SelectField = ({
  label, value, onChange, options, required, placeholder,
}: {
  label: string; value: string | null | undefined; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean; placeholder?: string;
}) => (
  <div className="space-y-2">
    <FieldLabel label={label} required={required} />
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder || '—'} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const YesNoField = ({
  label, value, onChange, required,
}: {
  label: string; value: boolean | null | undefined; onChange: (v: boolean) => void; required?: boolean;
}) => {
  const t = useWizardLabels();
  return (
    <div className="space-y-2">
      <FieldLabel label={label} required={required} />
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
              value === v
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40'
            }`}
          >
            {v ? t('yes') : t('no')}
          </button>
        ))}
      </div>
    </div>
  );
};

const YesNoDontKnowField = ({
  label, value, onChange, required,
}: {
  label: string; value: string | null | undefined; onChange: (v: string) => void; required?: boolean;
}) => {
  const t = useWizardLabels();
  const opts = [
    { v: 'yes', l: t('yes') },
    { v: 'no', l: t('no') },
    { v: 'unknown', l: t('dontKnow') },
  ];
  return (
    <div className="space-y-2">
      <FieldLabel label={label} required={required} />
      <div className="flex gap-2">
        {opts.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
              value === o.v
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40'
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
};

const MultiCheckField = ({
  label, value, onChange, options, required,
}: {
  label: string; value: string[] | null | undefined;
  onChange: (v: string[]) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) => {
  const current = value || [];
  const toggle = (val: string) => {
    if (current.includes(val)) onChange(current.filter((v) => v !== val));
    else onChange([...current, val]);
  };
  return (
    <div className="space-y-2">
      <FieldLabel label={label} required={required} />
      <div className="flex flex-wrap gap-3">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={current.includes(o.value)} onCheckedChange={() => toggle(o.value)} />
            <span className="text-sm">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

/* ── Main Component ── */

export const StepProperty = ({ data, onChange }: StepPropertyProps) => {
  const t = useWizardLabels();
  const opType = data.operation_type as string | null;
  const propType = data.property_type as string | null;
  const isRent = opType === 'rent';
  const residential = isResidential(propType);

  return (
    <div className="space-y-8">
      {/* ═══ OPERATION TYPE ═══ */}
      <div className="space-y-3">
        <FieldLabel label={t('operationType')} required />
        <div className="flex gap-3">
          {(['sale', 'rent'] as const).map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => onChange({ operation_type: op })}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                opType === op
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40'
              }`}
            >
              {t(op)}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ PROPERTY TYPE ═══ */}
      <div className="space-y-3">
        <FieldLabel label={t('propertyType')} required />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {propertyTypes.map((pt) => (
            <button
              key={pt}
              type="button"
              onClick={() => onChange({ property_type: pt })}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                propType === pt
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40'
              }`}
            >
              {t(pt)}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ RENT-SPECIFIC: rental type, availability, furnished ═══ */}
      {isRent && residential && (
        <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
          <p className="text-sm font-semibold text-foreground">{t('sectionRentalDetails')}</p>
          <SelectField
            label={t('rentalType')}
            required
            value={data.rental_type}
            onChange={(v) => onChange({ rental_type: v })}
            options={[
              { value: 'long_term', label: t('longTerm') },
              { value: 'short_term', label: t('shortTerm') },
            ]}
          />
          <div className="space-y-2">
            <FieldLabel label={t('availabilityDate')} required />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !data.availability_date && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.availability_date ? format(new Date(data.availability_date), 'PPP') : '—'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.availability_date ? new Date(data.availability_date) : undefined}
                  onSelect={(d) => onChange({ availability_date: d ? format(d, 'yyyy-MM-dd') : null })}
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>
          <SelectField
            label={t('furnished')}
            required
            value={data.furnished}
            onChange={(v) => onChange({ furnished: v })}
            options={[
              { value: 'yes', label: t('furnishedYes') },
              { value: 'no', label: t('furnishedNo') },
              { value: 'semi', label: t('furnishedSemi') },
            ]}
          />
        </div>
      )}

      {/* ═══ TITLE ═══ */}
      <div className="space-y-2">
        <FieldLabel label={t('listingTitle')} required />
        <Input
          id="title"
          value={data.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={t('titlePlaceholder')}
          maxLength={120}
        />
      </div>

      {/* ═══ DESCRIPTION ═══ */}
      <div className="space-y-2">
        <FieldLabel label={t('description')} />
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          maxLength={2000}
        />
      </div>

      {/* ═══ PRICE ═══ */}
      <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
        <p className="text-sm font-semibold text-foreground">{t('sectionPrice')}</p>
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label={isRent ? t('priceRent') : t('priceSale')}
            required
            value={isRent ? data.price_rent : data.price_sale}
            onChange={(val) => onChange(isRent ? { price_rent: val } : { price_sale: val })}
          />
          <SelectField
            label={t('currency')}
            value={data.currency || 'EUR'}
            onChange={(v) => onChange({ currency: v })}
            options={[
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'CHF', label: 'CHF' },
              { value: 'PLN', label: 'PLN (zł)' },
              { value: 'CZK', label: 'CZK (Kč)' },
            ]}
          />
        </div>
        {isRent && (
          <SelectField
            label={t('expensesIncluded')}
            required
            value={data.expenses_included}
            onChange={(v) => onChange({ expenses_included: v })}
            options={[
              { value: 'yes', label: t('expensesYes') },
              { value: 'no', label: t('expensesNo') },
              { value: 'partial', label: t('expensesPartial') },
            ]}
          />
        )}
      </div>

      {/* ═══ TYPE-SPECIFIC CHARACTERISTICS ═══ */}
      {propType && (
        <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
          <p className="text-sm font-semibold text-foreground">{t('sectionCharacteristics')}</p>

          {/* ── A) Apartment ── */}
          {propType === 'apartment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <NumberField label={t('builtArea')} required value={data.built_area_m2} onChange={(v) => onChange({ built_area_m2: v })} />
                <NumberField label={t('bedrooms')} required value={data.bedrooms} onChange={(v) => onChange({ bedrooms: v })} />
                <NumberField label={t('bathrooms')} required value={data.bathrooms} onChange={(v) => onChange({ bathrooms: v })} />
              </div>
              <NumberField label={t('floor')} value={data.floor} onChange={(v) => onChange({ floor: v != null ? String(v) : null })} />
              <YesNoField label={t('elevator')} required value={data.elevator} onChange={(v) => onChange({ elevator: v })} />
              <SelectField
                label={t('orientation')} required value={data.orientation}
                onChange={(v) => onChange({ orientation: v })}
                options={[
                  { value: 'exterior', label: t('exterior') },
                  { value: 'interior', label: t('interior') },
                  { value: 'mixed', label: t('mixed') },
                ]}
              />
              <YesNoField label={t('terrace')} value={data.terrace} onChange={(v) => onChange({ terrace: v })} />
              <SelectField
                label={t('parkingType')} value={data.parking_type}
                onChange={(v) => onChange({ parking_type: v })}
                options={[
                  { value: 'no', label: t('parkingNo') },
                  { value: 'included', label: t('parkingIncluded') },
                  { value: 'optional', label: t('parkingOptional') },
                ]}
              />
              <SelectField
                label={t('condition')} required value={data.condition}
                onChange={(v) => onChange({ condition: v })}
                options={conditions.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
              />
            </div>
          )}

          {/* ── B) Villa / House ── */}
          {(propType === 'villa' || propType === 'house') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <NumberField label={t('builtArea')} required value={data.built_area_m2} onChange={(v) => onChange({ built_area_m2: v })} />
                <NumberField label={t('plotArea')} required value={data.plot_area_m2} onChange={(v) => onChange({ plot_area_m2: v })} />
                <NumberField label={t('bedrooms')} required value={data.bedrooms} onChange={(v) => onChange({ bedrooms: v })} />
                <NumberField label={t('bathrooms')} required value={data.bathrooms} onChange={(v) => onChange({ bathrooms: v })} />
              </div>
              <YesNoField label={t('pool')} value={data.pool} onChange={(v) => onChange({ pool: v })} />
              <YesNoField label={t('parking')} value={data.parking} onChange={(v) => onChange({ parking: v })} />
              <SelectField
                label={t('condition')} required value={data.condition}
                onChange={(v) => onChange({ condition: v })}
                options={conditions.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
              />
            </div>
          )}

          {/* ── C) Land ── */}
          {propType === 'land' && (
            <div className="space-y-4">
              <SelectField
                label={t('landType')} required value={data.land_type}
                onChange={(v) => onChange({ land_type: v })}
                options={[
                  { value: 'urban', label: t('landUrban') },
                  { value: 'developable', label: t('landDevelopable') },
                  { value: 'rustic', label: t('landRustic') },
                ]}
              />
              <NumberField label={t('plotArea')} required value={data.plot_area_m2} onChange={(v) => onChange({ plot_area_m2: v })} />
              {(data.land_type === 'urban' || data.land_type === 'developable') && (
                <>
                  <div className="space-y-2">
                    <FieldLabel label={t('buildability')} required />
                    <Input value={data.buildability || ''} onChange={(e) => onChange({ buildability: e.target.value })} />
                  </div>
                  <SelectField
                    label={t('permittedUse')} required value={data.permitted_use}
                    onChange={(v) => onChange({ permitted_use: v })}
                    options={[
                      { value: 'residential', label: t('useResidential') },
                      { value: 'tertiary', label: t('useTertiary') },
                      { value: 'industrial', label: t('useIndustrial') },
                      { value: 'other', label: t('useOther') },
                    ]}
                  />
                </>
              )}
              <YesNoField label={t('roadAccess')} required value={data.road_access} onChange={(v) => onChange({ road_access: v })} />
              <MultiCheckField
                label={t('utilities')} value={data.utilities}
                onChange={(v) => onChange({ utilities: v })}
                options={[
                  { value: 'water', label: t('utilWater') },
                  { value: 'electricity', label: t('utilElectricity') },
                  { value: 'sewage', label: t('utilSewage') },
                  { value: 'gas', label: t('utilGas') },
                  { value: 'none', label: t('utilNone') },
                  { value: 'unknown', label: t('utilUnknown') },
                ]}
              />
            </div>
          )}

          {/* ── D) Garage ── */}
          {propType === 'garage' && (
            <div className="space-y-4">
              <SelectField
                label={t('garageType')} required value={data.garage_type}
                onChange={(v) => onChange({ garage_type: v })}
                options={[
                  { value: 'car', label: t('garageCar') },
                  { value: 'motorcycle', label: t('garageMoto') },
                  { value: 'box', label: t('garageBox') },
                ]}
              />
              <SelectField
                label={t('garageLocation')} required value={data.garage_location}
                onChange={(v) => onChange({ garage_location: v })}
                options={[
                  { value: 'interior', label: t('garageInterior') },
                  { value: 'exterior', label: t('garageExterior') },
                  { value: 'underground', label: t('garageUnderground') },
                ]}
              />
              <SelectField
                label={t('garageAccess')} required value={data.garage_access}
                onChange={(v) => onChange({ garage_access: v })}
                options={[
                  { value: 'ramp', label: t('garageRamp') },
                  { value: 'elevator', label: t('garageElevator') },
                  { value: 'other', label: t('garageAccessOther') },
                ]}
              />
              <YesNoDontKnowField label={t('largeCar')} required value={data.large_car} onChange={(v) => onChange({ large_car: v })} />
              <SelectField
                label={t('evCharging')} value={data.ev_charging}
                onChange={(v) => onChange({ ev_charging: v })}
                options={[
                  { value: 'yes', label: t('evYes') },
                  { value: 'preinstall', label: t('evPreinstall') },
                  { value: 'no', label: t('evNo') },
                  { value: 'unknown', label: t('evUnknown') },
                ]}
              />
            </div>
          )}

          {/* ── E) Office ── */}
          {propType === 'office' && (
            <div className="space-y-4">
              <NumberField label={t('builtArea')} required value={data.built_area_m2} onChange={(v) => onChange({ built_area_m2: v })} />
              <NumberField label={t('numOffices')} value={data.num_offices} onChange={(v) => onChange({ num_offices: v })} />
              <NumberField label={t('bathrooms')} value={data.bathrooms} onChange={(v) => onChange({ bathrooms: v })} />
              <YesNoDontKnowField label={t('airConditioning')} required value={data.air_conditioning} onChange={(v) => onChange({ air_conditioning: v })} />
              <SelectField
                label={t('condition')} required value={data.condition}
                onChange={(v) => onChange({ condition: v })}
                options={conditions.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
              />
              <YesNoField label={t('parking')} value={data.parking} onChange={(v) => onChange({ parking: v })} />
            </div>
          )}

          {/* ── F) Commercial ── */}
          {propType === 'commercial' && (
            <div className="space-y-4">
              <NumberField label={t('builtArea')} required value={data.built_area_m2} onChange={(v) => onChange({ built_area_m2: v })} />
              <YesNoField label={t('streetLevel')} required value={data.street_level} onChange={(v) => onChange({ street_level: v })} />
              <YesNoDontKnowField label={t('smokeOutlet')} required value={data.smoke_outlet} onChange={(v) => onChange({ smoke_outlet: v })} />
              <NumberField label={t('facadeMeters')} value={data.facade_meters} onChange={(v) => onChange({ facade_meters: v })} />
              <SelectField
                label={t('condition')} required value={data.condition}
                onChange={(v) => onChange({ condition: v })}
                options={conditions.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
              />
              {isRent && (
                <>
                  <YesNoField label={t('hasTransfer')} required value={data.has_transfer} onChange={(v) => onChange({ has_transfer: v })} />
                  {data.has_transfer && (
                    <NumberField label={t('transferAmount')} required value={data.transfer_amount} onChange={(v) => onChange({ transfer_amount: v })} />
                  )}
                </>
              )}
            </div>
          )}

          {/* ── G) Warehouse / Industrial ── */}
          {propType === 'warehouse' && (
            <div className="space-y-4">
              <NumberField label={t('warehouseArea')} required value={data.warehouse_area_m2} onChange={(v) => onChange({ warehouse_area_m2: v })} />
              <NumberField label={t('yardArea')} value={data.yard_area_m2} onChange={(v) => onChange({ yard_area_m2: v })} />
              <div className="space-y-2">
                <FieldLabel label={t('freeHeight')} required />
                <Input
                  value={data.free_height_m || ''}
                  placeholder={t('dontKnow')}
                  onChange={(e) => onChange({ free_height_m: e.target.value || null })}
                />
              </div>
              <YesNoDontKnowField label={t('trailerAccess')} required value={data.trailer_access} onChange={(v) => onChange({ trailer_access: v })} />
              <NumberField label={t('electricalPower')} value={data.electrical_power_kw} onChange={(v) => onChange({ electrical_power_kw: v })} />
              <SelectField
                label={t('condition')} required value={data.condition}
                onChange={(v) => onChange({ condition: v })}
                options={conditions.map((c) => ({ value: c.value, label: t(c.labelKey) }))}
              />
            </div>
          )}

          {/* ── Other: minimal fields ── */}
          {propType === 'other' && (
            <div className="space-y-4">
              <NumberField label={t('builtArea')} value={data.built_area_m2} onChange={(v) => onChange({ built_area_m2: v })} />
              <NumberField label={t('bedrooms')} value={data.bedrooms} onChange={(v) => onChange({ bedrooms: v })} />
              <NumberField label={t('bathrooms')} value={data.bathrooms} onChange={(v) => onChange({ bathrooms: v })} />
            </div>
          )}
        </div>
      )}

      {/* ═══ ADDRESS ═══ */}
      <div className="space-y-4">
        <FieldLabel label={t('address')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input placeholder={t('street')} value={data.street || ''} onChange={(e) => onChange({ street: e.target.value })} />
          <Input placeholder={t('city')} value={data.city || ''} onChange={(e) => onChange({ city: e.target.value })} />
          <Input placeholder={t('postalCode')} value={data.postal_code || ''} onChange={(e) => onChange({ postal_code: e.target.value })} />
          <Input placeholder={t('region')} value={data.region || ''} onChange={(e) => onChange({ region: e.target.value })} />
          <Input placeholder={t('country')} value={data.country || ''} onChange={(e) => onChange({ country: e.target.value })} />
        </div>
      </div>

      {/* ═══ YEAR BUILT (for types that have condition) ═══ */}
      {propType && !['land', 'garage'].includes(propType) && (
        <NumberField label={t('yearBuilt')} value={data.year_built} onChange={(v) => onChange({ year_built: v })} min={1800} max={2030} />
      )}
    </div>
  );
};
