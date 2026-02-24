import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const ACTIVATION_TOKEN_KEY = 'zigno_activation_token';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const activationToken = searchParams.get('activation') || localStorage.getItem(ACTIVATION_TOKEN_KEY);

    const getRedirect = () => {
      if (activationToken) {
        localStorage.setItem(ACTIVATION_TOKEN_KEY, activationToken);
        return '/activate/complete';
      }
      return '/app';
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate(getRedirect(), { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(getRedirect(), { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
};

export default AuthCallback;
