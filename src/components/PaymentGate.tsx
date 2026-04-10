import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { encodeFunctionData, parseEther } from "viem";
import { motion } from "framer-motion";
import { Wallet, Coins, Loader2, CheckCircle, Shield, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  mezoTestnet,
  MUSD_CONTRACT,
  TREASURY_ADDRESS,
  MUSD_PAYMENT_AMOUNT,
  MUSD_PAYMENT_DISPLAY,
  BTC_PAYMENT_DISPLAY,
} from "@/lib/walletConfig";
import { getConnectorLabel, shortenAddress } from "@/lib/walletUtils";

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

interface PaymentGateProps {
  onPaymentComplete: () => void;
  serviceName: string;
}

type PaymentMethod = "musd" | "btc";
type PaymentStage = "idle" | "pick-wallet" | "connect-wallet" | "switch-network" | "confirm-payment" | "confirming" | "paid";

export default function PaymentGate({ onPaymentComplete, serviceName }: PaymentGateProps) {
  const { isConnected, address, chain, connector } = useAccount();
  const { connectors, connectAsync, isPending: isConnecting } = useConnect();
  const { disconnectAsync, isPending: isDisconnecting } = useDisconnect();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { sendTransaction, data: paymentHash, isPending: paymentPending, error: paymentError } = useSendTransaction();
  const { isLoading: paymentConfirming, isSuccess: paymentSuccess } = useWaitForTransactionReceipt({ hash: paymentHash });

  const [pendingAction, setPendingAction] = useState<PaymentMethod | null>(null);
  const [stage, setStage] = useState<PaymentStage>("idle");
  const paymentRequestedRef = useRef(false);
  const switchingRequestedRef = useRef(false);

  const availableConnectors = useMemo(
    () => connectors.filter((item, index, arr) => arr.findIndex((entry) => entry.id === item.id) === index),
    [connectors],
  );

  const resetFlow = () => {
    setPendingAction(null);
    setStage("idle");
    paymentRequestedRef.current = false;
    switchingRequestedRef.current = false;
  };

  const requestPaymentInWallet = (method: PaymentMethod) => {
    paymentRequestedRef.current = true;
    setStage("confirm-payment");

    if (method === "musd") {
      sendTransaction({
        to: MUSD_CONTRACT,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [TREASURY_ADDRESS, BigInt(MUSD_PAYMENT_AMOUNT)],
        }),
      });
      return;
    }

    sendTransaction({
      to: TREASURY_ADDRESS,
      value: parseEther(BTC_PAYMENT_DISPLAY),
    });
  };

  const startPayment = (method: PaymentMethod) => {
    setPendingAction(method);
    setStage(method === "musd" ? "pick-wallet" : isConnected ? "switch-network" : "pick-wallet");
    paymentRequestedRef.current = false;
    switchingRequestedRef.current = false;
  };

  const handleWalletConnect = async (walletConnector: (typeof connectors)[number]) => {
    try {
      setStage("connect-wallet");

      if (pendingAction === "musd" && isConnected) {
        await disconnectAsync();
      }

      await connectAsync({ connector: walletConnector });
    } catch {
      resetFlow();
      toast.error("Wallet connection was cancelled.");
    }
  };

  useEffect(() => {
    if (!pendingAction) return;
    if (!isConnected) {
      setStage((current) => (current === "connect-wallet" ? current : "pick-wallet"));
      return;
    }

    if (chain?.id !== mezoTestnet.id) {
      setStage("switch-network");
      return;
    }

    if (!paymentRequestedRef.current) {
      requestPaymentInWallet(pendingAction);
    }
  }, [pendingAction, isConnected, chain?.id]);

  useEffect(() => {
    if (!pendingAction || !isConnected || chain?.id === mezoTestnet.id || switchingRequestedRef.current) return;

    switchingRequestedRef.current = true;
    setStage("switch-network");

    void switchChainAsync({ chainId: mezoTestnet.id }).catch(() => {
      resetFlow();
      toast.error("Please approve the switch to Mezo Matsnet.");
    }).finally(() => {
      switchingRequestedRef.current = false;
    });
  }, [pendingAction, isConnected, chain?.id, switchChainAsync]);

  useEffect(() => {
    if (paymentPending) {
      setStage("confirm-payment");
      return;
    }

    if (paymentConfirming) {
      setStage("confirming");
    }
  }, [paymentPending, paymentConfirming]);

  useEffect(() => {
    if (!paymentSuccess) return;

    setStage("paid");
    setPendingAction(null);
    paymentRequestedRef.current = false;
    switchingRequestedRef.current = false;

    const timer = setTimeout(() => onPaymentComplete(), 1500);
    return () => clearTimeout(timer);
  }, [paymentSuccess, onPaymentComplete]);

  useEffect(() => {
    if (!paymentError) return;

    resetFlow();
    toast.error(paymentError.message || "Payment request failed.");
  }, [paymentError]);

  const isProcessing =
    isConnecting || isDisconnecting || isSwitchingChain || paymentPending || paymentConfirming;
  const paymentTxHash = paymentHash;
  const activePaymentLabel = pendingAction === "musd" ? `${MUSD_PAYMENT_DISPLAY} MUSD` : `${BTC_PAYMENT_DISPLAY} BTC`;
  const showWalletPicker = stage === "pick-wallet";

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="glass-card p-8 text-center space-y-6">
          <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
            <Shield className="h-10 w-10 text-primary" />
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">Payment Required</h2>
            <p className="text-sm text-muted-foreground">
              Pay <span className="text-foreground font-semibold">{MUSD_PAYMENT_DISPLAY} MUSD</span> or{" "}
              <span className="text-foreground font-semibold">{BTC_PAYMENT_DISPLAY} BTC</span> to access{" "}
              <span className="text-foreground font-medium">{serviceName}</span>.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              MUSD now follows the BTC flow exactly: pick wallet → connect → switch to Mezo Matsnet → confirm payment in wallet.
            </p>
          </div>

          {isConnected && (
            <div className="p-3 rounded-lg border border-success/30 bg-success/5 flex items-center gap-2 text-left">
              <CheckCircle className="h-4 w-4 text-success shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-foreground font-medium truncate">
                  Connected with {getConnectorLabel(connector)}
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {shortenAddress(address)} · {chain?.name || "Unknown network"}
                </div>
              </div>
            </div>
          )}

          {stage === "paid" ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="p-6 rounded-lg border border-success/30 bg-success/5 space-y-3">
              <CheckCircle className="h-10 w-10 text-success mx-auto" />
              <div className="text-success text-sm font-semibold">Payment confirmed!</div>
              {paymentTxHash && <div className="text-xs text-muted-foreground font-mono truncate">Tx: {paymentTxHash}</div>}
              <div className="text-xs text-muted-foreground">Loading results...</div>
            </motion.div>
          ) : isProcessing ? (
            <div className="p-6 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <div className="text-primary text-sm font-medium">
                {isConnecting
                  ? "Connecting wallet..."
                  : isDisconnecting
                    ? "Refreshing wallet connection..."
                    : isSwitchingChain
                    ? "Switching to Mezo Matsnet..."
                      : paymentPending
                      ? "Confirm transaction in your wallet..."
                      : "Waiting for on-chain confirmation..."}
              </div>
              <div className="text-xs text-muted-foreground">Preparing {activePaymentLabel} payment</div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button onClick={() => startPayment("musd")} className="w-full gap-2 h-12 text-base" variant="default">
                <Coins className="h-5 w-5" />
                Pay with MUSD — {MUSD_PAYMENT_DISPLAY} MUSD
              </Button>
              <Button onClick={() => startPayment("btc")} className="w-full gap-2 h-12 text-base" variant="outline">
                <Wallet className="h-5 w-5" />
                Pay with BTC — {BTC_PAYMENT_DISPLAY} BTC
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Results unlock only after wallet connection and confirmed payment.
          </p>
        </div>
      </motion.div>

      {showWalletPicker && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5">
              <h3 className="font-heading text-xl font-bold text-foreground">Connect wallet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                  Pick MetaMask or another wallet, then the app will open the wallet transfer request for {pendingAction === "musd" ? `${MUSD_PAYMENT_DISPLAY} MUSD` : `${BTC_PAYMENT_DISPLAY} BTC`}.
              </p>
            </div>

            <div className="space-y-3">
              {availableConnectors.length > 0 ? (
                availableConnectors.map((walletConnector) => (
                  <button
                    key={walletConnector.id}
                    type="button"
                    onClick={() => void handleWalletConnect(walletConnector)}
                    disabled={isConnecting || isDisconnecting}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left transition-colors hover:bg-secondary"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">{getConnectorLabel(walletConnector)}</div>
                      <div className="text-xs text-muted-foreground">
                        {pendingAction === "musd" ? `Connect and confirm ${MUSD_PAYMENT_DISPLAY} MUSD` : "Open wallet and continue payment"}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                  No wallet detected. Install MetaMask or open this app inside a wallet browser.
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button type="button" variant="ghost" onClick={resetFlow}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
