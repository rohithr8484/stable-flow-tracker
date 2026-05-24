import { useEffect, useMemo, useRef, useState } from "react";
import { Wallet, LogOut, ChevronRight } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { getConnectorLabel, shortenAddress } from "@/lib/walletUtils";
import { logWalletActivity } from "@/lib/walletActivity";

interface WalletConnectControlProps {
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
}

export default function WalletConnectControl({
  size = "default",
  variant = "outline",
  className = "",
}: WalletConnectControlProps) {
  const { address, isConnected, connector, chain } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const loggedAddress = useRef<string | null>(null);

  const availableConnectors = useMemo(
    () => connectors.filter((item, index, arr) => arr.findIndex((entry) => entry.id === item.id) === index),
    [connectors],
  );

  useEffect(() => {
    if (isConnected && address && loggedAddress.current !== address.toLowerCase()) {
      loggedAddress.current = address.toLowerCase();
      void logWalletActivity(address, "wallet_connected", chain?.id);
    }
    if (!isConnected) loggedAddress.current = null;
  }, [isConnected, address, chain?.id]);

  const handleConnect = async (walletConnector: (typeof connectors)[number]) => {
    try {
      // Don't force a chain — accept whichever supported Mezo network the wallet is on.
      await connectAsync({ connector: walletConnector });
      setOpen(false);
      toast.success(`${getConnectorLabel(walletConnector)} connected`);
    } catch {
      toast.error("Wallet connection was cancelled.");
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
          <Wallet className="h-4 w-4 text-success" />
          <div className="leading-none">
            <div className="text-xs font-medium text-foreground">{getConnectorLabel(connector)}</div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {shortenAddress(address)} · {chain?.name || "Wallet connected"}
            </div>
          </div>
        </div>
        <Button type="button" size="icon" variant="ghost" onClick={() => disconnect()} className={className}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button type="button" size={size} variant={variant} className={`gap-2 ${className}`.trim()} onClick={() => setOpen(true)}>
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">Connect wallet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose MetaMask or another browser wallet to connect on Mezo Matsnet.
                </p>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => setOpen(false)}>
                <LogOut className="h-4 w-4 rotate-180" />
              </Button>
            </div>

            <div className="space-y-3">
              {availableConnectors.length > 0 ? (
                availableConnectors.map((walletConnector) => (
                  <button
                    key={walletConnector.id}
                    type="button"
                    onClick={() => void handleConnect(walletConnector)}
                    disabled={isPending}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left transition-colors hover:bg-secondary"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {getConnectorLabel(walletConnector)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Connect and switch to Mezo Matsnet
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                  No browser wallet detected. Install MetaMask or open the page inside a wallet browser.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
