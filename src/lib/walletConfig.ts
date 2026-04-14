import { createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";

export const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Matsnet",
  nativeCurrency: { name: "BTC", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.test.mezo.org"] },
  },
  blockExplorers: {
    default: { name: "Mezo Explorer", url: "https://explorer.test.mezo.org" },
  },
  testnet: true,
});

export const MUSD_CONTRACT = "0x94FF830F078eb9c6e77bADe29FB46B1a249A5fd3" as const;
export const MUSD_PAYMENT_AMOUNT = "200000000000000000" as const;
export const MUSD_PAYMENT_DISPLAY = "0.2";
export const BTC_PAYMENT_DISPLAY = "0.0002";
export const TREASURY_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

export const WALLETCONNECT_PROJECT_ID = "696956c426d467cb2aed00d4b0a543b";

export const ORACLE_FEEDS = [
  {
    id: "0x0617a9b725011a126a2b9fd53563f4236501f32cf76d877644b943394606c6de",
    pair: "MUSD/USD",
    label: "MUSD",
  },
  {
    id: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    pair: "BTC/USD",
    label: "BTC",
  },
  {
    id: "0x2817d7bfe5c64b8ea956e9a26f573ef64e72e4d7891f2d6af9bcc93f7aff9a97",
    pair: "cbBTC/USD",
    label: "cbBTC",
  },
] as const;

export const config = createConfig({
  chains: [mezoTestnet],
  connectors: [
    injected(),
    walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  ],
  transports: {
    [mezoTestnet.id]: http("https://rpc.test.mezo.org"),
  },
});
