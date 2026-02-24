import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';

const ACTIVATION_TOKEN_KEY = 'zigno_activation_token';

const ActivateSignSetup = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Not logged in — redirect to activation page
      if (token) {
        navigate(`/activate/${token}`, { replace: true });
      }
      return;
    }

    const activate = async () => {
      const activationToken = token || localStorage.getItem(ACTIVATION_TOKEN_KEY);
      if (!activationToken) {
        setError('No activation token found.');
        setProcessing(false);
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
          setError('Token no válido.');
          setProcessing(false);
          return;
        }

        // Already assigned to a different user
        if (sign.customer_id && sign.customer_id !== user.id) {
          setError('Este código ya fue activado por otra persona. Contacta con soporte.');
          setProcessing(false);
          return;
        }

        // Already assigned to current user — redirect to listing
        if (sign.customer_id === user.id && sign.listing_id) {
          localStorage.removeItem(ACTIVATION_TOKEN_KEY);
          navigate(`/app/listings/${sign.listing_id}`, { replace: true });
          return;
        }

        // Fetch batch info for defaults
        const { data: batch } = await (supabase as any)
          .from('sign_batches')
          .select('property_type, transaction_type, language')
          .eq('id', sign.batch_id)
          .maybeSingle();

        const operationType = batch?.transaction_type === 'rent' ? 'rent' : 
                              batch?.transaction_type === 'sale' ? 'sale' : null;
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

        // Redirect to listing editing
        navigate(`/app/listings/${newListing.id}`, { replace: true });
      } catch (err: any) {
        console.error('Activation error:', err);
        setError(err.message || 'Error activating sign.');
        setProcessing(false);
      }
    };

    activate();
  }, [user, authLoading, token, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <p className="text-lg text-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Activando tu cartel...</p>
    </div>
  );
};

export default ActivateSignSetup;
