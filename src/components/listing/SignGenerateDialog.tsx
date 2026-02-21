import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { languages as availableLanguages, type Language } from '@/i18n/translations';

const labels: Record<string, Record<string, string>> = {
  title: { en: 'Sign settings', es: 'Configuración del cartel', fr: 'Paramètres de l\'affiche', de: 'Plakateinstellungen', it: 'Impostazioni cartello', pt: 'Configurações do cartaz', pl: 'Ustawienia plakatu' },
  phoneQuestion: { en: 'Show phone number on the sign?', es: '¿Mostrar el teléfono en el cartel?', fr: 'Afficher le téléphone sur l\'affiche ?', de: 'Telefonnummer auf dem Plakat anzeigen?', it: 'Mostrare il telefono sul cartello?', pt: 'Mostrar telefone no cartaz?', pl: 'Pokazać numer telefonu na plakacie?' },
  yes: { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja', it: 'Sì', pt: 'Sim', pl: 'Tak' },
  no: { en: 'No', es: 'No', fr: 'Non', de: 'Nein', it: 'No', pt: 'Não', pl: 'Nie' },
  languageQuestion: { en: 'Choose language', es: 'Elige el idioma', fr: 'Choisir la langue', de: 'Sprache wählen', it: 'Scegli la lingua', pt: 'Escolha o idioma', pl: 'Wybierz język' },
  generate: { en: 'Generate', es: 'Generar', fr: 'Générer', de: 'Generieren', it: 'Genera', pt: 'Gerar', pl: 'Generuj' },
  cancel: { en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', it: 'Annulla', pt: 'Cancelar', pl: 'Anuluj' },
};

export interface SignGenerateOptions {
  showPhone: boolean;
  language: Language;
}

interface SignGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (options: SignGenerateOptions) => void;
  loading?: boolean;
  defaultLanguage?: Language;
}

export const SignGenerateDialog = ({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  defaultLanguage,
}: SignGenerateDialogProps) => {
  const { language: uiLanguage } = useLanguage();
  const t = (key: string) => labels[key]?.[uiLanguage] || labels[key]?.en || key;

  const [showPhone, setShowPhone] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(defaultLanguage || uiLanguage);

  // Reset state when dialog opens
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setShowPhone(false);
      setSelectedLang(defaultLanguage || uiLanguage);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('title')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Phone question */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t('phoneQuestion')}</Label>
            <RadioGroup
              value={showPhone ? 'yes' : 'no'}
              onValueChange={(v) => setShowPhone(v === 'yes')}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="phone-yes" />
                <Label htmlFor="phone-yes" className="cursor-pointer">{t('yes')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="phone-no" />
                <Label htmlFor="phone-no" className="cursor-pointer">{t('no')}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Language selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{t('languageQuestion')}</Label>
            <RadioGroup
              value={selectedLang}
              onValueChange={(v) => setSelectedLang(v as Language)}
              className="grid grid-cols-2 gap-2"
            >
              {availableLanguages.map((lang) => (
                <div key={lang.code} className="flex items-center gap-2">
                  <RadioGroupItem value={lang.code} id={`lang-${lang.code}`} />
                  <Label htmlFor={`lang-${lang.code}`} className="cursor-pointer">
                    {lang.flag} {lang.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button
            onClick={() => onConfirm({ showPhone, language: selectedLang })}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t('generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
