import { Shield } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";

interface MezoPassportButtonProps {
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function MezoPassportButton({
  size = "default",
  className = "",
}: MezoPassportButtonProps) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        if (!mounted) return null;

        if (account && chain) {
          return (
            <div className={`flex items-center gap-2 ${className}`.trim()}>
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">
                  {account.displayName}
                </span>
              </div>
            </div>
          );
        }

        return (
          <Button
            type="button"
            size={size}
            variant="secondary"
            className={`gap-2 ${className}`.trim()}
            onClick={openConnectModal}
          >
            <Shield className="h-4 w-4" />
            Connect via Mezo Passport
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}
