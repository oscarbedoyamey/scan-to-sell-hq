import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, QrCode, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivationLayout } from '@/components/activation/ActivationLayout';
import { ActivationError } from '@/components/activation/ActivationError';

const ACTIVATION_TOKEN_KEY = 'zigno_activation_token';

const ActivateSign = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'INVALID_TOKEN' | 'ALREADY_CLAIMED_OTHER_USER' | 'GENERIC_ERROR' | null>(null);
  const [signValid, setSignValid] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchSign = async () => {
      const { data, error: fetchErr } = await (supabase as any)
        .from('unassigned_signs')
        .select('id, activation_token, status, customer_id, listing_id, batch_id')
        .eq('activation_token', token)
        .maybeSingle();

      if (fetchErr || !data) {
        setError('INVALID_TOKEN');
        setLoading(false);
        return;
      }

      // CONTEXT B: Sign is already assigned — redirect to public listing page
      if (data.status === 'assigned') {
        if (data.listing_id) {
          navigate(`/listing/${data.listing_id}`, { replace: true });
          return;
        } else {
          // Data inconsistency: assigned but no listing
          console.error('Data inconsistency: sign assigned but no listing_id', { signId: data.id, token });
          setError('GENERIC_ERROR');
          setLoading(false);
          return;
        }
      }

      // CONTEXT A: unassigned or sold — show activation onboarding
      setSignValid(true);
      setLoading(false);
    };
    fetchSign();
  }, [token, navigate]);

  // If user is already logged in, redirect to complete
  useEffect(() => {
    if (user && signValid && token) {
      localStorage.setItem(ACTIVATION_TOKEN_KEY, token);
      navigate(`/activate/complete`, { replace: true });
    }
  }, [user, signValid, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <ActivationError type={error} token={token} />;
  }

  const handleCta = () => {
    if (token) localStorage.setItem(ACTIVATION_TOKEN_KEY, token);
    navigate(`/activate/${token}/auth`);
  };

  return (
    <ActivationLayout step={1}>
      {/* Hero icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <QrCode className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-2xl font-bold text-foreground text-center mb-2">
        ¡Tu cartel Zigno está activo!
      </h1>
      <p className="text-base text-muted-foreground text-center mb-6">
        En menos de 2 minutos podrás recibir leads de personas interesadas en tu inmueble.
      </p>

      {/* Benefits card */}
      <div className="bg-muted/50 rounded-2xl p-5 mb-8 space-y-3">
        {[
          'Landing page profesional para tu inmueble',
          'Leads directamente a tu email o WhatsApp',
          'Actualiza fotos y precio sin cambiar el cartel',
          'Panel de control para ver todas las visitas',
        ].map((benefit) => (
          <div key={benefit} className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">{benefit}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button size="lg" className="w-full text-base h-14" onClick={handleCta}>
        Crear mi cuenta gratis →
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-3">
        ¿Ya tienes cuenta en Zigno? Usa el mismo email y accederás directamente.
      </p>

      {/* Trust */}
      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5" />
        <span>Sin tarjeta de crédito · Cancela cuando quieras</span>
      </div>
    </ActivationLayout>
  );
};

export default ActivateSign;
