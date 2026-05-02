import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mezoMainnet, mezoTestnet, getDefaultWallets } from "@mezo-org/passport";

export { mezoMainnet, mezoTestnet };

export const SUPPORTED_CHAIN_IDS = [mezoTestnet.id, mezoMainnet.id] as const;
export const PRIMARY_CHAIN = mezoTestnet;

export const WALLETCONNECT_PROJECT_ID = "696956c426d467cb2aed00d4b0a543b";

export const MUSD_CONTRACT = "0x94FF830F078eb9c6e77bADe29FB46B1a249A5fd3" as const;
export const MUSD_PAYMENT_AMOUNT = "200000000000000000" as const;
export const MUSD_PAYMENT_DISPLAY = "0.2";
export const BTC_PAYMENT_DISPLAY = "0.0002";
export const TREASURY_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

// Build a wagmi config that supports BOTH Mezo Matsnet (testnet) and Mezo (mainnet)
// so any user can connect regardless of which Mezo network their wallet is on.
export const config = getDefaultConfig({
  appName: "BTC Treasury",
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [mezoTestnet, mezoMainnet],
  transports: {
    [mezoTestnet.id]: http(mezoTestnet.rpcUrls.default.http[0]),
    [mezoMainnet.id]: http(mezoMainnet.rpcUrls.default.http[0]),
  },
  wallets: getDefaultWallets("testnet"),
  multiInjectedProviderDiscovery: true,
});
