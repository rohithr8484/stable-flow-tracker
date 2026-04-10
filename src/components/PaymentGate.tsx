import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSendTransaction, useConnect } from "wagmi";
import { parseEther } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Wallet, Coins, Loader2, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MUSD_CONTRACT, TREASURY_ADDRESS, MUSD_PAYMENT_AMOUNT, MUSD_PAYMENT_DISPLAY, BTC_PAYMENT_DISPLAY } from "@/lib/walletConfig";

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

export default function PaymentGate({ onPaymentComplete, serviceName }: PaymentGateProps) {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [pendingAction, setPendingAction] = useState<"musd" | "btc" | null>(null);
  const [paid, setPaid] = useState(false);

  const { writeContract, data: musdHash, isPending: musdPending, reset: resetMusd } = useWriteContract();
  const { isLoading: musdConfirming, isSuccess: musdSuccess } = useWaitForTransactionReceipt({ hash: musdHash });

  const { sendTransaction, data: btcHash, isPending: btcPending, reset: resetBtc } = useSendTransaction();
  const { isLoading: btcConfirming, isSuccess: btcSuccess } = useWaitForTransactionReceipt({ hash: btcHash });

  // When user clicks pay but isn't connected, open connect modal and queue the action
  const handlePayMUSD = () => {
    if (!isConnected) {
      setPendingAction("musd");
      openConnectModal?.();
      return;
    }
    executeMUSDPayment();
  };

  const handlePayBTC = () => {
    if (!isConnected) {
      setPendingAction("btc");
      openConnectModal?.();
      return;
    }
    executeBTCPayment();
  };

  const executeMUSDPayment = () => {
    setPendingAction("musd");
    writeContract({
      address: MUSD_CONTRACT,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [TREASURY_ADDRESS, BigInt(MUSD_PAYMENT_AMOUNT)],
    });
  };

  const executeBTCPayment = () => {
    setPendingAction("btc");
    sendTransaction({
      to: TREASURY_ADDRESS,
      value: parseEther(BTC_PAYMENT_DISPLAY),
    });
  };

  // After wallet connects, auto-trigger the pending payment
  useEffect(() => {
    if (isConnected && pendingAction) {
      const action = pendingAction;
      // Small delay to let wallet connection settle
      const timer = setTimeout(() => {
        if (action === "musd") executeMUSDPayment();
        else executeBTCPayment();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const isProcessing = musdPending || btcPending || musdConfirming || btcConfirming;
  const isSuccess = musdSuccess || btcSuccess;

  if (isSuccess && !paid) {
    setPaid(true);
    setTimeout(() => onPaymentComplete(), 1500);
  }

  const paymentTxHash = musdHash || btcHash;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
      <div className="glass-card p-8 text-center space-y-6">
        <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
          <Shield className="h-10 w-10 text-primary" />
        </div>

        <div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            Payment Required
          </h2>
          <p className="text-sm text-muted-foreground">
            Pay <span className="text-foreground font-semibold">{MUSD_PAYMENT_DISPLAY} MUSD</span> or{" "}
            <span className="text-foreground font-semibold">{BTC_PAYMENT_DISPLAY} BTC</span> to access{" "}
            <span className="text-foreground font-medium">{serviceName}</span>.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Clicking pay will open your wallet for confirmation on Mezo Matsnet (Chain ID: 31611).
          </p>
        </div>

        {/* Wallet status */}
        {isConnected && (
          <div className="p-3 rounded-lg border border-success/30 bg-success/5 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success shrink-0" />
            <span className="text-xs text-muted-foreground font-mono truncate">
              Connected: {address}
            </span>
          </div>
        )}

        {/* Payment state */}
        {paid ? (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="p-6 rounded-lg border border-success/30 bg-success/5 space-y-3">
            <CheckCircle className="h-10 w-10 text-success mx-auto" />
            <div className="text-success text-sm font-semibold">Payment confirmed!</div>
            {paymentTxHash && (
              <div className="text-xs text-muted-foreground font-mono truncate">
                Tx: {paymentTxHash}
              </div>
            )}
            <div className="text-xs text-muted-foreground">Loading results...</div>
          </motion.div>
        ) : isProcessing ? (
          <div className="p-6 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
            <div className="text-primary text-sm font-medium">
              {(musdPending || btcPending) ? "Confirm transaction in your wallet..." : "Waiting for on-chain confirmation..."}
            </div>
            <div className="text-xs text-muted-foreground">
              {pendingAction === "musd" ? `Transferring ${MUSD_PAYMENT_DISPLAY} MUSD` : `Transferring ${BTC_PAYMENT_DISPLAY} BTC`} to treasury
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button onClick={handlePayMUSD} className="w-full gap-2 h-12 text-base" variant="default">
              <Coins className="h-5 w-5" />
              Pay with MUSD — {MUSD_PAYMENT_DISPLAY} MUSD
            </Button>
            <Button onClick={handlePayBTC} className="w-full gap-2 h-12 text-base" variant="outline">
              <Wallet className="h-5 w-5" />
              Pay with BTC — {BTC_PAYMENT_DISPLAY} BTC
            </Button>
            {!isConnected && (
              <p className="text-xs text-muted-foreground">
                Your wallet will be connected automatically when you click pay.
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Transactions are signed via wallet on Mezo Testnet (Chain ID: 31611).
        </p>
      </div>
    </motion.div>
  );
}
