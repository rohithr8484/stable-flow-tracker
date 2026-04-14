import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { PassportProvider } from "@mezo-org/passport";
import { config } from "@/lib/walletConfig";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#F7931A", borderRadius: "medium" })}>
          <PassportProvider environment="testnet">
            {children}
          </PassportProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
