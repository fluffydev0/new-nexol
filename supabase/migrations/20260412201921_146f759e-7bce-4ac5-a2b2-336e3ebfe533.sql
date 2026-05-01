CREATE POLICY "Users can update their own wallet"
ON public.user_wallets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);