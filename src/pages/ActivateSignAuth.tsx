import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActivationLayout } from '@/components/activation/ActivationLayout';

const ACTIVATION_TOKEN_KEY = 'zigno_activation_token';

const ActivateSignAuth = () => {
  const { token } = useParams<{ token: string }>();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError('');

    try {
      // Save token before magic link redirect
      if (token) localStorage.setItem(ACTIVATION_TOKEN_KEY, token);

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/activate/complete`,
        },
      });

      if (authError) throw authError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el enlace');
    } finally {
      setSending(false);
    }
  };

  return (
    <ActivationLayout step={2}>
      {sent ? (
        /* Confirmation state */
        <div className="text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            Revisa tu bandeja de entrada
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            Hemos enviado un enlace a{' '}
            <span className="font-semibold text-foreground">{email}</span>.
            Tócalo para continuar.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            ¿No lo ves? Revisa la carpeta de spam.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-primary hover:underline mt-4 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> Cambiar email
          </button>
        </div>
      ) : (
        /* Email form */
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-xl font-bold text-foreground text-center mb-2">
            Introduce tu email
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Te enviamos un enlace mágico para acceder sin contraseña. Sin spam, solo Zigno.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-14 text-base"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full h-14 text-base" disabled={sending}>
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Enviar enlace de acceso →'
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Sin contraseña — solo haz clic en el enlace de tu email.
          </p>
        </div>
      )}
    </ActivationLayout>
  );
};

export default ActivateSignAuth;
