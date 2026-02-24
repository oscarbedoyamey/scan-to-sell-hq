import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import zignoLogo from '@/assets/zigno-logo.png';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
}

export const ActivationInstructionsModal = ({ open, onOpenChange, token }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const activationUrl = `https://zignoqr.com/activate/${token}`;

  useEffect(() => {
    if (open && token) {
      QRCode.toDataURL(activationUrl, { width: 300, margin: 2 }).then(setQrDataUrl);
    }
  }, [open, token, activationUrl]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Instrucciones de activación</title>
          <style>
            @page { size: A6; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
            .card { text-align: center; max-width: 320px; }
            .logo { height: 28px; margin-bottom: 20px; }
            h1 { font-size: 18px; font-weight: 700; margin: 0 0 20px; }
            ol { text-align: left; padding-left: 20px; margin: 0 0 24px; line-height: 1.8; font-size: 13px; }
            .qr { width: 200px; height: 200px; margin: 0 auto 8px; }
            .token { font-family: monospace; font-size: 11px; color: #666; letter-spacing: 1px; }
            .help { font-size: 11px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Instrucciones de activación</DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="text-center py-4">
          <div className="card">
            <img src={zignoLogo} alt="Zigno" className="logo h-7 mx-auto mb-5" />
            <h1 className="text-lg font-bold text-foreground mb-5">
              Activa tu cartel en 2 minutos
            </h1>
            <ol className="text-left text-sm text-foreground space-y-2 list-decimal list-inside mb-6">
              <li>Coloca el cartel en tu propiedad</li>
              <li>Escanea el QR con la cámara de tu móvil</li>
              <li>Regístrate gratis y añade los datos del inmueble</li>
              <li>¡Listo! Tu cartel ya capta leads automáticamente</li>
            </ol>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="qr w-48 h-48 mx-auto mb-2" />
            )}
            <p className="token font-mono text-xs text-muted-foreground tracking-wider">
              {token}
            </p>
            <p className="help text-xs text-muted-foreground mt-5">
              ¿Necesitas ayuda? hola@zignoqr.com
            </p>
          </div>
        </div>

        <Button onClick={handlePrint} className="w-full">
          <Printer className="h-4 w-4 mr-2" /> Imprimir
        </Button>
      </DialogContent>
    </Dialog>
  );
};
