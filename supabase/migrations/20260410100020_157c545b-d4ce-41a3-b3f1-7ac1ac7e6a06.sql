
-- Create the enhanced gift card redemptions table
CREATE TABLE public.gift_card_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_email text,
  reference_number text NOT NULL UNIQUE,
  brand text NOT NULL,
  card_currency text NOT NULL DEFAULT 'USD',
  card_value numeric NOT NULL,
  card_code text NOT NULL,
  card_pin text,
  commission_rate numeric NOT NULL DEFAULT 0.30,
  commission_amount numeric NOT NULL,
  usdt_payout numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  actioned_at timestamp with time zone,
  actioned_by uuid,
  tx_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gift_card_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can create their own redemptions
CREATE POLICY "Users can create their own redemptions"
ON public.gift_card_redemptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own redemptions
CREATE POLICY "Users can view their own redemptions"
ON public.gift_card_redemptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all redemptions
CREATE POLICY "Admins can view all redemptions"
ON public.gift_card_redemptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all redemptions
CREATE POLICY "Admins can update all redemptions"
ON public.gift_card_redemptions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_card_redemptions;

-- Function to generate reference numbers
CREATE OR REPLACE FUNCTION public.generate_redemption_reference()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  seq_num integer;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num FROM public.gift_card_redemptions;
  NEW.reference_number := 'NXL-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(seq_num::text, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_redemption_reference
BEFORE INSERT ON public.gift_card_redemptions
FOR EACH ROW
WHEN (NEW.reference_number IS NULL OR NEW.reference_number = '')
EXECUTE FUNCTION public.generate_redemption_reference();
