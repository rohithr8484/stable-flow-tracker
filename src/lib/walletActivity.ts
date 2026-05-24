import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/integrations/supabase/client";

/**
 * Records a single action performed from a wallet address.
 * Used to build the compliance leaderboard from real activity.
 */
export async function logWalletActivity(
  address: string | undefined,
  action: string,
  chainId?: number,
): Promise<void> {
  if (!address || !action) return;
  const normalized = address.toLowerCase();
  try {
    await supabase.from("wallet_activity").insert({
      address: normalized,
      action,
      chain_id: chainId ?? null,
    });
  } catch (err) {
    // Activity logging is best-effort — never break the UI.
    console.warn("wallet activity log failed", err);
  }
}

/**
 * Logs a single "viewed <action>" event for the currently-connected wallet,
 * once per (address + action) pair per browser session.
 */
export function useTrackWalletPage(action: string) {
  const { address, isConnected, chain } = useAccount();
  const fired = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isConnected || !address) return;
    const key = `${address.toLowerCase()}::${action}`;
    if (fired.current.has(key)) return;
    fired.current.add(key);
    void logWalletActivity(address, action, chain?.id);
  }, [address, isConnected, action, chain?.id]);
}
