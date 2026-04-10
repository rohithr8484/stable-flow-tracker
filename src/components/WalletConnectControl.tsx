import { ConnectButton } from "@rainbow-me/rainbowkit";

interface WalletConnectControlProps {
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
}

export default function WalletConnectControl({
  className = "",
}: WalletConnectControlProps) {
  return (
    <div className={className}>
      <ConnectButton />
    </div>
  );
}
