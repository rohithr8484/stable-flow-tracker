import { getDefaultConfig } from "@rainbow-me/rainbowkit";
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

// MUSD token contract on Mezo testnet
export const MUSD_CONTRACT = "0x637e25b1dD53ECF1c3E3ea9aCE3ACa92eE17150c" as const;
export const PAYMENT_AMOUNT = "200000000000000000" as const; // 0.2 in 18 decimals
export const PAYMENT_AMOUNT_DISPLAY = "0.2";

// Treasury address to receive payments
export const TREASURY_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

export const config = getDefaultConfig({
  appName: "BTC Treasury Management",
  projectId: "696956c426d467cb2aed00d4b0a543b",
  chains: [mezoTestnet],
});
