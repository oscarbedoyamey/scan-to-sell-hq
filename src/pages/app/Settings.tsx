import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { seoTranslations } from '@/i18n/seoTranslations';

const labels: Record<string, Record<string, string>> = {
  title: { en: 'Settings', es: 'Ajustes', fr: 'Paramètres', de: 'Einstellungen', it: 'Impostazioni', pt: 'Configurações', pl: 'Ustawienia' },
  profile: { en: 'Profile', es: 'Perfil', fr: 'Profil', de: 'Profil', it: 'Profilo', pt: 'Perfil', pl: 'Profil' },
  fullName: { en: 'Full name', es: 'Nombre completo', fr: 'Nom complet', de: 'Vollständiger Name', it: 'Nome completo', pt: 'Nome completo', pl: 'Pełne imię' },
  phone: { en: 'Phone (optional)', es: 'Teléfono (opcional)', fr: 'Téléphone (optionnel)', de: 'Telefon (optional)', it: 'Telefono (opzionale)', pt: 'Telefone (opcional)', pl: 'Telefon (opcjonalnie)' },
  email: { en: 'Email', es: 'Email', fr: 'Email', de: 'E-Mail', it: 'Email', pt: 'Email', pl: 'Email' },
  save: { en: 'Save changes', es: 'Guardar cambios', fr: 'Enregistrer', de: 'Änderungen speichern', it: 'Salva modifiche', pt: 'Salvar alterações', pl: 'Zapisz zmiany' },
  saved: { en: 'Saved!', es: '¡Guardado!', fr: 'Enregistré !', de: 'Gespeichert!', it: 'Salvato!', pt: 'Salvo!', pl: 'Zapisano!' },
};

const Settings = () => {
  const { profile, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const t = (key: string) => labels[key]?.[language] || labels[key]?.en || key;

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaved(false);

    await (supabase as any)
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq('id', profile.id);

    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const seo = seoTranslations[language].settings;

  return (
    <div className="max-w-lg">
      <SEO title={seo.title} description={seo.description} />
      <h1 className="font-display text-2xl font-bold text-foreground mb-8">{t('title')}</h1>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
        <h2 className="font-display text-lg font-bold text-foreground">{t('profile')}</h2>

        <div>
          <Label className="text-sm font-medium">{t('email')}</Label>
          <Input value={profile?.email || ''} disabled className="mt-1 bg-secondary" />
        </div>

        <div>
          <Label className="text-sm font-medium">{t('fullName')}</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1"
            placeholder="John Doe"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">{t('phone')}</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
            placeholder="+34 600 000 000"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} variant="default" className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              {t('saved')}
            </>
          ) : (
            t('save')
          )}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
