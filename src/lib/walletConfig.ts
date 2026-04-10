import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
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

export const config = createConfig({
  chains: [mezoTestnet],
  connectors: [injected()],
  transports: {
    [mezoTestnet.id]: http("https://rpc.test.mezo.org"),
  },
});
