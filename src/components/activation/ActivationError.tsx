import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import zignoLogo from '@/assets/zigno-logo.png';

export type ActivationErrorType =
  | 'INVALID_TOKEN'
  | 'ALREADY_CLAIMED_OTHER_USER'
  | 'EXPIRED_MAGIC_LINK'
  | 'GENERIC_ERROR';

const errorContent: Record<ActivationErrorType, { headline: string; text: string }> = {
  INVALID_TOKEN: {
    headline: 'Código QR no reconocido',
    text: 'Este código no existe en nuestro sistema. Asegúrate de haber escaneado el QR correcto o contacta con soporte.',
  },
  ALREADY_CLAIMED_OTHER_USER: {
    headline: 'Este cartel ya fue activado',
    text: 'Alguien ya activó este cartel con otra cuenta. Si crees que es un error, escríbenos.',
  },
  EXPIRED_MAGIC_LINK: {
    headline: 'El enlace ha caducado',
    text: 'Los enlaces mágicos expiran en 1 hora. Vuelve al paso anterior y solicita uno nuevo.',
  },
  GENERIC_ERROR: {
    headline: 'Algo ha ido mal',
    text: 'Ha ocurrido un error inesperado. Por favor inténtalo de nuevo o contacta con soporte.',
  },
};

interface Props {
  type: ActivationErrorType;
  token?: string;
  onRetry?: () => void;
}

export const ActivationError = ({ type, token, onRetry }: Props) => {
  const content = errorContent[type];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <img src={zignoLogo} alt="Zigno" className="h-8 w-auto mb-8" />
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">{content.headline}</h1>
        <p className="text-sm text-muted-foreground mb-8">{content.text}</p>

        <div className="space-y-3">
          {type === 'EXPIRED_MAGIC_LINK' && token && (
            <Button
              variant="default"
              className="w-full"
              onClick={() => (window.location.href = `/activate/${token}/auth`)}
            >
              Solicitar nuevo enlace
            </Button>
          )}
          {type === 'GENERIC_ERROR' && onRetry && (
            <Button variant="default" className="w-full" onClick={onRetry}>
              Reintentar
            </Button>
          )}
          <Button variant="outline" className="w-full" asChild>
            <a href="mailto:hola@zignoqr.com">Contactar soporte</a>
          </Button>
        </div>
      </div>
    </div>
  );
};
