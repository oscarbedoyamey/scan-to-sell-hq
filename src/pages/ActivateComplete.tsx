import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ActivationError, type ActivationErrorType } from '@/components/activation/ActivationError';
import zignoLogo from '@/assets/zigno-logo.png';

const ACTIVATION_TOKEN_KEY = 'zigno_activation_token';

const ActivateComplete = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<ActivationErrorType | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Wait — supabase may still be processing the OTP callback
      const timeout = setTimeout(() => {
        if (!user) {
          // Still no user after waiting, try to get session
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
              setError('EXPIRED_MAGIC_LINK');
              setProcessing(false);
            }
          });
        }
      }, 3000);
      return () => clearTimeout(timeout);
    }

    const activate = async () => {
      const activationToken = localStorage.getItem(ACTIVATION_TOKEN_KEY);

      if (!activationToken) {
        // No token — user just logged in normally
        toast({ title: 'Sesión iniciada correctamente.' });
        navigate('/app', { replace: true });
        return;
      }

      try {
        // Fetch the unassigned sign
        const { data: sign, error: fetchErr } = await (supabase as any)
          .from('unassigned_signs')
          .select('id, activation_token, status, customer_id, listing_id, batch_id')
          .eq('activation_token', activationToken)
          .maybeSingle();

        if (fetchErr || !sign) {
          setError('INVALID_TOKEN');
          setProcessing(false);
          return;
        }

        // Already assigned to a different user
        if (sign.customer_id && sign.customer_id !== user.id) {
          setError('ALREADY_CLAIMED_OTHER_USER');
          setProcessing(false);
          return;
        }

        // Already assigned to current user — redirect to listing
        if (sign.customer_id === user.id && sign.listing_id) {
          localStorage.removeItem(ACTIVATION_TOKEN_KEY);
          navigate(`/app/listings/new?listing_id=${sign.listing_id}`, { replace: true });
          return;
        }

        // Fetch batch info for defaults
        const { data: batch } = await (supabase as any)
          .from('sign_batches')
          .select('property_type, transaction_type, language')
          .eq('id', sign.batch_id)
          .maybeSingle();

        const operationType =
          batch?.transaction_type === 'rent'
            ? 'rent'
            : batch?.transaction_type === 'sale'
            ? 'sale'
            : null;
        const propertyType = batch?.property_type || 'apartment';

        // Step 1: Claim the sign
        await (supabase as any)
          .from('unassigned_signs')
          .update({
            customer_id: user.id,
            status: 'sold',
            sold_at: new Date().toISOString(),
          })
          .eq('id', sign.id);

        // Step 2: Create a new listing
        const { data: newListing, error: listingErr } = await (supabase as any)
          .from('listings')
          .insert({
            owner_user_id: user.id,
            property_type: propertyType,
            operation_type: operationType,
            base_language: batch?.language || 'es',
            status: 'draft',
          })
          .select('id')
          .single();

        if (listingErr) throw listingErr;

        // Step 3: Link the sign to the listing
        await (supabase as any)
          .from('unassigned_signs')
          .update({
            listing_id: newListing.id,
            status: 'assigned',
            assigned_at: new Date().toISOString(),
          })
          .eq('id', sign.id);

        // Clean up
        localStorage.removeItem(ACTIVATION_TOKEN_KEY);

        // Redirect to listing editor with onboarding flag
        navigate(`/app/listings/new?listing_id=${newListing.id}&onboarding=true`, { replace: true });
      } catch (err: any) {
        console.error('Activation error:', err);
        setError('GENERIC_ERROR');
        setProcessing(false);
      }
    };

    activate();
  }, [user, authLoading, navigate, toast]);

  if (error) {
    const token = localStorage.getItem(ACTIVATION_TOKEN_KEY) || undefined;
    return (
      <ActivationError
        type={error}
        token={token}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <img src={zignoLogo} alt="Zigno" className="h-8 w-auto mb-6" />
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Activando tu cartel…</p>
    </div>
  );
};

export default ActivateComplete;
