
CREATE TABLE public.wallet_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  action TEXT NOT NULL,
  chain_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallet_activity_address ON public.wallet_activity (lower(address));
CREATE INDEX idx_wallet_activity_created_at ON public.wallet_activity (created_at DESC);

ALTER TABLE public.wallet_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wallet activity is publicly readable"
ON public.wallet_activity
FOR SELECT
USING (true);

CREATE POLICY "Anyone can record wallet activity"
ON public.wallet_activity
FOR INSERT
WITH CHECK (
  address IS NOT NULL
  AND length(address) BETWEEN 4 AND 128
  AND action IS NOT NULL
  AND length(action) BETWEEN 1 AND 64
);
