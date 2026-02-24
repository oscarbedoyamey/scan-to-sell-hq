import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, AlertTriangle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import zignoLogo from '@/assets/zigno-logo.png';

const ACTIVATION_TOKEN_KEY = 'zigno_activation_token';

interface UnassignedSign {
  id: string;
  activation_token: string;
  status: string;
  customer_id: string | null;
  listing_id: string | null;
  batch_id: string;
}

interface SignBatch {
  language: string;
  property_type: string;
  transaction_type: string;
}

const i18n: Record<string, Record<string, string>> = {
  headline: {
    es: '¡Tu cartel Zigno está listo para activarse!',
    en: 'Your Zigno sign is ready to activate!',
  },
  step1: {
    es: 'Crea tu cuenta o inicia sesión (gratis)',
    en: 'Create your account or sign in (free)',
  },
  step2: {
    es: 'Añade los datos de tu inmueble',
    en: 'Add your property details',
  },
  step3: {
    es: 'Tu cartel ya está conectado — ¡empieza a recibir leads!',
    en: 'Your sign is now connected — start receiving leads!',
  },
  cta: {
    es: 'Activar mi cartel',
    en: 'Activate my sign',
  },
  alreadyAccount: {
    es: '¿Ya tienes cuenta? Usa el mismo email y accederás directamente.',
    en: 'Already have an account? Use the same email and you\'ll access directly.',
  },
  invalidToken: {
    es: 'Este código QR no es válido. Contacta con soporte en hola@zignoqr.com',
    en: 'This QR code is not valid. Contact support at hola@zignoqr.com',
  },
  alreadyAssigned: {
    es: 'Este cartel ya está activado y vinculado a un inmueble. Si crees que es un error, contacta con soporte.',
    en: 'This sign is already activated and linked to a property. If you think this is an error, contact support.',
  },
  emailPlaceholder: {
    es: 'tu@email.com',
    en: 'your@email.com',
  },
  sendLink: {
    es: 'Enviar enlace mágico',
    en: 'Send magic link',
  },
  checkEmail: {
    es: '¡Revisa tu email! Hemos enviado un enlace mágico a',
    en: 'Check your email! We sent a magic link to',
  },
  noPassword: {
    es: 'Sin contraseña — solo haz clic en el enlace de tu email.',
    en: 'No password needed — just click the link in your email.',
  },
};

const ActivateSign = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sign, setSign] = useState<UnassignedSign | null>(null);
  const [batch, setBatch] = useState<SignBatch | null>(null);
  const [error, setError] = useState<'invalid' | 'assigned' | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [authError, setAuthError] = useState('');

  const lang = batch?.language === 'en' ? 'en' : 'es';
  const t = (key: string) => i18n[key]?.[lang] || i18n[key]?.es || key;

  // Fetch sign data
  useEffect(() => {
    if (!token) return;
    const fetchSign = async () => {
      const { data, error: fetchErr } = await (supabase as any)
        .from('unassigned_signs')
        .select('id, activation_token, status, customer_id, listing_id, batch_id')
        .eq('activation_token', token)
        .maybeSingle();

      if (fetchErr || !data) {
        setError('invalid');
        setLoading(false);
        return;
      }

      if (data.status === 'assigned') {
        setError('assigned');
        setLoading(false);
        return;
      }

      setSign(data);

      // Fetch batch for language
      const { data: batchData } = await (supabase as any)
        .from('sign_batches')
        .select('language, property_type, transaction_type')
        .eq('id', data.batch_id)
        .maybeSingle();

      setBatch(batchData);
      setLoading(false);
    };
    fetchSign();
  }, [token]);

  // If user is already logged in and we have a sign, redirect to setup
  useEffect(() => {
    if (user && sign && !error) {
      localStorage.setItem(ACTIVATION_TOKEN_KEY, sign.activation_token);
      navigate(`/activate/${sign.activation_token}/setup`, { replace: true });
    }
  }, [user, sign, error, navigate]);

  const handleActivate = () => {
    if (token) {
      localStorage.setItem(ACTIVATION_TOKEN_KEY, token);
    }
    setShowAuth(true);
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setAuthError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-magic-link', {
        body: {
          email: email.trim(),
          locale: lang,
          redirectTo: `${window.location.origin}/auth/callback?activation=${token}`,
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setSent(true);
    } catch (err: any) {
      setAuthError(err.message || 'Error');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <p className="text-lg text-foreground">
            {error === 'invalid' ? t('invalidToken') : t('alreadyAssigned')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={zignoLogo} alt="ZIGNO" className="h-10 w-auto mx-auto" />
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">{t('checkEmail')}</p>
              <p className="text-primary font-bold">{email}</p>
              <p className="text-sm text-muted-foreground mt-4">{t('noPassword')}</p>
            </div>
          ) : showAuth ? (
            <>
              <h1 className="font-display text-xl font-bold text-foreground text-center mb-6">
                {t('cta')}
              </h1>
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                    autoFocus
                  />
                </div>
                {authError && <p className="text-sm text-destructive">{authError}</p>}
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('sendLink')}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-4">{t('noPassword')}</p>
            </>
          ) : (
            <>
              {/* Activation landing */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h1 className="font-display text-xl font-bold text-foreground">
                  {t('headline')}
                </h1>
              </div>

              <ol className="space-y-3 mb-8">
                {['step1', 'step2', 'step3'].map((key, i) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-muted-foreground pt-1">{t(key)}</span>
                  </li>
                ))}
              </ol>

              <Button variant="hero" size="lg" className="w-full" onClick={handleActivate}>
                {t('cta')}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                {t('alreadyAccount')}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivateSign;
