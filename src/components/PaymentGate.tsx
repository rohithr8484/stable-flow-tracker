import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
import { parseEther, encodeFunctionData } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Wallet, Coins, Loader2, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MUSD_CONTRACT, TREASURY_ADDRESS, PAYMENT_AMOUNT, PAYMENT_AMOUNT_DISPLAY } from "@/lib/walletConfig";

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
  const [paymentMethod, setPaymentMethod] = useState<"musd" | "btc" | null>(null);
  const [paid, setPaid] = useState(false);

  // MUSD ERC20 transfer
  const { writeContract, data: musdHash, isPending: musdPending } = useWriteContract();
  const { isLoading: musdConfirming, isSuccess: musdSuccess } = useWaitForTransactionReceipt({ hash: musdHash });

  // BTC native transfer
  const { sendTransaction, data: btcHash, isPending: btcPending } = useSendTransaction();
  const { isLoading: btcConfirming, isSuccess: btcSuccess } = useWaitForTransactionReceipt({ hash: btcHash });

  const handlePayMUSD = () => {
    setPaymentMethod("musd");
    writeContract({
      address: MUSD_CONTRACT,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [TREASURY_ADDRESS, BigInt(PAYMENT_AMOUNT)],
    });
  };

  const handlePayBTC = () => {
    setPaymentMethod("btc");
    sendTransaction({
      to: TREASURY_ADDRESS,
      value: parseEther(PAYMENT_AMOUNT_DISPLAY),
    });
  };

  const isProcessing = musdPending || btcPending || musdConfirming || btcConfirming;
  const isSuccess = musdSuccess || btcSuccess;

  if (isSuccess && !paid) {
    setPaid(true);
    setTimeout(() => onPaymentComplete(), 1500);
  }

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
            Connect your wallet and pay {PAYMENT_AMOUNT_DISPLAY} MUSD or {PAYMENT_AMOUNT_DISPLAY} BTC to access{" "}
            <span className="text-foreground font-medium">{serviceName}</span>.
          </p>
        </div>

        {/* Step 1: Connect Wallet */}
        <div className={`p-4 rounded-lg border ${isConnected ? "border-success/30 bg-success/5" : "border-border bg-secondary/30"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isConnected ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"}`}>
              {isConnected ? <CheckCircle className="h-4 w-4" /> : "1"}
            </div>
            <span className="text-sm font-medium text-foreground">Connect Wallet</span>
          </div>
          {isConnected ? (
            <div className="text-xs text-muted-foreground font-mono truncate">
              Connected: {address}
            </div>
          ) : (
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          )}
        </div>

        {/* Step 2: Pay */}
        <div className={`p-4 rounded-lg border ${!isConnected ? "opacity-50 pointer-events-none border-border bg-secondary/20" : paid ? "border-success/30 bg-success/5" : "border-border bg-secondary/30"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${paid ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"}`}>
              {paid ? <CheckCircle className="h-4 w-4" /> : "2"}
            </div>
            <span className="text-sm font-medium text-foreground">Pay to Access</span>
          </div>

          {paid ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-success text-sm font-medium flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" /> Payment confirmed! Redirecting...
            </motion.div>
          ) : isProcessing ? (
            <div className="flex items-center justify-center gap-2 text-primary text-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
              {(musdPending || btcPending) ? "Confirm in your wallet..." : "Waiting for confirmation..."}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handlePayMUSD} disabled={!isConnected} className="flex-1 gap-2" variant="default">
                <Coins className="h-4 w-4" />
                Pay {PAYMENT_AMOUNT_DISPLAY} MUSD
              </Button>
              <Button onClick={handlePayBTC} disabled={!isConnected} className="flex-1 gap-2" variant="outline">
                <Wallet className="h-4 w-4" />
                Pay {PAYMENT_AMOUNT_DISPLAY} BTC
              </Button>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Payments are processed on Mezo Matsnet. Ensure you have sufficient balance.
        </p>
      </div>
    </motion.div>
  );
}
