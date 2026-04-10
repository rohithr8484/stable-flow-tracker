import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Wallet, Coins, Loader2, CheckCircle, Shield } from "lucide-react";
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

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

interface PaymentGateProps {
  onPaymentComplete: () => void;
  serviceName: string;
}

const shortenAddress = (address?: string) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

export default function PaymentGate({ onPaymentComplete, serviceName }: PaymentGateProps) {
  const { isConnected, address, chain, connector } = useAccount();
  const { connectors, connectAsync, isPending: isConnecting } = useConnect();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [pendingAction, setPendingAction] = useState<"musd" | "btc" | null>(null);
  const [paid, setPaid] = useState(false);
  const [txSent, setTxSent] = useState(false);

  const { writeContract, data: musdHash, isPending: musdPending } = useWriteContract();
  const { isLoading: musdConfirming, isSuccess: musdSuccess } = useWaitForTransactionReceipt({ hash: musdHash });

  const { sendTransaction, data: btcHash, isPending: btcPending } = useSendTransaction();
  const { isLoading: btcConfirming, isSuccess: btcSuccess } = useWaitForTransactionReceipt({ hash: btcHash });

  const executeMUSDPayment = () => {
    setTxSent(true);
    writeContract({
      address: MUSD_CONTRACT,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [TREASURY_ADDRESS, BigInt(MUSD_PAYMENT_AMOUNT)],
    });
  };

  const executeBTCPayment = () => {
    setTxSent(true);
    sendTransaction({
      to: TREASURY_ADDRESS,
      value: parseEther(BTC_PAYMENT_DISPLAY),
    });
  };

  const startPayment = async (method: "musd" | "btc") => {
    setPendingAction(method);
    setTxSent(false);

    try {
      if (!isConnected) {
        const injectedConnector =
          connectors.find((item) => item.type === "injected") ??
          connectors.find((item) => /meta|rabby|coinbase|wallet|browser/i.test(item.name));

        if (injectedConnector) {
          await connectAsync({ connector: injectedConnector, chainId: mezoTestnet.id });
          return;
        }

        openConnectModal?.();
        return;
      }

      if (chain?.id !== mezoTestnet.id) {
        await switchChainAsync({ chainId: mezoTestnet.id });
        return;
      }

      if (method === "musd") executeMUSDPayment();
      else executeBTCPayment();
    } catch (error) {
      setPendingAction(null);
      setTxSent(false);
      toast.error("Wallet connection or chain switch was cancelled.");
    }
  };

  useEffect(() => {
    if (!pendingAction || !isConnected || txSent) return;

    let cancelled = false;

    const resumePayment = async () => {
      try {
        if (chain?.id !== mezoTestnet.id) {
          await switchChainAsync({ chainId: mezoTestnet.id });
          return;
        }

        if (cancelled) return;

        if (pendingAction === "musd") executeMUSDPayment();
        else executeBTCPayment();
      } catch (error) {
        if (!cancelled) {
          setPendingAction(null);
          setTxSent(false);
          toast.error("Please connect your wallet on Mezo Matsnet to continue.");
        }
      }
    };

    void resumePayment();

    return () => {
      cancelled = true;
    };
  }, [pendingAction, isConnected, chain?.id, txSent, switchChainAsync]);

  useEffect(() => {
    if (musdSuccess || btcSuccess) {
      setPaid(true);
      setPendingAction(null);
      const timer = setTimeout(() => onPaymentComplete(), 1500);
      return () => clearTimeout(timer);
    }
  }, [musdSuccess, btcSuccess, onPaymentComplete]);

  const isProcessing =
    isConnecting || isSwitchingChain || musdPending || btcPending || musdConfirming || btcConfirming;
  const paymentTxHash = musdHash || btcHash;
  const activePaymentLabel = pendingAction === "musd" ? `${MUSD_PAYMENT_DISPLAY} MUSD` : `${BTC_PAYMENT_DISPLAY} BTC`;

  return (
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
            Clicking pay now forces wallet connect first, then opens wallet confirmation on Mezo Matsnet.
          </p>
        </div>

        {isConnected && (
          <div className="p-3 rounded-lg border border-success/30 bg-success/5 flex items-center gap-2 text-left">
            <CheckCircle className="h-4 w-4 text-success shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-foreground font-medium truncate">
                Connected with {connector?.name || "Wallet"}
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate">
                {shortenAddress(address)} · {chain?.name || "Unknown network"}
              </div>
            </div>
          </div>
        )}

        {paid ? (
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
                ? "Opening wallet connection..."
                : isSwitchingChain
                  ? "Switching to Mezo Matsnet..."
                  : musdPending || btcPending
                    ? "Confirm transaction in your wallet..."
                    : "Waiting for on-chain confirmation..."}
            </div>
            <div className="text-xs text-muted-foreground">Preparing {activePaymentLabel} payment to treasury</div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button onClick={() => void startPayment("musd")} className="w-full gap-2 h-12 text-base" variant="default">
              <Coins className="h-5 w-5" />
              Pay with MUSD — {MUSD_PAYMENT_DISPLAY} MUSD
            </Button>
            <Button onClick={() => void startPayment("btc")} className="w-full gap-2 h-12 text-base" variant="outline">
              <Wallet className="h-5 w-5" />
              Pay with BTC — {BTC_PAYMENT_DISPLAY} BTC
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Transactions are signed in the connected wallet app and results unlock only after confirmed payment.
        </p>
      </div>
    </motion.div>
  );
}
