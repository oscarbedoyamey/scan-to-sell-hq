
-- Add stripe_subscription_id to purchases table for tracking Stripe subscriptions
ALTER TABLE public.purchases ADD COLUMN stripe_subscription_id text;

-- Add index for looking up by subscription ID
CREATE INDEX idx_purchases_stripe_subscription_id ON public.purchases(stripe_subscription_id);
