import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QrCode, FileText } from 'lucide-react';
import { useUserSigns } from '@/hooks/useSigns';

const translations: Record<string, Record<string, string>> = {
  mySignsTitle: { en: 'My Signs', es: 'Mis Carteles', fr: 'Mes Panneaux', de: 'Meine Schilder', it: 'I Miei Cartelli', pt: 'Meus Cartazes', pl: 'Moje Znaki' },
  mySignsDescription: { en: 'Manage your sign pool and track assignments', es: 'Gestiona tu pool de carteles y rastrear asignaciones', fr: 'Gérez votre pool de panneaux et suivez les affectations', de: 'Verwalten Sie Ihren Schild-Pool und verfolgen Sie Zuweisungen', it: 'Gestisci il tuo pool di cartelli e traccia gli incarichi', pt: 'Gerencie seu pool de cartazes e rastreie atribuições', pl: 'Zarządzaj pulą znaków i śledź przypisania' },
  noSigns: { en: 'No signs yet', es: 'Sin carteles aún', fr: 'Pas de panneaux encore', de: 'Noch keine Schilder', it: 'Nessun cartello ancora', pt: 'Sem cartazes ainda', pl: 'Brak znaków' },
  noSignsDescription: { en: 'Create a new listing and purchase a sign to get started', es: 'Crea un nuevo anuncio y compra un cartel para comenzar', fr: 'Créez une nouvelle annonce et achetez un panneau pour commencer', de: 'Erstellen Sie ein neues Inserat und kaufen Sie ein Schild, um zu beginnen', it: 'Crea un nuovo annuncio e acquista un cartello per iniziare', pt: 'Crie uma nova listagem e compre um cartaz para começar', pl: 'Utwórz nową listę i kup znak, aby rozpocząć' },
  signCode: { en: 'Sign Code', es: 'Código de Cartel', fr: 'Code du Panneau', de: 'Schildcode', it: 'Codice del Cartello', pt: 'Código do Cartaz', pl: 'Kod Znaku' },
  status: { en: 'Status', es: 'Estado', fr: 'Statut', de: 'Status', it: 'Stato', pt: 'Status', pl: 'Status' },
  assigned: { en: 'Assigned', es: 'Asignado', fr: 'Assigné', de: 'Zugewiesen', it: 'Assegnato', pt: 'Atribuído', pl: 'Przypisany' },
  unassigned: { en: 'Unassigned', es: 'Sin Asignar', fr: 'Non Assigné', de: 'Nicht Zugewiesen', it: 'Non Assegnato', pt: 'Não Atribuído', pl: 'Nieprzypisany' },
  assignment: { en: 'Assignment', es: 'Asignación', fr: 'Affectation', de: 'Zuweisung', it: 'Assegnazione', pt: 'Atribuição', pl: 'Przypisanie' },
  createdAt: { en: 'Created', es: 'Creado', fr: 'Créé', de: 'Erstellt', it: 'Creato', pt: 'Criado', pl: 'Utworzony' },
  actions: { en: 'Actions', es: 'Acciones', fr: 'Actions', de: 'Aktionen', it: 'Azioni', pt: 'Ações', pl: 'Działania' },
  viewQR: { en: 'View QR', es: 'Ver QR', fr: 'Voir QR', de: 'QR Anzeigen', it: 'Visualizza QR', pt: 'Ver QR', pl: 'Wyświetl QR' },
  downloadPDF: { en: 'Download PDF', es: 'Descargar PDF', fr: 'Télécharger PDF', de: 'PDF Herunterladen', it: 'Scarica PDF', pt: 'Baixar PDF', pl: 'Pobierz PDF' },
};

export default function MySigns() {
  const { language } = useLanguage();
  const { data: signs = [], isLoading: loading } = useUserSigns();

  const t = (key: string) => translations[key]?.[language] || translations[key]?.en || key;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!signs.length) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('mySignsTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('mySignsDescription')}</p>
        </div>
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-4">
              <QrCode className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t('noSigns')}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t('noSignsDescription')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('mySignsTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('mySignsDescription')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Signs ({signs.length})
          </CardTitle>
          <CardDescription>{t('mySignsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('signCode')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('assignment')}</TableHead>
                  <TableHead>{t('createdAt')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signs.map((sign) => (
                  <TableRow key={sign.id}>
                    <TableCell className="font-mono text-sm font-semibold">
                      {sign.sign_code}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sign.listing_id ? 'default' : 'outline'} className="gap-1">
                        <span className={`h-2 w-2 rounded-full ${sign.listing_id ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {sign.listing_id ? t('assigned') : t('unassigned')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sign.listing ? (
                        <div className="text-sm">
                          <div className="font-medium text-foreground">{sign.listing.title}</div>
                          <div className="text-xs text-muted-foreground">{sign.listing.listing_code}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sign.created_at
                        ? new Date(sign.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {sign.qr_image_path && (
                          <Button variant="ghost" size="sm" className="gap-1">
                            <QrCode className="h-4 w-4" />
                            {t('viewQR')}
                          </Button>
                        )}
                        {sign.sign_pdf_path && (
                          <Button variant="ghost" size="sm" className="gap-1">
                            <FileText className="h-4 w-4" />
                            {t('downloadPDF')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
