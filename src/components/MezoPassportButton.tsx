import { ConnectButton } from "@rainbow-me/rainbowkit";

interface MezoPassportButtonProps {
  className?: string;
}

export default function MezoPassportButton({ className = "" }: MezoPassportButtonProps) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div className={className}>
            {!connected ? (
              <button
                onClick={openConnectModal}
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                Connect via Mezo Passport
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openChainModal}
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {chain.name}
                </button>
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/5 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-success/10"
                >
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
